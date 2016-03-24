define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var AppView           = require('common/v3/app/app');
    var VanillaCollection = require('common/collections/vanilla');

    var NuclearPhysicsSimulation        = require('models/simulation');
    var NucleusType                     = require('models/nucleus-type');
    var Hydrogen3CompositeNucleus       = require('models/nucleus/hydrogen-3-composite');
    var Carbon14CompositeNucleus        = require('models/nucleus/carbon-14-composite');
    var LightAdjustableCompositeNucleus = require('models/nucleus/light-adjustable-composite');
    var SubatomicParticle               = require('models/subatomic-particle');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Base simulation model for multi-nucleus decay simulations
     */
    var SingleNucleusBetaDecaySimulation = NuclearPhysicsSimulation.extend({

        defaults: _.extend({}, NuclearPhysicsSimulation.prototype.defaults, {
            nucleusType: Constants.SingleNucleusBetaDecaySimulation.DEFAULT_NUCLEUS_TYPE,
            halfLife: undefined
        }),
        
        initialize: function(attributes, options) {
            this._newNucleusOptions = { simulation: this };

            NuclearPhysicsSimulation.prototype.initialize.apply(this, [attributes, options]);

            this.on('change:nucleusType', this.nucleusTypeChanged);
            this.on('change:halfLife', this.halfLifeChanged);
            this.on('nucleus-change', this.nucleusChanged);
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            this.atomicNucleus = null;

            this.emittedParticles = new VanillaCollection();

            this.nucleusTypeChanged(this, this.get('nucleusType'));
        },

        /**
         * Resets the model components
         */
        resetComponents: function() {
            
        },

        /**
         * Overrides the reset function to make sure the starting attributes aren't
         *   set with the silent flag because we want it to fire the change event.
         */
        reset: function() {
            this.time = 0;
            this.set(this.startingAttributes);
            this.applyOptions(this.startingOptions);
            this.resetComponents();
        },

        /**
         * Runs every frame of the simulation loop.
         */
        _update: function(time, deltaTime) {
            if (this.atomicNucleus)
                this.atomicNucleus.update(time, deltaTime);
            
            // Move any emitted particles that have been produced by decay events.
            for (var i = 0; i < this.emittedParticles.length; i++)
                this.emittedParticles.at(i).update();
        },

        /**
         * Reset the currently active nucleus.
         */
        resetNucleus: function() {
            // Reset the nucleus
            this.atomicNucleus.reset();
            
            // Activate decay right away.
            this.atomicNucleus.activateDecay(this.time);

            this.trigger('nucleus-reset');
        },

        removeCurrentNucleus: function() {
            if (this.atomicNucleus !== null) {
                // Remove listener from current nucleus.
                this.stopListening(this.atomicNucleus);
                
                // Remove the nucleus itself and inform any listeners of its demise.
                this.atomicNucleus = null;
                this.trigger('nucleus-removed');
            }
            
            // Remove any existing emitted particles and also let any listeners know
            //   of their demise.
            this.destroyParticles();
        },

        /**
         * Add a new nucleus of the currently configured type.  This should be
         *   called only when there isn't an existing nucleus.
         */
        addNewNucleus: function() {
            if (this.atomicNucleus !== null) {
                // Since this model supports only one nucleus at a time, adding a
                //   new nucleus means that any existing one must go away.
                console.warn('Warning: Removing existing nucleus before adding new one.');
                this.removeCurrentNucleus();
            }
            
            this.atomicNucleus = this.createNucleus();

            this.set('halfLife', this.atomicNucleus.get('halfLife'), { silent: true });
            
            // In this model, the nucleus is activated (so that it is moving
            //   towards decay) right away.
            this.atomicNucleus.activateDecay(this.time);
            
            // Inform any listeners of the changes.
            this.trigger('nucleus-added', this.atomicNucleus);
        },

        /**
         * Creates and returns a nucleus of the current type
         */
        createNucleus: function() {
            switch (this.get('nucleusType')) {
                case NucleusType.HYDROGEN_3:   return Hydrogen3CompositeNucleus.create(this._newNucleusOptions);
                case NucleusType.CARBON_14:    return Carbon14CompositeNucleus.create(this._newNucleusOptions);
                case NucleusType.LIGHT_CUSTOM: return LightAdjustableCompositeNucleus.create(this._newNucleusOptions);
            }

            throw 'Other nuclei not yet implemented.';
        },

        triggerNucleusChange: function(nucleus, byProducts) {
            this.trigger('nucleus-change', nucleus, byProducts);
        },

        destroyParticles: function() {
            for (var i = this.emittedParticles.length - 1; i >= 0; i--)
                this.emittedParticles.at(i).destroy();
        },

        /**
         * Sets the half life for all nuclei in the model.
         */
        halfLifeChanged: function(simulation, halfLife) {
            // Verify that the current nucleus is custom.
            if (this.get('nucleusType') !== NucleusType.LIGHT_CUSTOM) {
                console.warning('Warning: Can only set half life for custom nucleus, ignoring request.');
                return;
            }

            // Set the new half life value.
            this.atomicNucleus.set('halfLife', halfLife);
            this.resetNucleus();
        },

        /**
         * Called when nucleusType changes. Resets jitter length and adds the max nuclei.
         */
        nucleusTypeChanged: function(simulation, nucleusType) {
            this.removeCurrentNucleus();
            this.addNewNucleus();
        },

        nucleusChanged: function(nucleus, byProducts) {
            if (byProducts) {
                // There are some byproducts of this event that need to be
                //   managed by this object.
                for (var i = 0; i < byProducts.length; i++) {
                    var byProduct = byProducts[i];
                    if (byProduct instanceof SubatomicParticle) {
                        this.emittedParticles.add(byProduct);
                    }
                    else {
                        // We should never get here, debug it if it does.
                        console.error('Error: Unexpected byproduct of decay event.');
                    }
                }
            }
        },

    }, Constants.SingleNucleusBetaDecaySimulation);

    return SingleNucleusBetaDecaySimulation;
});

define(function (require, exports, module) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var Vector2 = require('common/math/vector2');

    var NuclearPhysicsSimulation        = require('models/simulation');
    var NucleusType                     = require('models/nucleus-type');
    var Hydrogen3CompositeNucleus       = require('models/nucleus/hydrogen-3-composite');
    var Carbon14CompositeNucleus        = require('models/nucleus/carbon-14-composite');
    var LightAdjustableCompositeNucleus = require('models/nucleus/light-adjustable-composite');

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
            NuclearPhysicsSimulation.prototype.initialize.apply(this, [attributes, options]);

            this._jitterOffsets = [];
            this._jitterOffsetCount = 0;

            this.on('change:nucleusType', this.nucleusTypeChanged);
            this.on('change:halfLife', this.halfLifeChanged);
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            this.atomicNucleus = null;

            this.emittedParticles = new Backbone.Collection();

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
            this.atomicNucleus.activateDecay();
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
            this.emittedParticles.reset();
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
            switch (this.get('nucleusType')) {
                case NucleusType.HYDROGEN_3:
                    this.atomicNucleus = new Hydrogen3CompositeNucleus();
                    break;
                    
                case NucleusType.CARBON_14:
                    this.atomicNucleus = new Carbon14CompositeNucleus();
                    break;
                    
                case NucleusType.LIGHT_CUSTOM:
                    this.atomicNucleus = new LightAdjustableCompositeNucleus();
                    break;
            }
            
            // Register as a listener for the nucleus so we can handle the
            //   particles thrown off by beta decay.
            this.listenTo(this.atomicNucleus, 'nucleus-changed', this.nucleusChanged);
            
            // In this model, the nucleus is activated (so that it is moving
            //   towards decay) right away.
            this.atomicNucleus.activateDecay();
            
            // Inform any listeners of the changes.
            this.trigger('nucleus-added', this.atomicNucleus);
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

        nucleusChanged: function(nucleus, numProtons, numNeutrons, byProducts) {
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

define(function (require, exports, module) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var Vector2 = require('common/math/vector2');

    var MultiNucleusDecaySimulation    = require('models/simulation/multi-nucleus-decay');
    var NucleusType                    = require('models/nucleus-type');
    var Hydrogen3Nucleus               = require('models/nucleus/hydrogen-3');
    var Carbon14Nucleus                = require('models/nucleus/carbon-14');
    var LightAdjustableHalfLifeNucleus = require('models/nucleus/light-adjustable-half-life');
    var SubatomicParticle              = require('models/subatomic-particle');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Simulation model for multi-nucleus beta-decay simulation
     */
    var MultiNucleusBetaDecaySimulation = MultiNucleusDecaySimulation.extend({

        defaults: _.extend({}, MultiNucleusDecaySimulation.prototype.defaults, {
            nucleusType: Constants.MultiNucleusBetaDecaySimulation.DEFAULT_NUCLEUS_TYPE
        }),

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            MultiNucleusDecaySimulation.prototype.initComponents.apply(this, arguments);

            this.emittedParticles = new Backbone.Collection();

            this.listenTo(this.atomicNuclei, 'nucleus-change', this.nucleusChanged);
        },

        /**
         * Resets the model components
         */
        resetComponents: function() {
            MultiNucleusDecaySimulation.prototype.resetComponents.apply(this, arguments);
        },

        /**
         * Runs every frame of the simulation loop.
         */
        _update: function(time, deltaTime) {
            MultiNucleusDecaySimulation.prototype._update.apply(this, arguments);

            // Move any emitted particles that have been produced by decay events.
            for (var i = 0; i < this.emittedParticles.length; i++)
                this.emittedParticles.at(i).update();
        },

        addMaxNuclei: function() {
            // Create a new nucleus, positioning it in the bucket.
            var inBucketPosX = MultiNucleusDecaySimulation.BUCKET_ORIGIN_X + MultiNucleusDecaySimulation.BUCKET_WIDTH / 2;
            var inBucketPosY = MultiNucleusDecaySimulation.BUCKET_ORIGIN_Y + MultiNucleusDecaySimulation.BUCKET_HEIGHT / 2;

            var newNucleus;
            
            for (var i = 0; i < this.get('maxNuclei'); i++) {
                newNucleus = this.createNucleus();
                newNucleus.setPosition(inBucketPosX, inBucketPosY);
                
                this.atomicNuclei.add(newNucleus);

                this._jitterOffsets[i] = new Vector2();
            }
        },

        /**
         * Creates and returns a nucleus of the current type
         */
        createNucleus: function() {
            switch (this.get('nucleusType')) {
                case NucleusType.HYDROGEN_3: return new Hydrogen3Nucleus();
                case NucleusType.CARBON_14:  return new Carbon14Nucleus();
                case NucleusType.LIGHT_CUSTOM: return new LightAdjustableHalfLifeNucleus();
            }

            throw 'Other nuclei not yet implemented.';
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

        removeAllNuclei: function() {
            MultiNucleusDecaySimulation.prototype.removeAllNuclei.apply(this, arguments);
            
            // Remove any existing emitted particles
            this.emittedParticles.reset();
        }

    }, Constants.MultiNucleusBetaDecaySimulation);

    return MultiNucleusBetaDecaySimulation;
});

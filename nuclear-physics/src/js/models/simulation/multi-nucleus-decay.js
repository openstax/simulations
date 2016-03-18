define(function (require, exports, module) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var Vector2 = require('common/math/vector2');

    var NuclearPhysicsSimulation       = require('models/simulation');
    var NucleusType                    = require('models/nucleus-type');
    var Polonium211Nucleus             = require('models/nucleus/polonium-211');
    var HeavyAdjustableHalfLifeNucleus = require('models/nucleus/heavy-adjustable-half-life');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Base simulation model for multi-nucleus decay simulations
     */
    var MultiNucleusDecaySimulation = NuclearPhysicsSimulation.extend({

        defaults: _.extend(NuclearPhysicsSimulation.prototype.defaults, {
            jitterEnabled: false,
            labelsVisible: false,
            maxNuclei: 1,
            nucleusType: undefined,
            halfLife: undefined
        }),
        
        initialize: function(attributes, options) {
            this._jitterOffsets = [];
            this._jitterOffsetCount = 0;

            NuclearPhysicsSimulation.prototype.initialize.apply(this, [attributes, options]);

            this.on('change:nucleusType', this.nucleusTypeChanged);
            this.on('change:halfLife',    this.halfLifeChanged);
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            this.atomicNuclei = new Backbone.Collection();
            this.nucleusTypeChanged(this, this.get('nucleusType'));
        },

        /**
         * Resets the model components
         */
        resetComponents: function() {
            this.removeAllNuclei();
            this.addMaxNuclei();
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
            // Update all the nuclei
            for (var j = 0; j < this.atomicNuclei.length; j++)
                this.atomicNuclei.at(j).update(time, deltaTime);

            if (this.get('jitterEnabled')) {
                // Cause the active nuclei to "jitter".  For efficiency, not every
                //   active nucleus is moved every time.
                for (var i = this._jitterOffsetCount; i < this.atomicNuclei.length; i += MultiNucleusDecaySimulation.FRAMES_PER_JITTER) {
                    var nucleus = this.atomicNuclei.at(i);
                    if (nucleus.isDecayActive() && !nucleus.isPaused()) {
                        // This nucleus is active, so it should be jittered.
                        var jitterOffset = this._jitterOffsets[i];
                        var currentLocation = nucleus.get('position');
                        if (jitterOffset.x == 0 && jitterOffset.y === 0) {
                            // Move this nucleus away from its center location.
                            this.generateJitterOffset(jitterOffset);
                            nucleus.set(
                                currentLocation.x + jitterOffset.x,
                                currentLocation.y + jitterOffset.y
                            );
                        }
                        else {
                            // Move back to original location.
                            nucleus.setPosition(
                                currentLocation.x - jitterOffset.x,
                                currentLocation.y - jitterOffset.y
                            );
                            this._jitterOffsets[i].setLocation(0, 0);
                        }
                    }
                }
                this._jitterOffsetCount = (this._jitterOffsetCount + 1) % MultiNucleusDecaySimulation.FRAMES_PER_JITTER;
            }
        },

        /**
         * Generate a random 2-dimensional offset for use in "jittering" a point
         *   according to a Guassian distribution and a predefined length.
         */
        generateJitterOffset: function(offset) {
            if (this.maxJitterLength === 0) {
                // Calculate the maximum jitter length for the current nucleus.
                if (this.atomicNuclei.length > 0) {
                    this.maxJitterLength = this.atomicNuclei.first().getDiameter() / 16;
                }
                else {
                    // Shouldn't really get here, but just in case...
                    this.maxJitterLength = MultiNucleusDecaySimulation.DEFAULT_JITTER_LENGTH;
                }
            }

            var length = Math.random() * this.maxJitterLength;
            if (length > MultiNucleusDecaySimulation.DEFAULT_JITTER_LENGTH)
                length = MultiNucleusDecaySimulation.DEFAULT_JITTER_LENGTH;
            
            var angle = Math.random() * Math.PI * 2;
            offset.set(Math.cos(angle) * length, Math.sin(angle) * length);
        },

        /**
         * Reset all nuclei that are either active (meaning that they could decay
         *   at any time) or decayed.
         * 
         * @return - The number of nuclei that are reset.
         */
        resetActiveAndDecayedNuclei: function() {
            var resetCount = 0;
            for (var i = 0; i < this.atomicNuclei.length; i++) {
                var nucleus = this.atomicNuclei.at(i);
                if (nucleus.isDecayActive() || nucleus.hasDecayed()){
                    nucleus.reset();
                    nucleus.activateDecay(this.time);
                    resetCount++;
                }
            }
            return resetCount;
        },

        /**
         * Remove all the existing nuclei and alpha particles from the model.
         */
        removeAllNuclei: function() {
            this.atomicNuclei.reset();
        },

        /**
         * Add the maximum allowed number of nuclei to the model.
         */
        addMaxNuclei: function() {
            var newNucleus;
            for (var i = 0; i < this.get('maxNuclei'); i++) {
                if (this.get('nucleusType') === NucleusType.POLONIUM_211)
                    newNucleus = new Polonium211Nucleus();
                else
                    newNucleus = new HeavyAdjustableHalfLifeNucleus();
                
                this.atomicNuclei.add(newNucleus);
                this._jitterOffsets[i] = new Vector2();
            }
        },

        setHalfLife: function(halfLife) {
            this.set('halfLife', halfLife);
        },

        getHalfLife: function() {
            return this.get('halfLife');
        },
        
        /**
         * Get the current total number of nuclei in the model.
         */
        getTotalNumNuclei: function() {
            return this.atomicNuclei.length;
        },
        
        /**
         * Get the number of decayed nuclei in the model.
         */
        getNumDecayedNuclei: function() {
            var decayCount = 0;
            for (var i = 0; i < this.atomicNuclei.length; i++){
                if (this.atomicNuclei.at(i).hasDecayed())
                    decayCount++;
            }
            return decayCount;
        },
        
        /**
         * Get the number of active nuclei, meaning nuclei that are being clocked
         * and are progressing towards decay.
         */
        getNumActiveNuclei: function() {
            var activeCount = 0;
            for (var i = 0; i < this.atomicNuclei.length; i++){
                if (this.atomicNuclei.at(i).isDecayActive())
                    activeCount++;
            }
            return activeCount;
        },

        /**
         * Sets the half life for all nuclei in the model.
         */
        halfLifeChanged: function(simulation, halfLife) {
            // Verify that the current nucleus is custom.
            if (this.get('nucleusType') !== NucleusType.HEAVY_CUSTOM && this.get('nucleusType') !== NucleusType.LIGHT_CUSTOM) {
                console.warning('Warning: Can only set half life for custom nucleus, ignoring request.');
                return;
            }
            
            // Set the new half life value.
            for (var i = 0; i < this.atomicNuclei.length; i++)
                this.atomicNuclei.at(i).set('halfLife', halfLife);
        },

        /**
         * Called when nucleusType changes. Resets jitter length and adds the max nuclei.
         */
        nucleusTypeChanged: function(simulation, nucleusType) {
            // Add all nuclei to the model.  At the time of this writing, this
            //   is the desired behavior for all subclasses.  It may need to
            //   be modified if a more general approach is needed.
            this.addMaxNuclei();
            
            // Set jitter length to 0 so that it will be set correctly the
            //   next time a jitter offset is generated.
            this.maxJitterLength = 0;
        }

    }, Constants.MultiNucleusDecaySimulation);

    return MultiNucleusDecaySimulation;
});

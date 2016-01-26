define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var NuclearPhysicsSimulation = require('models/simulation');

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
            initialNucleusType: undefined
        }),
        
        initialize: function(attributes, options) {
            NuclearPhysicsSimulation.prototype.initialize.apply(this, [attributes, options]);

            this._jitterOffsets = [];
            this._jitterOffsetCount = 0;
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            this.atomicNuclei = [];

            this.currentNucleusType = this.get('initialNucleusType');

            this.maxJitterLength = 0;
        },

        _update: function(time, deltaTime) {
            if (this.get('jitterEnabled')) {
                // Cause the active nuclei to "jitter".  For efficiency, not every
                //   active nucleus is moved every time.
                for (var i = this._jitterOffsetCount; i < this.atomicNuclei.length; i += MultiNucleusDecaySimulation.FRAMES_PER_JITTER) {
                    var nucleus = this.atomicNuclei[i];
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
                    this.maxJitterLength = this.atomicNuclei[0].getDiameter() / 16;
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
        }

    }, Constants.MultiNucleusDecaySimulation);

    return MultiNucleusDecaySimulation;
});

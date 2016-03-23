define(function (require, exports, module) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var Vector2   = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');

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

            this._nucleusBounds = new Rectangle();

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
            // this.addMaxNuclei();
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
                    if (nucleus.isDecayActive()) {
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
                            this._jitterOffsets[i].set(0, 0);
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
                    this.maxJitterLength = this.atomicNuclei.first().get('diameter') / 16;
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
         * Removes a random nucleus
         */
        removeRandomNucleus: function() {
            if (this.atomicNuclei.length) {
                var randomIndex = Math.floor(Math.random() * this.atomicNuclei.length);
                var nucleus = this.atomicNuclei.at(randomIndex);
                nucleus.destroy();
            }
        },

        /**
         * Add the maximum allowed number of nuclei to the model.
         */
        addMaxNuclei: function() {
            var newNucleus;
            for (var i = 0; i < this.get('maxNuclei'); i++) {
                newNucleus = this.createNucleus();
                this.atomicNuclei.add(newNucleus);
                this._jitterOffsets[i] = new Vector2();
            }
        },

        /**
         * Adds and activates a new nucleus at the specified point.
         *
         * Note: I made this as an alternative to using addMaxNuclei. For my
         *   purposes this is much simpler, but we should also get the added
         *   performance benefit of not adding the nuclei until we need them,
         *   which would eliminate the lag problem in the original that can
         *   occur when switching quickly between nucleus types.
         */
        addNucleusAt: function(x, y) {
            // Don't create one if we've already reached the max nuclei count
            if (this.atomicNuclei.length >= this.get('maxNuclei'))
                return;

            var newNucleus = this.createNucleus();
            newNucleus.setPosition(x, y);
            
            this.atomicNuclei.add(newNucleus);

            this._jitterOffsets.push(new Vector2());

            // Just activate it, because it's already where we want it
            newNucleus.activateDecay(this.time);
        },

        createNucleus: function() {
            switch (this.get('nucleusType')) {
                case NucleusType.POLONIUM_211: return new Polonium211Nucleus();
                case NucleusType.HEAVY_CUSTOM: return new HeavyAdjustableHalfLifeNucleus();
            }

            throw 'Other nuclei not yet implemented.';
        },

        setHalfLife: function(halfLife) {
            this.set('halfLife', halfLife);
        },

        getHalfLife: function() {
            return this.get('halfLife');
        },

        setNucleusBounds: function(x, y, width, height) {
            this._nucleusBounds.set(x, y, width, height);
        },

        getNucleusBounds: function(x, y, width, height) {
            return this._nucleusBounds;
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
            // this.addMaxNuclei();
            this.removeAllNuclei();
            
            // Set jitter length to 0 so that it will be set correctly the
            //   next time a jitter offset is generated.
            this.maxJitterLength = 0;
        }

    }, Constants.MultiNucleusDecaySimulation);

    return MultiNucleusDecaySimulation;
});

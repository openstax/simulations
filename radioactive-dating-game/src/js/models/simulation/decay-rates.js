define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Rectangle = require('common/math/rectangle');

    var MultiNucleusDecaySimulation    = require('models/simulation/multi-nucleus-decay');
    var NucleusType                    = require('models/nucleus-type');
    var Carbon14Nucleus                = require('models/nucleus/carbon-14');
    var Uranium238Nucleus              = require('models/nucleus/uranium-238');

    /**
     * Constants
     */
    var Constants = require('constants');

    var PLACEMENT_LOCATION_SEARCH_COUNT    = Constants.DecayRatesSimulation.PLACEMENT_LOCATION_SEARCH_COUNT;
    var DEFAULT_MIN_INTER_NUCLEUS_DISTANCE = Constants.DecayRatesSimulation.DEFAULT_MIN_INTER_NUCLEUS_DISTANCE;

    /**
     * Simulation model for multi-nucleus radioactive-dating-game simulation
     */
    var DecayRatesSimulation = MultiNucleusDecaySimulation.extend({

        defaults: _.extend({}, MultiNucleusDecaySimulation.prototype.defaults, {
            nucleusType: Constants.DecayRatesSimulation.DEFAULT_NUCLEUS_TYPE,
            maxNuclei:   Constants.DecayRatesSimulation.MAX_NUCLEI,
            jitterEnabled: false,
            active: true
        }),

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            this._newCarbonNucleusOptions = _.extend({}, this._newNucleusOptions, {
                enlarged: true
            });

            MultiNucleusDecaySimulation.prototype.initComponents.apply(this, arguments);
        },

        setNucleusBounds: function(x, y, width, height) {
            MultiNucleusDecaySimulation.prototype.setNucleusBounds.apply(this, arguments);

            var padding = DEFAULT_MIN_INTER_NUCLEUS_DISTANCE;
            this._nucleusBounds.x += padding;
            this._nucleusBounds.y += padding;
            this._nucleusBounds.w -= padding * 2;
            this._nucleusBounds.h -= padding * 2;
        },

        setCanisterBounds: function(bounds) {
            var padding = DEFAULT_MIN_INTER_NUCLEUS_DISTANCE;
            this.canisterAreaRect = new Rectangle(bounds);
            this.canisterAreaRect.x -= padding;
            this.canisterAreaRect.y -= padding;
            this.canisterAreaRect.w += padding * 2;
            this.canisterAreaRect.h += padding * 2;
        },

        /**
         * Creates and returns a nucleus of the current type
         */
        createNucleus: function() {
            switch (this.get('nucleusType')) {
                case NucleusType.CARBON_14:    return Carbon14Nucleus.create(this._newCarbonNucleusOptions);
                case NucleusType.URANIUM_238:  return Uranium238Nucleus.create(this._newNucleusOptions);
            }

            throw 'Other nuclei not yet implemented.';
        },

        triggerNucleusChange: function(nucleus, byProducts) {},

        resetActiveAndDecayedNuclei: function() {
            this.resetNuclei();
            this.activateNuclei();
            this.trigger('nuclei-reset');
        },

        /**
         * Reset the time back to 0 and resets decay for all nuclei.
         */
        resetNuclei: function() {
            this.time = 0;

            for (var i = 0; i < this.atomicNuclei.length; i++) {
                this.atomicNuclei.at(i).reset();
            }
        },

        activateNuclei: function() {
            for (var i = 0; i < this.atomicNuclei.length; i++) {
                this.atomicNuclei.at(i).activateDecay(0);
            }
        },

        addNewNucleus: function(){
            var x;
            var y;

            var pointAvailable = false;
            var atomicNuclei = this.atomicNuclei;
            var bounds = this._nucleusBounds;
            var canisterAreaRect = this.canisterAreaRect;
            
            // Determine the minimum placement distance between nuclei.
            var minInterNucleusDistance = DEFAULT_MIN_INTER_NUCLEUS_DISTANCE;
            
            if (atomicNuclei.length > 0 ) {
                // Calculate a minimum distance between nuclei based on the
                //   diameter of the current nucleus.
                minInterNucleusDistance = Math.min(
                    atomicNuclei.at(0).get('diameter') * 1.5,
                    DEFAULT_MIN_INTER_NUCLEUS_DISTANCE
                );
            }

            var minInterNucleusDistanceSq = minInterNucleusDistance * minInterNucleusDistance;
            
            // Pick random locations until one is found that works or until we've
            // tried the maximum number of times.
            for (var i = 0; i < 4; i++){
                for (var j = 0; j < PLACEMENT_LOCATION_SEARCH_COUNT / 4; j++){
                    // Randomly select an x & y position
                    x = bounds.x + bounds.w * Math.random();
                    y = bounds.y + bounds.h * Math.random();
                    
                    // Check if this point is available.
                    pointAvailable = true;
                    for (var k = 0; (k < atomicNuclei.length) && (pointAvailable === true); k++){
                        var nucleus = atomicNuclei.at(k);
                        if (nucleus.getPosition().distanceSq(x, y) < minInterNucleusDistanceSq ||
                            canisterAreaRect.contains(x, y)
                        ){
                            // This point is not available.
                            pointAvailable = false;
                        }
                    }
                    
                    if (pointAvailable) {
                        // We have found a usable location.
                        break;
                    }
                }
                if (pointAvailable) {
                    break;
                }
                else {
                    // Try again, but lower our standards.
                    minInterNucleusDistance = minInterNucleusDistance / 2;
                    minInterNucleusDistanceSq = minInterNucleusDistance * minInterNucleusDistance;
                }
            }
            
            if (!pointAvailable) {
                // The random algorithm failed to find an open location, so pick a
                //   random location that is outside of the holding area.
                console.warn('Warning: Using arbitrary location because no open location found.');

                do {
                    x = bounds.x + bounds.w * Math.random();
                    y = bounds.y + bounds.h * Math.random();
                } while (canisterAreaRect.contains(x, y));
            }
            
            this.addNucleusAt(x, y);
        },

        addNucleusAt: function(x, y) {
            // Don't create one if we've already reached the max nuclei count
            if (this.atomicNuclei.length >= this.get('maxNuclei'))
                return;

            var newNucleus = this.createNucleus();
            newNucleus.setPosition(x, y);
            
            this.atomicNuclei.add(newNucleus);
        },

        _update: function(time, deltaTime) {
            if (this.get('active'))
                MultiNucleusDecaySimulation.prototype._update.apply(this, arguments);
        },

        /**
         * Convert a value representing simulation time to the corresponding
         * adjusted value according to the nucleus (which may be as much as
         * billions of years).
         * 
         * @param simTime
         */
        convertSimTimeToAdjustedTime: function(simTime) {
            var conversionFactor = 1;
            if (this.atomicNuclei.length > 1)
                conversionFactor = this.atomicNuclei.at(0).get('decayTimeScalingFactor');
            else
                console.error('Warning: No nuclei available to provide conversion factor.');

            return simTime / conversionFactor;
        },

        getAdjustedTime: function() {
            return this.convertSimTimeToAdjustedTime(this.time);
        }

    }, Constants.DecayRatesSimulation);

    return DecayRatesSimulation;
});

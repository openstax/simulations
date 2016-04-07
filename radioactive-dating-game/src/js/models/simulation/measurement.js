define(function (require, exports, module) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var Vector2 = require('common/math/vector2');

    var ItemDatingSimulation   = require('radioactive-dating-game/models/simulation/item-dating');
    var RadiometricDatingMeter = require('radioactive-dating-game/models/radiometric-dating-meter');
    var FlyingRock             = require('radioactive-dating-game/models/datable-item/flying-rock');
    var AgingRock              = require('radioactive-dating-game/models/datable-item/aging-rock');
    var Volcano                = require('radioactive-dating-game/models/datable-item/volcano');
    var AnimatedDatableItem    = require('radioactive-dating-game/models/datable-item/animated');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Simulation model for multi-nucleus radioactive-dating-game simulation
     */
    var MeasurementSimulation = ItemDatingSimulation.extend({

        defaults: _.extend({}, ItemDatingSimulation.prototype.defaults, {
            mode: Constants.MeasurementSimulation.MODE_TREE
        }),

        /**
         * Initializes the models used in the simulation
         */
        initialize: function(attributes, options) {
            ItemDatingSimulation.prototype.initialize.apply(this, [attributes, options]);

            this.on('change:mode', this.modeChanged);
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            ItemDatingSimulation.prototype.initComponents.apply(this, arguments);

            this.items = new Backbone.Collection();
            this.flyingRocks = new Backbone.Collection();

            this.meter = new RadiometricDatingMeter();

            this.volcano = new Volcano({
                position: MeasurementSimulation.VOLCANO_POSITION,
                width: MeasurementSimulation.VOLCANO_WIDTH,
                height: MeasurementSimulation.VOLCANO_HEIGHT,
                timeConversionFactor: MeasurementSimulation.INITIAL_ROCK_AGING_RATE
            });
        },

        /**
         * Resets the model components
         */
        resetComponents: function() {
            ItemDatingSimulation.prototype.resetComponents.apply(this, arguments);
        },

        resetRockMode: function() {
            // Reset sim time
            this.time = 0;
            // Clear rocks
            this.flyingRocks.reset();
            // Clear aging rock
            if (this.agingRock)
                this.agingRock.destroy();
            this.agingRock = null;
            // Reset volcano and add it to items
            this.volcano.reset();
            this.items.add(this.volcano);
            // Set the position of the meter to where the rock will be
            this.meter.setPosition(AgingRock.FINAL_X, AgingRock.FINAL_Y);
            // Reset counters and flags
            this._volcanoErupting = false;
            this._rockCooling = false;
            this._rockEmissionCounter = MeasurementSimulation.FLYING_ROCK_START_EMISSION_TIME;
            this._timeAccelerationCount = 0;
        },

        /**
         * Runs every frame of the simulation loop.
         */
        _update: function(time, deltaTime) {
            if (this.get('mode') === MeasurementSimulation.MODE_ROCK)
                this.updateRockMode(time, deltaTime);
            else
                this.updateTreeMode(time, deltaTime);

            this.meter.determineItemBeingTouched(this.items.models);
        },

        updateTreeMode: function(time, deltaTime) {

        },

        updateRockMode: function(time, deltaTime) {
            var i;

            if (this._volcanoErupting) {
                if (this.time <= MeasurementSimulation.FLYING_ROCK_END_EMISSION_TIME) {
                    this._rockEmissionCounter -= deltaTime;
                    if (this._rockEmissionCounter <= 0) {
                        // Create a new flying rock
                        var rock = new FlyingRock({
                            position: MeasurementSimulation.VOLCANO_TOP_POSITION,
                            width: MeasurementSimulation.FLYING_ROCK_WIDTH,
                            timeConversionFactor: MeasurementSimulation.INITIAL_ROCK_AGING_RATE
                        });
                        
                        this.flyingRocks.add(rock);

                        this._rockEmissionCounter += this.getRockEmissionInterval();
                    }
                }

                if (this.time >= MeasurementSimulation.AGING_ROCK_EMISSION_TIME && !this.agingRock) {
                    // Create the aging rock
                    this.agingRock = new AgingRock({
                        position: MeasurementSimulation.VOLCANO_TOP_POSITION, 
                        width: MeasurementSimulation.INITIAL_AGING_ROCK_WIDTH,
                        timeConversionFactor: MeasurementSimulation.INITIAL_ROCK_AGING_RATE
                    });
                    this.items.add(this.agingRock);
                    this.listenTo(this.agingRock, 'change:closureState', this.agingRockClosureStateChanged);
                    this.trigger('aging-rock-emitted');
                }

                if (this.time >= MeasurementSimulation.ERUPTION_END_TIME) {
                    this._volcanoErupting = false;
                    this._rockCooling = true;
                    this.trigger('eruption-end');
                }
            }

            if (this._timeAccelerationCount > 0) {
                
                // The rate at which time is passing for the datable objects
                //   is changing.  Make the necessary adjustments.
                var incrementCount = MeasurementSimulation.TIME_ACC_COUNTER_RESET_VAL - this._timeAccelerationCount;
                var agingRate = this.agingRock.get('timeConversionFactor'); // Assume all aging at same rate.
                
                // Calculate the new aging rate.  This is non-linear, because
                // linear was tried and it didn't look good.
                var newAgingRate = Math.min(
                    agingRate + Math.pow(2, incrementCount) * MeasurementSimulation.TIME_ACC_INCREMENT,
                    MeasurementSimulation.FINAL_ROCK_AGING_RATE
                );
                
                for (i = 0; i < this.items.length; i++) {
                    // Set the new aging rate.
                    this.items.at(i).set('timeConversionFactor', newAgingRate);
                }
                
                this._timeAccelerationCount--;
            }

            // Update the models
            for (i = 0; i < this.items.length; i++)
                this.items.at(i).update(time, deltaTime);

            for (i = 0; i < this.flyingRocks.length; i++)
                this.flyingRocks.at(i).update(time, deltaTime);
        },

        getRockEmissionInterval: function() {
            var baseInterval = MeasurementSimulation.FLYING_ROCK_EMISSION_INTERVAL;
            var deviationWindow = MeasurementSimulation.FLYING_ROCK_EMISSION_INTERVAL * MeasurementSimulation.FLYING_ROCK_EMISSION_DEVIATION;
            return baseInterval + (Math.random() * baseInterval - baseInterval / 2);
        },

        getAdjustedTime: function() {
            if (this.get('mode') === MeasurementSimulation.MODE_TREE) {
                // Return the tree's getTotalAge()
            }
            else {
                // Return the volcano's getTotalAge()
                return this.volcano.getTotalAge();
            }
            return this.time;
        },

        eruptVolcano: function() {
            this.resetRockMode();
            this._volcanoErupting = true;
            this.trigger('eruption-start');
        },

        resetVolcano: function() {
            this.resetRockMode();
            this.trigger('eruption-end');
            this.trigger('reset');
        },

        forceClosure: function() {
            if (this.get('mode') === MeasurementSimulation.MODE_TREE) {
                if (this.tree)
                    this.tree.forceClosure();
            }
            else {
                if (this.agingRock)
                    this.agingRock.forceClosure();
            }
        },

        modeChanged: function(simulation, mode) {
            // Clear datable items
            this.items.reset();

            if (mode === MeasurementSimulation.MODE_TREE) {

            }
            else {
                this.resetRockMode();
            }
        },

        agingRockClosureStateChanged: function(item, closureState) {
            if (closureState === AnimatedDatableItem.CLOSED) {
                // Once closure occurs for the aging rock, the time scale speeds up.
                this._timeAccelerationCount = MeasurementSimulation.TIME_ACC_COUNTER_RESET_VAL;    
            }
            
            this.volcano.set('closureState', closureState);
        }

    }, Constants.MeasurementSimulation);

    return MeasurementSimulation;
});

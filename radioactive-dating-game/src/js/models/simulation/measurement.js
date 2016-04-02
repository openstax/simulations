define(function (require, exports, module) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var Vector2 = require('common/math/vector2');

    var ItemDatingSimulation = require('radioactive-dating-game/models/simulation/item-dating');

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
        initComponents: function() {
            ItemDatingSimulation.prototype.initComponents.apply(this, arguments);

            this.items = new Backbone.Collection();
        },

        /**
         * Resets the model components
         */
        resetComponents: function() {
            ItemDatingSimulation.prototype.resetComponents.apply(this, arguments);
        },

        /**
         * Runs every frame of the simulation loop.
         */
        _update: function(time, deltaTime) {
            if (this.get('mode') === MeasurementSimulation.MODE_ROCK)
                this.updateRockMode(time, deltaTime);
            else
                this.updateTreeMode(time, deltaTime);
        },

        updateTreeMode: function(time, deltaTime) {

        },

        updateRockMode: function(time, deltaTime) {
            if (this._volcanoErupting) {
                if (this.time <= MeasurementSimulation.FLYING_ROCK_END_EMISSION_TIME) {
                    this._rockEmissionCounter -= deltaTime;
                    if (this._rockEmissionCounter <= 0) {
                        console.log('emit rock');
                        this._rockEmissionCounter += this.getRockEmissionInterval();
                    }
                }

                if (this.time >= MeasurementSimulation.ERUPTION_END_TIME) {
                    this._volcanoErupting = false;
                    this._rockCooling = true;
                    this.trigger('eruption-end');
                }
            }
            else if (this._rockCooling) {

            }
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
            }
            return this.time;
        },

        eruptVolcano: function() {
            this.time = 0;
            this._volcanoErupting = true;
            this._rockCooling = false;
            this._rockEmissionCounter = MeasurementSimulation.FLYING_ROCK_START_EMISSION_TIME;
            this.trigger('eruption-start');
        },

        modeChanged: function(simulation, mode) {

        }

    }, Constants.MeasurementSimulation);

    return MeasurementSimulation;
});

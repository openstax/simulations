define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Vector2           = require('common/math/vector2');
    var VanillaCollection = require('common/collections/vanilla');

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
            
        }),

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            ItemDatingSimulation.prototype.initComponents.apply(this, arguments);
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
            
        }

    }, Constants.MeasurementSimulation);

    return MeasurementSimulation;
});

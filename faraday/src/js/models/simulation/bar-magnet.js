define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var FaradaySimulation = require('models/simulation');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Simulation model for the bar magnet tab
     */
    var BarMagnetSimulation = FaradaySimulation.extend({

        defaults: _.extend(FaradaySimulation.prototype.defaults, {

        }),
        
        initialize: function(attributes, options) {
            FaradaySimulation.prototype.initialize.apply(this, [attributes, options]);

        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            FaradaySimulation.prototype.initComponents.apply(this, arguments);

            
        },

        _update: function(time, deltaTime) {
            
        }

    }, Constants.BarMagnetSimulation);

    return BarMagnetSimulation;
});

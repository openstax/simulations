define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var FixedIntervalSimulation = require('common/simulation/fixed-interval-simulation');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Wraps the update function in 
     */
    var FaradaySimulation = FixedIntervalSimulation.extend({

        defaults: _.extend(FixedIntervalSimulation.prototype.defaults, {

        }),
        
        initialize: function(attributes, options) {
            options = _.extend({
                framesPerSecond:   Constants.CLOCK_FRAME_RATE,
                deltaTimePerFrame: Constants.CLOCK_DELAY
            }, options);

            FixedIntervalSimulation.prototype.initialize.apply(this, [attributes, options]);

        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            
        },

        _update: function(time, deltaTime) {
            
        }

    });

    return FaradaySimulation;
});

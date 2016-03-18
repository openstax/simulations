define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var FixedIntervalSimulation = require('common/simulation/fixed-interval-simulation');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Base simulation model for nuclear physics
     */
    var NuclearPhysicsSimulation = FixedIntervalSimulation.extend({

        defaults: _.extend({}, FixedIntervalSimulation.prototype.defaults, {

        }),
        
        initialize: function(attributes, options) {
            options = _.extend({
                framesPerSecond: Constants.FRAME_RATE,
                deltaTimePerFrame: Constants.DELTA_TIME_PER_FRAME
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

    return NuclearPhysicsSimulation;
});

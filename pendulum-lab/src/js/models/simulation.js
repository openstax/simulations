define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Simulation = require('common/simulation/simulation');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * The simulation model
     */
    var PendulumLabSimulation = Simulation.extend({

        defaults: {
            units : {
                time : 'sec'
            }
        },

        initialize: function(attributes, options) {
            Simulation.prototype.initialize.apply(this, [attributes, options]);

            this.initComponents();
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {


        },

        _update: function(time, deltaTime) {
            
        }

    });

    return PendulumLabSimulation;
});

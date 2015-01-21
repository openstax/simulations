define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Simulation = require('common/simulation/simulation');

    /**
     * Constants
     */

    /**
     * Wraps the update function in
     */
    var VectorAdditionSimulation = Simulation.extend({

        /**
         * Initialization code for moving man simulation models
         */
        initialize: function(attributes, options) {
            Simulation.prototype.initialize.apply(this, [attributes, options]);
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {

        }

    });

    return VectorAdditionSimulation;
});

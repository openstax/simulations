define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Simulation = require('common/simulation/simulation');

    /**
     * Wraps the update function in 
     */
    var CapacitorLabSimulation = Simulation.extend({

        defaults: _.extend(Simulation.prototype.defaults, {
            circuit: null
        }),
        
        initialize: function(attributes, options) {
            Simulation.prototype.initialize.apply(this, [attributes, options]);

        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            
        },

        /**
         * The model attributes are really simple, and there's no time,
         *   so it's best to simplify the reset function as well.
         */
        reset: function() {
            this.resetComponents();
        },

        _update: function(time, deltaTime) {
            
        }

    });

    return CapacitorLabSimulation;
});

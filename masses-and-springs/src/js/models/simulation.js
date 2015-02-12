define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Simulation = require('common/simulation/simulation');


    var Spring  = require('models/spring');

    /**
     * Constants
     */
    var Constants = require('constants');

    var SPRINGS = [
        new Spring({x : 0.15, y1: 0.1}),
        new Spring({x : 0.30, y1: 0.1}),
        new Spring({x : 0.45, y1: 0.1})
    ];

    /**
     * Wraps the update function in 
     */
    var MassesAndSpringsSimulation = Simulation.extend({

        defaults: _.extend(Simulation.prototype.defaults, {

        }),
        
        initialize: function(attributes, options) {
            Simulation.prototype.initialize.apply(this, [attributes, options]);

            this.initComponents();
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {

            this.initSprings();
        },

        initSprings: function(){

            this.springs = SPRINGS;
        },

        _update: function(time, deltaTime) {
            
        }

    });

    return MassesAndSpringsSimulation;
});

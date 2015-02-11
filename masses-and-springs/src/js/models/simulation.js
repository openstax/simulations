define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Simulation = require('common/simulation/simulation');


    var Spring  = require('models/spring');

    /**
     * Constants
     */
    var Constants = require('constants');

    var w = 960;
    var h = 620;

    var SPRINGS = [
        new Spring({x : 0.15 * w, y1: 0.1 * h}),
        new Spring({x : 0.30 * w, y1: 0.1 * h}),
        new Spring({x : 0.45 * w, y1: 0.1 * h})
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

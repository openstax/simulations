define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Simulation = require('common/simulation/simulation');


    var Spring  = require('models/spring');
    var Body  = require('models/body');

    /**
     * Constants
     */
    var Constants = require('constants');

    // TODO may move w and h back in here.
    var SPRINGS = [
        new Spring({x : 0.15, y1: 0.1}),
        new Spring({x : 0.30, y1: 0.1}),
        new Spring({x : 0.45, y1: 0.1})
    ];

    var BODIES = [
        new Body({mass : 0.05, x : 0.3, y: 0.8}),
        new Body({mass : 0.10, x : 0.4, y: 0.8}),
        new Body({mass : 0.25, x : 0.5, y: 0.8}),
        new Body({mass : 0.07, x : 0.3, y: 0.8}),
        new Body({mass : 0.16, x : 0.4, y: 0.8}),
        new Body({mass : 0.31, x : 0.5, y: 0.8}),
        new Body({mass : 0.10, x : 0.5, y: 0.8})
    ];

    var SYSTEMS = [

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

        initBodies: function(){

            this.bodies = BODIES;
        },

        _update: function(time, deltaTime) {
            
        }

    });

    return MassesAndSpringsSimulation;
});

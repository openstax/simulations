define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Simulation = require('common/simulation/simulation');

    var Levels = require('levels');

    var Constants = require('constants');

    /**
     * The simulation model
     */
    var MazeGameSimulation = Simulation.extend({

        defaults: _.extend(Simulation.prototype.defaults, {
            level: Levels.levels['Practice'],
            levelName: 'Practice',
            collisions: 0
        }),
        
        initialize: function(attributes, options) {
            Simulation.prototype.initialize.apply(this, [attributes, options]);


        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            this.x = 0;
            this.y = 0;

            this.vx = 0;
            this.vy = 0;

            this.ax = 0;
            this.ay = 0;
        },

        setPosition: function(x, y) {
            this.x = x;
            this.y = y;
        },

        setVelocity: function(vx, vy) {
            this.vx = vx;
            this.vy = vy;
        },

        setAcceleration: function(ax, ay) {
            this.ax = ax;
            this.ay = ay;
        },

        _update: function(time, deltaTime) {
            
        }

    });

    return MazeGameSimulation;
});

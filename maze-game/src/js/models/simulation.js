define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Simulation = require('common/simulation/simulation');

    var Particle = require('models/particle');

    var Levels = require('levels');

    var Constants = require('constants');

    /**
     * The simulation model
     */
    var MazeGameSimulation = Simulation.extend({

        defaults: _.extend(Simulation.prototype.defaults, {
            level: Levels.levels['Certain Death'],
            levelName: 'Level 2',
            collisions: 0
        }),
        
        initialize: function(attributes, options) {
            this.particle = new Particle(); 

            Simulation.prototype.initialize.apply(this, [attributes, options]);

            this.on('change:level', this.levelChanged);
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            this.resetParticle();
        },

        resetParticle: function() {
            var startPosition = this.get('level').startPosition();
            this.particle.set({
                // Position it in the middle of the start tile
                x: this.get('level').colToX(startPosition.col) + Constants.TILE_SIZE / 2,
                y: this.get('level').rowToY(startPosition.row) + Constants.TILE_SIZE / 2,

                // And reset the velocity and acceleration
                vx: 0,
                vy: 0,
                ax: 0,
                ay: 0
            });
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
            
        },

        levelChanged: function(simulation, level) {
            this.resetParticle();
        }

    });

    return MazeGameSimulation;
});

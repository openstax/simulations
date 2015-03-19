define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Simulation = require('common/simulation/simulation');

    var Particle = require('models/particle');
    var Level    = require('models/level');

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
            this.listenTo(this.particle, 'change:colliding', function(particle, colliding) {
                if (colliding)
                    this.set('collisions', this.get('collisions') + 1);
            });
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

        _update: function(time, deltaTime) {
            // Update the position
            this.particle.update(time, deltaTime);
            var x = this.particle.get('x');
            var y = this.particle.get('y');
            var radius = this.particle.get('radius');

            // Check for collisions
            if (this.get('level').collidesWithTileTypeAt(Level.TILE_WALL, x, y, radius))
                this.particle.set('colliding', true);
            else
                this.particle.set('colliding', false);

            if (this.get('level').collidesWithTileTypeAt(Level.TILE_FINISH, x, y, radius))
                console.log('finish!!');
        },

        levelChanged: function(simulation, level) {
            this.resetParticle();
        }

    });

    return MazeGameSimulation;
});

define(function (require, exports, module) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');
    var buzz     = require('buzz');

    var Simulation = require('common/simulation/simulation');

    var Ball = require('models/ball');

    /**
     * Constants
     */
    var Constants = require('constants');
    var WallCollisions = {
        LEFT:   1,
        RIGHT:  2,
        TOP:    3,
        BOTTOM: 4
    };

    /**
     * Wraps the update function in 
     */
    var CollisionLabSimulation = Simulation.extend({

        defaults: _.extend(Simulation.prototype.defaults, {
            defaultBallSettings: Constants.Simulation.DEFAULT_BALL_SETTINGS,
            oneDimensional: false,
            borderOn: true,

            paused: true,
            started: false,
            timeScale: Constants.Simulation.DEFAULT_TIMESCALE,
            elasticity: 1,

            xCenterOfMass: 0,
            yCenterOfMass: 0
        }),
        
        initialize: function(attributes, options) {
            this.balls = new Backbone.Collection([],{
                model: Ball
            });

            this.bounds = this.get('oneDimensional') ? 
                Constants.Simulation.BORDER_BOUNDS_1D : 
                Constants.Simulation.BORDER_BOUNDS_2D;

            Simulation.prototype.initialize.apply(this, [attributes, options]);
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            this.addBall();
            this.addBall();
        },

        /**
         * Adds a ball with appropriate default values
         */
        addBall: function() {
            this.balls.add(new Ball({
                color: Constants.Ball.COLORS[this.balls.length], 
                number: this.balls.length + 1,

                mass:     this.get('defaultBallSettings')[this.balls.length].mass,
                position: this.get('defaultBallSettings')[this.balls.length].position,
                velocity: this.get('defaultBallSettings')[this.balls.length].velocity
            }, {
                mute: this.muted
            }));
        },

        /**
         * Removes the last ball in the list of balls
         */
        removeBall: function() {
            this.balls.pop();
        },

        /**
         * Rewinds back to the beginning, setting all the
         *   balls to their initial states.
         */
        rewind: function() {
            this.time = 0;
            this.set('time', this.time);
            this.set('started', false);

            for (var i = 0; i < this.balls.length; i++)
                this.balls.at(i).reset();
        },

        /**
         * Overrides Simulation.update because we update time and
         *   deltaTime differently
         */
        update: function(time, deltaTime) {
            if (!this.get('paused')) {
                // Convert from milliseconds to seconds
                deltaTime = (deltaTime / 1000);
                this.updateSingleStep(deltaTime);
            }
        },

        /**
         * Runs through a single step of the simulation.
         */
        updateSingleStep: function(deltaTime) {

            if (!this.get('started') || this.colliding) {
                // Use a fixed step duration for stability of the algorithm
                deltaTime = Constants.Simulation.STEP_DURATION;

                if (!this.get('started'))
                    this.set('started', true);

                if (this.colliding)
                    this.colliding = false;
            }
            
            // Multiply by our time scale
            deltaTime *= this.get('timeScale');

            // Go backwards in time if we're reversing
            if (this.reversing)
                deltaTime *= -1;
            
            // Update our last sim time and then our sim time
            if (!this.reversing)
                this.lastTime = this.time;
            this.time += deltaTime;

            // Update ball positions
            for (var i = 0; i < this.balls.length; i++) {
                this.balls.at(i).updatePositionFromVelocity(deltaTime);
                this.checkAndProcessWallCollisions(i);
            }
            this.checkBallCollisions();
            this.calculateCenterOfMass();

            if (this.reversing)
                this.lastTime = this.time;

            // Update our time attribute for the interface
            this.set('time', this.time);
        },

        /**
         * If ball is beyond reflecting border, translate back to
         *   the edge and reflect it.
         */
        checkAndProcessWallCollisions: function(index) {
            if (!this.get('borderOn'))
                return;

            var wallOffsetX = 0;
            var wallOffsetY = 0;
            var wallHit = false;

            var balls = this.balls;
            var ball = balls.at(index);
            var radius = ball.get('radius');
            var x = ball.get('position').x;
            var y = ball.get('position').y;
            var vx = ball.get('velocity').x;
            var vy = ball.get('velocity').y;
            var onePlusEpsilon = 1.000001;

            if ((x + radius) > this.bounds.right()) {
                ball.setX(this.bounds.right() - onePlusEpsilon * radius);
                ball.setVelocityX(this.get('elasticity') * -vx);
                wallOffsetX = ball.get('position').x - x;
                wallHit = true;
            }
            else if ((x - radius) < this.bounds.left()) {
                ball.setX(this.bounds.left() + onePlusEpsilon * radius);
                ball.setVelocityX(this.get('elasticity') * -vx);
                wallOffsetX = ball.get('position').x - x;
                wallHit = true;
            }

            if ((y + radius) > this.bounds.top()) {
                ball.setY(this.bounds.top() - onePlusEpsilon * radius);
                ball.setVelocityY(this.get('elasticity') * -vy);
                wallOffsetY = ball.get('position').y - y;
                wallHit = true;
            }
            else if ((y - radius) < this.bounds.bottom()) {
                ball.setY(this.bounds.bottom() + onePlusEpsilon * radius);
                ball.setVelocityY(this.get('elasticity') * -vy);
                wallOffsetY = ball.get('position').y - y;
                wallHit = true;
            }

            if (wallHit) {
                this.collide();
                ball.collideWithWall();

                // Check if overlapping any other ball and correct by
                //   translating the other ball.
                var xi = ball.get('position').x;
                var yi = ball.get('position').y;
                for (var j = 0; j < balls.length; j++) {
                    if (j != index) {
                        var xj = balls.at(j).get('position').x;
                        var yj = balls.at(j).get('position').y;
                        var dist = Math.sqrt((xj - xi) * (xj - xi) + (yj - yi) * (yj - yi));
                        var distMin = radius + balls.at(j).get('radius');
                        if (dist < distMin)
                            balls.at(j).setPosition(xj + wallOffsetX, yj + wallOffsetY);
                    }
                }
            }
        },

        /**
         * Returns the first wall collision it detects as a member
         *   of WallCollisions.
         */
        checkWallCollision: function(ball, x, y) {
            if (this.get('borderOn')) {
                var radius = ball.get('radius');

                if ((x + radius) > this.bounds.right())
                    return WallCollisions.RIGHT;
                if ((x - radius) < this.bounds.left())
                    return WallCollisions.LEFT;
                if ((y + radius) > this.bounds.top())
                    return WallCollisions.TOP;
                if ((y - radius) < this.bounds.bottom())
                    return WallCollisions.BOTTOM;
            }

            return false;
        },

        /**
         * If a ball is outside the border, move it back.
         */
        checkWallCollisionAndSeparate: function(ball, x, y) {
            if (this.get('borderOn')) {
                var radius = ball.get('radius');

                // For some reason they use else ifs, but whatever.

                if ((x + radius) > this.bounds.right())
                    ball.setX(this.bounds.right() - 2 * radius);
                else if ((x - radius) < this.bounds.left())
                    ball.setX(this.bounds.left() + 2 * radius);
                else if ((y + radius) > this.bounds.top())
                    ball.setY(this.bounds.top() - 2 * radius);
                else if ((y - radius) < this.bounds.bottom())
                    ball.setY(this.bounds.bottom() + 2 * radius);
                    
            }
        },
        
        /**
         * Checks for collisions between balls
         */
        checkBallCollisions: function() {
            var balls = this.balls;
            for (var i = 0; i < balls.length; i++) {
                for (var j = i + 1; j < balls.length; j++) {
                    var dist = balls.at(i).get('position').distance(balls.at(j).get('position'));
                    var distMin = balls.at(i).get('radius') + balls.at(j).get('radius');
                    if (dist < distMin) {
                        this.collideBalls(balls.at(i), balls.at(j));
                        this.colliding = true;
                    }
                }
            }
        },

        /**
         * Returns whether or not a given ball would be
         *   within bounds at a certain location.
         */
        withinBounds: function(ball, x, y) {
            if (this.get('borderOn')) {
                var radius = ball.get('radius');

                if ((x + radius) > this.bounds.right())
                    return false;
                if ((x - radius) < this.bounds.left())
                    return false;
                if ((y + radius) > this.bounds.top())
                    return false;
                if ((y - radius) < this.bounds.bottom())
                    return false;
            }

            return true;
        },

        /**
         * Modifies the given position vector to keep
         *   the specified ball within bounds.
         */
        keepWithinBounds: function(ball, position) {
            if (this.get('borderOn')) {
                var radius = ball.get('radius');

                if ((position.x + radius) > this.bounds.right())
                    position.x = this.bounds.right() - radius;
                else if ((position.x - radius) < this.bounds.left())
                    position.x = this.bounds.left() + radius;
                if ((position.y + radius) > this.bounds.top())
                    position.y = this.bounds.top() - radius;
                else if ((position.y - radius) < this.bounds.bottom())
                    position.y = this.bounds.bottom() + radius;
            }
        },

        /**
         * Loops through all balls repeatedly until there's no
         *   overlap between any pair.
         */
        separateAllBalls: function() {
            var balls = this.balls;

            var counter = 0;
            while (counter <= 20) {
                for (var i = 0; i < balls.length; i++) {
                    var iPos = balls.at(i).get('position');
                    this.checkWallCollisionAndSeparate(balls.at(i), iPos.x, iPos.y);

                    for (var j = i + 1; j < balls.length; j++) {
                        var jPos = balls.at(j).get('position');
                        var dist = iPos.distance(jPos);
                        var distMin = balls.at(i).get('radius') + balls.at(j).get('radius');
                        if (dist <= distMin)
                            this.separateBalls(balls.at(i), balls.at(j));
                    }
                }

                counter++;
            }
        },

        /**
         * Check if balls overlap.  If they do, separate them
         *   while keeping the center of mass fixed.
         */
        separateBalls: function(ball1, ball2) {
            // Note: Function copied almost verbatim from the original.

            var x1 = ball1.get('position').x;
            var x2 = ball2.get('position').x;
            var y1 = ball1.get('position').y;
            var y2 = ball2.get('position').y;
            var dx = x2 - x1; // Delta x
            var dy = y2 - y1; // Delta y
            var dr = Math.sqrt(dx * dx + dy * dy); // Delta radius
            var r1 = ball1.get('radius');
            var r2 = ball2.get('radius');
            var overlap = (r1 + r2) - dr;
            if (overlap > 0) {
                var m1 = ball1.get('mass');
                var m2 = ball2.get('mass');
                var extraBit = 0.04 * (r1 + r2);
                overlap = overlap + extraBit;

                // Prevent dxBall or dyBall from becoming NaN
                if (dr === 0) {
                    dx = 1;
                    dr = 1;
                }

                var dxBall1 = -m2 * overlap * dx / (dr * (m1 + m2));
                var dyBall1 = -m2 * overlap * dy / (dr * (m1 + m2));
                var dxBall2 = m1 * overlap * dx / (dr * (m1 + m2));
                var dyBall2 = m1 * overlap * dy / (dr * (m1 + m2));
                var ball1WallCollision = this.checkWallCollision(ball1, x1 + dxBall1, y1 + dyBall1);
                var ball2WallCollision = this.checkWallCollision(ball2, x2 + dxBall2, y2 + dyBall2);
                
                var wallXOffset = 0;  // Translate both balls away from colliding wall
                var wallYOffset = 0;
                if (ball1WallCollision === WallCollisions.TOP || ball2WallCollision === WallCollisions.TOP)
                    wallYOffset = -(r1 + r2);
                else if (ball1WallCollision === WallCollisions.BOTTOM || ball2WallCollision === WallCollisions.BOTTOM)
                    wallYOffset = r1 + r2;
                if ( ball1WallCollision === WallCollisions.LEFT || ball2WallCollision === WallCollisions.LEFT)
                    wallXOffset = r1 + r2;
                else if ( ball1WallCollision === WallCollisions.RIGHT || ball2WallCollision === WallCollisions.RIGHT)
                    wallXOffset = -(r1 + r2);

                ball1.setPosition(x1 + dxBall1 + wallXOffset, y1 + dyBall1 + wallYOffset);
                ball2.setPosition(x2 + dxBall2 + wallXOffset, y2 + dyBall2 + wallYOffset);

                ball1.setLastPositionToCurrent();
                ball2.setLastPositionToCurrent();
            }
        },

        /**
         * Handles everything necessary to flag a collision
         */
        collide: function() {
            this.colliding = true;
            // Play a sound or something
            
        },

        /**
         * 
         */
        collideBalls: function(ball1, ball2) {
            this.collide();
            ball1.collideWithBall();
            ball2.collideWithBall();

            // Note: Function copied almost verbatim from the original.

            // Balls have already overlapped, so they currently 
            //   have incorrect positions
            var contactTime = this.getContactTime(ball1, ball2);
            var delTBefore = contactTime - this.lastTime;
            var delTAfter = this.time - contactTime;
            var v1x = ball1.get('velocity').x;
            var v2x = ball2.get('velocity').x;
            var v1y = ball1.get('velocity').y;
            var v2y = ball2.get('velocity').y;

            // Get positions at contact time:
            var x1 = ball1.getLastX() + v1x * delTBefore;
            var x2 = ball2.getLastX() + v2x * delTBefore;
            var y1 = ball1.getLastY() + v1y * delTBefore;
            var y2 = ball2.getLastY() + v2y * delTBefore;
            var delX = x2 - x1;
            var delY = y2 - y1;
            var d = Math.sqrt(delX * delX + delY * delY);

            // Normal and tangential components of initial velocities
            var v1n = (1 / d) * (v1x * delX + v1y * delY);
            var v2n = (1 / d) * (v2x * delX + v2y * delY);
            var v1t = (1 / d) * (-v1x * delY + v1y * delX);
            var v2t = (1 / d) * (-v2x * delY + v2y * delX);
            var m1 = ball1.get('mass');
            var m2 = ball2.get('mass');

            // Normal components of velocities after collision (P for prime = after)
            var elasticity = this.get('elasticity');
            var v1nP = ((m1 - m2 * elasticity) * v1n + m2 * (1 + elasticity) * v2n) / (m1 + m2);
            var v2nP = (elasticity + 0.000001) * (v1n - v2n) + v1nP;  //changed from 0.0000001
            var v1xP = (1 / d) * (v1nP * delX - v1t * delY);
            var v1yP = (1 / d) * (v1nP * delY + v1t * delX);
            var v2xP = (1 / d) * (v2nP * delX - v2t * delY);
            var v2yP = (1 / d) * (v2nP * delY + v2t * delX);

            ball1.setVelocity(v1xP, v1yP);
            ball2.setVelocity(v2xP, v2yP);

            // Don't allow balls to rebound after collision during
            //   timestep of collision this seems to improve stability
            var newXi = x1 + v1xP * delTAfter;
            var newYi = y1 + v1yP * delTAfter;
            var newXj = x2 + v2xP * delTAfter;
            var newYj = y2 + v2yP * delTAfter;

            ball1.setPosition(newXi, newYi);
            ball2.setPosition(newXj, newYj);
        },

        /**
         * Returns the time at which two balls collided.
         */
        getContactTime: function(ball1, ball2) {
            var contactTime;

            // Note: Function copied almost verbatim from the original.

            var x1 = ball1.getLastX();
            var y1 = ball1.getLastY();
            var x2 = ball2.getLastX();
            var y2 = ball2.getLastY();
            var v1x = ball1.get('velocity').x;
            var v1y = ball1.get('velocity').y;
            var v2x = ball2.get('velocity').x;
            var v2y = ball2.get('velocity').y;
            var delX = x2 - x1;
            var delY = y2 - y1;
            var delVx = v2x - v1x;
            var delVy = v2y - v1y;
            var delVSq = delVx * delVx + delVy * delVy;
            var R1 = ball1.get('radius');
            var R2 = ball2.get('radius');
            var SSq = (R1 + R2) * (R1 + R2); // Square of center-to-center separation of balls at contact
            var delRDotDelV = delX * delVx + delY * delVy;
            var delRSq = delX * delX + delY * delY;
            var underSqRoot = delRDotDelV * delRDotDelV - delVSq * (delRSq - SSq);

            // If collision is superslow and tiny number precision causes 
            //   number under square root to be negative, then set collision
            //   time equal to the half-way point since last time step.
            if (delVSq < 0.000000001 || underSqRoot < 0) {
                contactTime = this.lastTime + 0.5 * (this.time - this.lastTime);
            }
            else { // Collision is normal
                var delT;
                if (this.reversing)
                    delT = (-delRDotDelV + Math.sqrt(delRDotDelV * delRDotDelV - delVSq * (delRSq - SSq))) / delVSq;
                else
                    delT = (-delRDotDelV - Math.sqrt(delRDotDelV * delRDotDelV - delVSq * (delRSq - SSq))) / delVSq;
                contactTime = this.lastTime + delT;
            }

            return contactTime;
        },

        /**
         * Calculates the center of mass of all the balls and
         *   saves that value to xCenterOfMass and yCenterOfMass.
         */
        calculateCenterOfMass: function() {
            var totalMass = 0;
            var sumXiMi = 0;
            var sumYiMi = 0;

            for (var i = 0; i < this.balls.length; i++) {
                var mass = this.balls.at(i).get('mass');
                totalMass += mass;
                sumXiMi += mass * this.balls.at(i).get('position').x;
                sumYiMi += mass * this.balls.at(i).get('position').y;
            }
         
            this.set('xCenterOfMass', sumXiMi / totalMass);
            this.set('yCenterOfMass', sumYiMi / totalMass);       
        },

        /**
         * Returns whether or not the simulation has left its
         *   initial state--if time is not zero.
         */
        hasStarted: function() {
            return this.get('started');
        },

        mute: function() {
            this.muted = true;
            buzz.all().mute();
        },

        unmute: function() {
            this.muted = false;
            buzz.all().unmute();
        }

    });

    return CollisionLabSimulation;
});

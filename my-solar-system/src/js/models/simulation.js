define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Simulation = require('common/simulation/simulation');
    var Vector2    = require('common/math/vector2');

    var Body    = require('models/body');
    var Presets = require('models/presets');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Wraps the update function in 
     */
    var MSSSimulation = Simulation.extend({

        defaults: _.extend(Simulation.prototype.defaults, {
            numBodies: 2,
            speed: 7,
            time: 0
        }),
        
        initialize: function(attributes, options) {
            this._forceVector = new Vector2();

            Simulation.prototype.initialize.apply(this, [attributes, options]);

            this.initComponents();

            this.on('change:speed', this.shiftSpeed);
            this.on('change:numBodies', this.updateNumBodies);
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            this.G = Constants.G;
            this.maxAccel = 0;

            this.frameAccumulator = 0;
            this.frameDuration = Constants.FRAME_DURATION;
            this.timeStep      = Constants.DEFAULT_TIME_STEP;
            this.stepsPerFrame = Constants.DEFAULT_NUM_STEPS_PER_FRAME;

            this.velCM = new Vector2();

            this.updateNumBodies(this, this.get('numBodies'));

            this.integrationOn = false;
            this.steppingForward = false;
            this.resettingNumBodies = false;
            this.cmMotionRemoved = false;
            this.wantCMMotionRemoved = true;
            this.collisionJustOccurred = false;
        },

        reset: function() {

        },

        /**
         * Overrides the normal Simulation update function so
         *   that we can both fix the framerate and keep the
         *   step time independent of the number of frames.
         *   This will allow us to run more steps per frame
         *   at small timesteps to achieve greater accuracy
         *   and fewer steps per frame ?????????
         */
        update: function(time, deltaTime) {
            if (!this.paused) {
                this.frameAccumulator += deltaTime;

                while (this.frameAccumulator >= this.frameDuration) {
                    this.stepForwardNTimes(this.stepsPerFrame);
                    this.frameAccumulator -= this.frameDuration;
                }    
            }
        },

        /**
         * Steps forward N steps and then updates the bodies' 
         *   final attribute values so we're not updating the
         *   views with intermediate steps unnecessarily.
         */
        stepForwardNTimes: function(n) {
            // Run all the steps first
            for (var i = 0; i < n; i++)
                this.stepForwardVelocityVerlet();

            // Then update the model attributes to trigger updates to the views
            this.set('time', this.time);
            for (var j = 0; j < this.bodies.length; j++)
                this.bodies[j].updateAttributes();
        },

        /**
         * Uses the Velocity Verlet algorithm to step the
         *   simulation forward one step whose duration is
         *   determined by the current stepTime.
         */
        stepForwardVelocityVerlet: function() {
            this.steppingForward = true;

            var dt = this.timeStep;
            this.time += dt;

            // Update positions
            var pos;
            var vel;
            var acc;
            for (var i = 0; i < this.get('numBodies'); i++) {
                pos = this.bodies[i].pos;
                vel = this.bodies[i].vel;
                acc = this.bodies[i].acc;
                
                // Update position
                pos.x = pos.x + vel.x*dt + (0.5)*acc.x*dt*dt;
                pos.y = pos.y + vel.y*dt + (0.5)*acc.y*dt*dt;

                // Copy the current state of the acceleration vector
                this.bodies[i].preAcc.set(acc); 
            }

            this.setForcesAndAccels();

            // Update velocities
            var preAcc;
            for (var i = 0; i < this.get('numBodies'); i++) {
                vel    = this.bodies[i].vel;
                acc    = this.bodies[i].acc;
                preAcc = this.bodies[i].preAcc;

                vel.x = vel.x + (0.5)*(acc.x + preAcc.x)*dt;
                vel.y = vel.y + (0.5)*(acc.y + preAcc.y)*dt;
            }

            this.steppingForward = false;

            // Check for collisions that occurred during the update
            if (this.collisionJustOccurred) {
                var indices = this.getIndicesOfClosestBodies();
                this.collideBodies(indices[0], indices[1]);
                this.collisionJustOccurred = false;
            }
        },

        /**
         * Computes current forces and acceleration of all bodies
         *    in the system and detects collisions between them.
         */
        setForcesAndAccels: function() {
            var numBodies = this.get('numBodies');
            var bodies = this.bodies;
            var forces = this.forces;

            // Update forces matrix
            for (var i = 0; i < numBodies; i++) {
                for (var j = i + 1; j < numBodies; j++) {
                    forces[i][j].set(this.getForce(i, j));
                    forces[j][i].set(-forces[i][j].x, -forces[i][j].y);
                }
            }

            // Update acclerations of bodies
            for (var n = 0; n < numBodies; n++) {
                bodies[n].acc.x = 0;
                bodies[n].acc.y = 0;
                var massN = bodies[n].mass;
                for (var m = 0; m < numBodies; m++){
                    bodies[n].acc.x += forces[n][m].x / massN;
                    bodies[n].acc.y += forces[n][m].y / massN;
                    var currentAccel = this.bodies[n].acc.length();
                    if (currentAccel > this.maxAccel){
                        this.maxAccel = currentAccel;
                        if (this.maxAccel * this.timeStep > 150)
                            this.collisionJustOccurred = true;
                    }
                }
            }
        },

        /**
         * Calculates the force that body1 exerts on body2 and
         *   returns it as a vector.  Note that the vector it
         *   returns is meant to be reused, so it must be used
         *   right away or it will get overritten.  In other
         *   words, use it or lose it.
         */
        getForce: function(body1Index, body2Index) {
            var body1 = this.bodies[body1Index];
            var body2 = this.bodies[body2Index];

            var GM1M2 = this.G * body1.mass * body2.mass;
            var delX = body2.pos.x - body1.pos.x;
            var delY = body2.pos.y - body1.pos.y;
            var distSq = delX*delX + delY*delY;
            var dist = Math.sqrt(distSq);
            var product = GM1M2 / (distSq * dist); 

            return this._forceVector.set(
                product * delX,
                product * delY
            );
        },

        /**
         * Calculates the new velocity center-of-mass.
         */
        setVelocityCenterOfMass: function() {
            var totalMass = 0;
            var sumMVX = 0; // Sum of mass * velocity in the x direction
            var sumMVY = 0; // Sum of mass * velocity in the y direction
            for (var i = 0; i < this.get('numBodies'); i++) {
                totalMass += this.bodies[i].mass;
                sumMVX += this.bodies[i].mass * this.bodies[i].initVel.x;
                sumMVY += this.bodies[i].mass * this.bodies[i].initVel.y;
            }
            this.velCM.x = sumMVX / totalMass;
            this.velCM.y = sumMVY / totalMass;
        },

        shiftSpeed: function(simulation, speed) {
            if (speed > Constants.STEP_TIMES.length - 1 || speed < 0)
                throw 'Invalid speed setting';

            if (!this.get('paused')) {
                this.pause();
                this.maxAccel = 0;
                this.timeStep = Constants.STEP_TIMES[speed];
                this.stepsPerFrame = Constants.STEP_COUNTS_PER_FRAME[speed];
                this.play();
            }
            else {
                this.maxAccel = 0;
                this.timeStep = Constants.STEP_TIMES[speed];
                this.stepsPerFrame = Constants.STEP_COUNTS_PER_FRAME[speed];
            }
        },

        updateNumBodies: function(simulation, numBodies) {
            this.pause();
            this.resettingNumBodies = true;

            this.initBodies();
            this.initForces();
            this.setForcesAndAccels();
            this.reset();
            this.setVelocityCenterOfMass();

            this.resettingNumBodies = false;
        },

        initForces: function() {
            this.forces = [];
            for (var i = 0; i < Constants.MAX_BODIES; i++) {
                this.forces[i] = [];
                for (var j = 0; j < Constants.MAX_BODIES; j++)
                    this.forces[i][j] = new Vector2();
            }
        },

        initBodies: function() {
            // List of all the initial body models
            var bodies = [
                new Body({ mass: 200, x:   0, y: 0, vx: 0, vy:   -1 }),
                new Body({ mass:  10, x: 142, y: 0, vx: 0, vy:  140 }),
                new Body({ mass:   0, x: 166, y: 0, vx: 0, vy:   74 }),
                new Body({ mass:   0, x: -84, y: 0, vx: 0, vy: -133 })
            ];

            // Only take what we need
            this.bodies = [];
            for (var i = 0; i < this.get('numBodies'); i++)
                this.bodies.push(bodies[i]);

            // Make sure the views know we've got new bodies
            this.trigger('bodies-reset', this, this.bodies);
        },

        addBody: function() {
            if (this.get('numBodies') === Constants.MAX_BODIES)
                return false;
            else
                this.set('numBodies', this.get('numBodies') + 1);
        },

        removeBody: function() {
            if (this.get('numBodies') <= Constants.MIN_BODIES)
                return false;
            else
                this.set('numBodies', this.get('numBodies') - 1);
        },

        loadPreset: function(presetNumber) {

        }

    });

    return MSSSimulation;
});

define(function (require, exports, module) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var Simulation = require('common/simulation/simulation');
    var Vector2    = require('common/math/vector2');

    var Body            = require('models/body');
    var Moon            = require('models/body/moon');
    var Planet          = require('models/body/planet');
    var BodyStateRecord = require('models/body-state-record');

    var Constants = require('constants');
    var Scenarios = require('scenarios');

     /* PhET explanation: "
      *    Subdivide DT intervals by this factor to improve smoothing, 
      *    otherwise some orbits look too non-smooth (you can see 
      *    their corners). "
      */
    var SMOOTHING_STEPS = 5;

    /**
     * 
     */
    var GOSimulation = Simulation.extend({

        defaults: _.extend(Simulation.prototype.defaults, {
            scenario: Scenarios.Friendly[0],
            gravityEnabled: true
        }),
        
        /**
         *
         */
        initialize: function(attributes, options) {
            this.bodies = new Backbone.Collection([], {
                model: Body
            });

            this._sum = new Vector2();
            this._pos = new Vector2();
            this._vel = new Vector2();
            this._acc = new Vector2();
            this._force = new Vector2();
            this._sourceForce = new Vector2();
            this._nextVelocityHalf = new Vector2();

            Simulation.prototype.initialize.apply(this, [attributes, options]);

            this.on('change:scenario', this.scenarioChanged);

            this.scenarioChanged(this, this.get('scenario'));
        },

        /**
         *
         */
        applyOptions: function(options) {
            Simulation.prototype.applyOptions.apply(this, [options]);

            
        },

        /**
         *
         */
        initComponents: function() {
            
        },

        /**
         * Loads a scenario. Sets up the bodies, applies simulation
         *   attributes, and resets the simulation.
         */
        scenarioChanged: function(simulation, scenario) {
            this.pause();
            
            this.bodies.reset(_.map(scenario.bodies, function(body) {
                return body.clone();
            }));

            this.set(scenario.simulationAttributes);

            //this.reset();
            this.initScratchStates();
        },

        /**
         * Creates scratch states that are arrays of individual
         *   body states to be written to during the execution
         *   of a step (which has many sub-steps before a final
         *   state is reached).
         */
        initScratchStates: function() {
            this.scratchStates = [];

            // Creates two states, which are arrays of BodyStateRecord
            //   instances that will represent each body in the system.
            for (var i = 0; i < 2; i++) {
                var state = [];
                for (var j = 0; j < this.bodies.length; j++)
                    state.push(new BodyStateRecord());
                this.scratchStates.push(state);
            }

            // Used to determine which scratch state will be used next
            this.currentScratchStateIndex = 0;
        },

        /**
         * Returns the next scratch state. Note that this assumes
         *   we will ever only need two at a time.
         */
        getScratchState: function() {
            this.currentScratchStateIndex++;
            if (this.currentScratchStateIndex >= this.scratchStates.length)
                this.currentScratchStateIndex = 0;
            return this.scratchStates[this.currentScratchStateIndex];
        },

        /**
         *
         */
        reset: function() {
            Simulation.prototype.reset.apply(this);

        },

        /**
         *
         */
        play: function() {
            // May need to save the current state here for the rewind button

            Simulation.prototype.play.apply(this);
        },

        /**
         *
         */
        rewind: function() {
            // Apply the saved state
        },

        /**
         * Only runs if simulation isn't currently paused.
         * If we're recording, it saves state
         */
        _update: function(time, deltaTime) {
            // For the time slider and anything else relying on time
            this.set('time', time);

            // Split up the delta time into steps to smooth out the orbit
            deltaTime /= SMOOTHING_STEPS;
            for (var i = 0; i < SMOOTHING_STEPS; i++)
                this.performSubstep(deltaTime);
        },

        /**
         * Runs through the physics algorithms, updates the models,
         *   and checks for collisions.  It actually loops through
         *   even smaller sub-substeps while doing the main physics
         *   calculations in order to smooth out the results even
         *   further.
         */
        performSubstep: function(deltaTime) {
            // Perform many tiny sub-substeps before doing any
            //   collision detection or updating, because those
            //   operations are expensive, and we've got too
            //   much work to do in such little time.
            var state = this.getScratchState();
            for (var i = 0; i < state.length; i++)
                state[i].saveState(this.bodies.at(i));

            var subSubSteps = 400 / SMOOTHING_STEPS;
            var dtPerSubSubstep = deltaTime / subSubSteps;

            for (var s = 0; s < subSubSteps; s++)
                state = this.performSubSubStep(dtPerSubSubstep, state);

            // We've kept cheap copies of the real models for 
            //   making quick calculations, so now we must
            //   update those real models.
            for (var i = 0; i < state.length; i++)
                state[i].applyState(this.bodies.at(i));
            
            // Check for collisions between bodies
        },

        /**
         * Performs a sub-substep which is going from one state to
         *   the next according to the velocity Verlet algorithm.
         */
        performSubSubStep: function(deltaTime, state) {
            var nextState = this.getScratchState();
            var nextBodyState;
            var bodyState;

            var pos   = this._pos;
            var vel   = this._vel;
            var acc   = this._acc;
            var force = this._force;
            var nextVelocityHalfStep = this._nextVelocityHalf;

            for (var i = 0; i < state.length; i++) {
                bodyState     = state[i];
                nextBodyState = nextState[i];

                nextBodyState.position.set(
                    pos
                        .set(bodyState.position)
                        .add(vel.set(bodyState.velocity).scale(deltaTime))
                        .add(acc.set(bodyState.acceleration).scale(deltaTime * deltaTime / 2))
                );
                nextVelocityHalfStep.set(
                    vel
                        .set(bodyState.velocity)
                        .add(acc.set(bodyState.acceleration).scale(deltaTime / 2))
                );
                nextBodyState.acceleration.set(
                    force
                        .set(this.getForce(bodyState, nextBodyState.position, state))
                        .scale(-1.0 / bodyState.mass)
                );
                nextBodyState.velocity.set(
                    nextVelocityHalfStep.add(
                        acc
                            .set(nextBodyState.acceleration)
                            .scale(deltaTime / 2)
                    )
                );
                nextBodyState.mass = bodyState.mass;
                nextBodyState.exploded = bodyState.exploded;
            }

            return nextState;
        },

        /**
         * Returns the sum of all forces on body at its proposed
         *   new position from all potential sources.
         */
        getForce: function(target, newTargetPosition, sources) {
            var sum = this._sum.set(0, 0);

            if (this.get('gravityEnabled')) {
                for (var i = 0; i < sources.length; i++) {
                    if (sources[i] !== target) {
                        sum.add(
                            this.getForceFromSource(target, newTargetPosition, sources[i])
                        );
                    }
                }
            }

            return sum;
        },

        /**
         * Returns the force on body at its proposed new position
         *   from a single source.
         */
        getForceFromSource: function(target, newTargetPosition, source) {
            if (source.position.equals(newTargetPosition)) {
                // If they are on top of each other, force should be 
                //   infinite, but ignore it since we want to have 
                //   semi-realistic behavior.
                return this._sourceForce.set(0, 0);
            }
            else if (source.exploded) {
                // Ignore in the computation if that body has exploded
                return this._sourceForce.set(0, 0);
            }
            else {
                return this._sourceForce
                    .set(newTargetPosition)
                    .sub(source.position)
                    .normalize()
                    .scale(
                        Constants.G * source.mass * target.mass / source.position.distanceSq(newTargetPosition)
                    );
            }
        }

    });

    return GOSimulation;
});
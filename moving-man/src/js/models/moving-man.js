define(function (require) {

    'use strict';

    //var _        = require('underscore');
    var Backbone = require('backbone');

    var DataSeries = require('models/data-series');
    var MotionMath = require('common/math/motion');

    /**
     * Constants
     */
    var NUMBER_MOUSE_POINTS_TO_AVERAGE = 4;
    var DERIVATIVE_RADIUS = 1;
    var SERIES_SIZE_LIMIT = 6;
    var SERIES_TIME_LIMIT = 20;
    var NUM_TIME_POINTS_TO_RECORD = 10;

    var MOTION_STRATEGY_POSITION     = 0;
    var MOTION_STRATEGY_VELOCITY     = 1;
    var MOTION_STRATEGY_ACCELERATION = 2;

    /**
     * The moving man model represents the man on the screen who
     *   moves.  He keeps track of his position, velocity, and
     *   acceleration and updates them according to past states 
     *   and new user input.  This version of the moving-man model 
     *   takes over some of the functionality that the simulation 
     *   model had in the original simulation.  In the original
     *   PhET simulation, this class was only used to keep track
     *   of the man's state.
     */
    var MovingMan = Backbone.Model.extend({
        defaults: {
            position: 0,
            velocity: 0,
            acceleration: 0,
            motionStrategy: MOTION_STRATEGY_POSITION
        },
        
        /**
         * Initialization code for creating new moving man model objects
         */
        initialize: function(attributes, options) {
            if (options.simulation)
                this.simulation = options.simulation;
            else
                throw 'MovingMan requires a simulation model.';

            this.mouseDataSeries         = new DataSeries.LimitedSize({ maxSize: SERIES_SIZE_LIMIT });
            this.positionModelSeries     = new DataSeries.LimitedSize({ maxSize: SERIES_SIZE_LIMIT });
            this.velocityModelSeries     = new DataSeries.LimitedSize({ maxSize: SERIES_SIZE_LIMIT });
            this.accelerationModelSeries = new DataSeries.LimitedSize({ maxSize: SERIES_SIZE_LIMIT });

            if (options.noRecording) {
                this.positionGraphSeries     = new DataSeries.LimitedSize({ maxSize: SERIES_SIZE_LIMIT });
                this.velocityGraphSeries     = new DataSeries.LimitedSize({ maxSize: SERIES_SIZE_LIMIT });
                this.accelerationGraphSeries = new DataSeries.LimitedSize({ maxSize: SERIES_SIZE_LIMIT });
            }
            else {
                this.positionGraphSeries     = new DataSeries.LimitedTime({ maxTime: SERIES_TIME_LIMIT });
                this.velocityGraphSeries     = new DataSeries.LimitedTime({ maxTime: SERIES_TIME_LIMIT });
                this.accelerationGraphSeries = new DataSeries.LimitedTime({ maxTime: SERIES_TIME_LIMIT });
            }

            this.times = [];

            this.mousePosition = 0;

            this._wallResult = {
                position: 0,
                collided: false
            };
        },

        /**
         * Clear the time, stored user input, and historical data.
         */
        clear: function() {
            this.time = 0;
            this.times.length = 0;
            this.setMousePosition(this.get('position'));

            this.mouseDataSeries.clear();
            this.positionModelSeries.clear();
            this.velocityModelSeries.clear();
            this.accelerationModelSeries.clear();

            this.positionGraphSeries.clear();
            this.velocityGraphSeries.clear();
            this.accelerationGraphSeries.clear();

            this.trigger('history-cleared');
        },

        /**
         * Used when the user seeks to a certain spot in the playback sequence
         *   and starts recording over what's there at that position.
         */
        clearHistoryAfter: function(time) {
            this.times.length = 0;
            
            this.mouseDataSeries.clearPointsAfter(time);
            this.positionModelSeries.clearPointsAfter(time);
            this.velocityModelSeries.clearPointsAfter(time);
            this.accelerationModelSeries.clearPointsAfter(time);

            this.positionGraphSeries.clearPointsAfter(time);
            this.velocityGraphSeries.clearPointsAfter(time);
            this.accelerationGraphSeries.clearPointsAfter(time);

            this.trigger('history-cleared');
        },

        /**
         * Returns the current state (the model attributes) as a JSON object.
         */
        getState: function() {
            return this.toJSON();
        },

        /**
         * Applies the specified time and state to the model.
         */
        applyState: function(time, state) {
            this.time = time;
            this.times = [];
            this.set(state);
            this.setMousePosition(this.get('position'));
        },

        /**
         * Updates the time, adds the time to its history array
         *   of frame times, and calls the right update method
         *   depending on the current driving variable.
         */
        update: function(time, delta) {
            this.time = time;

            this.times.push(this.time);
            if (this.times.length > NUM_TIME_POINTS_TO_RECORD)
                this.times.shift();

            if (this.positionDriven())
                this._updateFromPosition(time, delta);
            else if (this.velocityDriven())
                this._updateFromVelocity(time, delta);
            else if (this.accelerationDriven())
                this._updateFromAcceleration(time, delta);
        },

        /**
         * Calculates the new state based on previous state
         *   info and user input or optionally from a user-
         *   specified time-based position function.
         */
        _updateFromPosition: function(time, delta) {
            var previousPosition = this.get('position');
            var position;
            var x;

            if (!this.simulation.usingCustomPositionFunction()) {
                this.mouseDataSeries.add(this.clampIfWalled(this.mousePosition).position, time);

                // Average of latest position samples from user input
                var positions = this.mouseDataSeries.getPointsInRange(this.mouseDataSeries.size() - NUMBER_MOUSE_POINTS_TO_AVERAGE, this.mouseDataSeries.size());
                
                var sum = 0;
                for (var i = 0; i < positions.length; i++)
                    sum += positions[i].value;

                x = positions.length ? (sum / positions.length) : 0;
                position = this.clampIfWalled(x).position;
                this.positionModelSeries.add(position, time);
            }
            else {
                // Position by user-specified function
                x = this.simulation.evaluatePositionFunction(time);
                position = this.clampIfWalled(x).position;
                this.setMousePosition(position);
                this.mouseDataSeries.add(position, time);
                this.positionModelSeries.add(position, time);
            }

            // Update model derivatives
            this.velocityModelSeries.setData(    this.estimatedCenteredDerivatives(this.positionModelSeries));
            this.accelerationModelSeries.setData(this.estimatedCenteredDerivatives(this.velocityModelSeries));

            /* Notes from PhET: "
             *   We have to read midpoints from the sampling regions to obtain centered derivatives.
             *   Note that this makes readouts be off by up to dt*2 = 80 milliseconds
             *   TODO: Rewrite the model to avoid the need for this workaround."
             */
            var time1StepsAgo = this.getTimeNTimeStepsAgo(1);
            var time2StepsAgo = this.getTimeNTimeStepsAgo(2);

            this.positionGraphSeries.add(position, time);
            this.velocityGraphSeries.add(this.getPointAtTime(this.velocityModelSeries, time1StepsAgo, time));
            this.accelerationGraphSeries.add(this.getPointAtTime(this.accelerationModelSeries, time2StepsAgo, time));

            // Set instantaneous values
            this.set('position', position);

            var instantVelocity = this.velocityGraphSeries.getLastPoint().value;
            if (Math.abs(instantVelocity) < 1E-6) 
                instantVelocity = 0; // PhET: "added a prevent high frequency wiggling around +/- 1E-12"

            // PhET: "TODO: subtract off derivative radius so that the last value showed on chart is the same as the value on the man"
            this.set('velocity', instantVelocity);

            var instantAcceleration = this.accelerationGraphSeries.getLastPoint().value;
            if (Math.abs(instantAcceleration) < 1E-6)
                instantAcceleration = 0; // PhET: "prevent high frequency wiggling around +/- 1E-12"

            this.set('acceleration', instantAcceleration); //- DERIVATIVE_RADIUS * 2

            // Make sure we notify the interface if we've collided so it can play annoying sounds if it wants
            if (!this.hitsWall(previousPosition) && this.hitsWall(this.get('position')))
                this.trigger('collide');
        },

        /**
         * Calculates the new state based on previous state data.
         *   This method is used if a user-specified velocity is
         *   what's currently driving the simulation.
         */
        _updateFromVelocity: function(time, delta) {
            // PhET: "so that if the user switches to mouse-driven, it won't remember the wrong location."
            this.mouseDataSeries.clear();

            // Record set point
            this.velocityModelSeries.add(this.get('velocity'), time);
            this.velocityGraphSeries.add(this.get('velocity'), time);

            // Update derivatives
            this.accelerationModelSeries.setData(this.estimatedCenteredDerivatives(this.velocityModelSeries));
            this.accelerationGraphSeries.add(this.accelerationModelSeries.getMidPoint());

            // Update integrals
            var targetPosition = this.get('position') + this.get('velocity') * delta;
            var wallResult = this.clampIfWalled(targetPosition);
            this.positionModelSeries.add(wallResult.position, time);
            this.positionGraphSeries.add(wallResult.position, time);

            // Set instantaneous values
            this.setMousePosition(wallResult.position);
            this.set('position', wallResult.position);

            var instantAcceleration = this.accelerationGraphSeries.getLastPoint().value;
            if (Math.abs(instantAcceleration) < 1E-6)
                instantAcceleration = 0; // PhET: "workaround to prevent high frequency wiggling around +/- 1E-12"

            this.set('acceleration', instantAcceleration);

            if (wallResult.collided) {
                this.set('velocity', 0);
                this.trigger('collide');
            }
        },

        /**
         * Calculates the new state based on previous state data.
         *   This method is used if a user-specified acceleration 
         *   is what's currently driving the simulation.
         */
        _updateFromAcceleration: function(time, delta) {
            // PhET: "so that if the user switches to mouse-driven, it won't remember the wrong location."
            this.mouseDataSeries.clear();

            var newVelocity = this.get('velocity') + this.get('acceleration') * delta;
            var estVelocity = (this.get('velocity') + newVelocity) / 2; // PhET: "todo: just use newVelocity?"
            var wallResult = this.clampIfWalled(this.get('position') + estVelocity * delta);

            /* Notes from PhET: "
             *   This ensures that there is a deceleration spike when crashing into a wall.  Without this code,
             *   the acceleration remains at the user specified value or falls to 0.0, but it is essential to
             *   show that crashing into a wall entails a suddent deceleration."
             */
            if (wallResult.collided) {
                this.velocityDriven(true);
                this.set('velocity', newVelocity);
                this.update(time - delta, delta);
                return;
            }

            // Record set point
            this.accelerationModelSeries.add(this.get('acceleration'), time);
            this.accelerationGraphSeries.add(this.get('acceleration'), time);

            // No derivatives

            // Update integrals
            this.velocityGraphSeries.add(newVelocity, time);
            this.velocityModelSeries.add(newVelocity, time);

            this.positionGraphSeries.add(wallResult.position, time);
            this.positionModelSeries.add(wallResult.position, time);

            // Set instantaneous values
            this.setMousePosition(wallResult.position); // PhET: "so that if the user switches to mouse-driven, it will have the right location"
            this.set('position', wallResult.position);
            this.set('velocity', newVelocity);
            if (wallResult.collided) {
                this.set('velocity', 0);
                this.set('acceleration', 0); // PhET: "todo: should have brief burst of acceleration against the wall in a collision."
            }
        },

        /**
         * Adds a data point to the mouse data series so user
         *   input can be used to determine the next position.
         *   Note that it's called "mouse data" because that
         *   is what it was called in the original sim, but it
         *   isn't necessarily limited to mouse-based pointer
         *   input. 
         */
        addMouseData: function(value, time) {
            this.mouseDataSeries.add(value, time);
        },

        /**
         * Returns an object {
         *    position: the clamped value of x (bounded by walls if walls enabled)
         *    collided: boolean representing whether the specified x was colliding
         * }
         */
        clampIfWalled: function(x) {
            this._wallResult.position = x;
            this._wallResult.collided = false;

            if (this.simulation.get('wallsEnabled')) {
                var half = this.simulation.get('halfContainerWidth');
                if (x < -half) {
                    this._wallResult.position = -half;
                    this._wallResult.collided = true;
                }
                else if (x > half) {
                    this._wallResult.position = half;
                    this._wallResult.collided = true;
                }
            }

            return this._wallResult;
        },

        /**
         * Returns true if the x specified would be hitting the wall.
         */
        hitsWall: function(x) {
            return -this.simulation.get('halfContainerWidth') == x || this.simulation.get('halfContainerWidth') == x;
        },

        /**
         * In PhET's MovingManModel, they had a setMousePosition function.
         *   This is like that.
         */
        setMousePosition: function(x) {
            if (this.mousePosition !== x) {
                this.mousePosition = this.clampIfWalled(x).position;

                // Once I figure out why we're doing this, I'll write a note here
                if (this.simulation.get('paused'))
                    this.set('position', this.mousePosition);
            }
        },

        positionDriven: function(value) {
            if (value === undefined)
                return this.get('motionStrategy') === MOTION_STRATEGY_POSITION;
            else if (value === true)
                this.set('motionStrategy', MOTION_STRATEGY_POSITION);
        },

        velocityDriven: function(value) {
            if (value === undefined)
                return this.get('motionStrategy') === MOTION_STRATEGY_VELOCITY;
            else if (value === true)
                this.set('motionStrategy', MOTION_STRATEGY_VELOCITY);
        },

        accelerationDriven: function(value) {
            if (value === undefined)
                return this.get('motionStrategy') === MOTION_STRATEGY_ACCELERATION;
            else if (value === true)
                this.set('motionStrategy', MOTION_STRATEGY_ACCELERATION);
        },

        /**
         * Docs from PhET:
         * Identify a TimeData point for the specified lookupTime.  To get the serieses to match up, look up the value at the specified time in the derivative model
         * Note, if interpolation is added for derivatives, a better lookup algorithm will be needed
         * The reason this algorithm is so complicated is to work around flaws in the model that were exposed in #2494.
         *
         * @param series       the series to search
         * @param lookupTime   the time for which the value should be looked up
         * @param reportedTime the time to substitute for the lookup time
         * @return a TimeData point with the value obtained from the lookup, and the time specified as reportedTime.
         */
        getPointAtTime: function(series, lookupTime, reportedTime) {
            for (var i = 0; i < series.size(); i++) {
                if (series.getPoint(i).time === lookupTime) {
                    return {
                        value: series.getPoint(i).value,
                        time:  reportedTime
                    };
                }
            }
            throw 'getPointAtTime: Couldn\'t find exact match';
        },

        /**
         * Creates an array of points that represent the derivative
         *   of the corresponding original point in a series using
         *   the points around it to create a least-squares
         *   regression line to find a linear function from which
         *   it can take a derivative.  At least that's what I think
         *   is happening.  It's modeled after the PhET sim function
         *   with the same name.
         */
        estimatedCenteredDerivatives: function(series) {
            var radius = DERIVATIVE_RADIUS;
            var points = [];
            var range, derivative;
            for (var i = 0; i < series.size(); i++) {
                range = series.getPointsInRange(i - radius, i + radius);
                derivative = MotionMath.estimateDerivative(range);
                points.push({
                    value: derivative,
                    time:  series.getPoint(i).time
                });
            }
            return points;
        },

        /**
         * Looks through its stored step times and termines what
         *   time it was N steps ago.
         */
        getTimeNTimeStepsAgo: function(n) {
            var index = this.times.length - 1 - n;
            if (index < 0) 
                index = this.times.length - 1;

            var t = this.times[index];
            if (t > this.time) 
                throw 'Found a time n steps ago that was later than t=time';
            else
                return t;
        }

    });

    return MovingMan;
});

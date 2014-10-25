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
	 * 
	 */
	var MovingMan = Backbone.Model.extend({
		defaults: {
			position: 0
		},
		
		/**
		 *
		 */
		initialize: function(options) {
			if (options.simulation)
				this.simulation = options.simulation;
			else
				throw 'MovingMan requires a simulation model.';

			this.mouseDataSeries         = new DataSeries.LimitedSize({ maxSize: SERIES_SIZE_LIMIT });
			this.positionModelSeries     = new DataSeries.LimitedSize({ maxSize: SERIES_SIZE_LIMIT });
			this.velocityModelSeries     = new DataSeries.LimitedSize({ maxSize: SERIES_SIZE_LIMIT });
			this.accelerationModelSeries = new DataSeries.LimitedSize({ maxSize: SERIES_SIZE_LIMIT });

			this.positionGraphSeries     = new DataSeries.LimitedTime({ maxSize: SERIES_TIME_LIMIT });
			this.velocityGraphSeries     = new DataSeries.LimitedTime({ maxSize: SERIES_TIME_LIMIT });
			this.accelerationGraphSeries = new DataSeries.LimitedTime({ maxSize: SERIES_TIME_LIMIT });

			this.motionStrategy = MOTION_STRATEGY_POSITION;

			this._wallResult = {
				position: 0,
				collided: false
			};
		},

		/**
		 *
		 */
		update: function(time, delta) {
			this.time = time;

			this.times.push(this.time);
			if (this.times.length > NUM_TIME_POINTS_TO_RECORD)
				this.times.shift();

			if (this.positionDriven()) {
				if (!this.simulation.customExpression) {
					// Average of latest position samples from user input
					var positions = this.mouseDataSeries.getPointsInRange(this.mouseDataSeries.size() - NUMBER_MOUSE_POINTS_TO_AVERAGE, this.mouseDataSeries.size());
					
					var sum = 0;
					for (var i = 0; i < positions.length; i++)
						sum += positions[i].value;

					var averagePosition = this.clampIfWalled(sum / positions.length).position;
					this.positionModelSeries.add(averagePosition, time);
				}
				else {
					// Position by user-specified function
					var x = this.simulation.evaluateExpression(time);
					var position = this.clampIfWalled(x).position;
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

				this.positionGraphSeries.add(averagePosition, time);
				this.velocityGraphSeries.add(this.getPointAtTime(this.velocityModelSeries, time1StepsAgo, time));
				this.accelerationGraphSeries.add(this.getPointAtTime(this.accelerationModelSeries, time2StepsAgo, time));

				// Set instantaneous values
				
			}
		},

		/**
		 *
		 */
		addMouseData: function(value, time) {
			this.mouseDataSeries.add(value, time);
			this.set('position', value);
		},

		/**
		 *
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
		 * In PhET's MovingManModel, they had a setMousePosition function.
		 *   This is like that.
		 */
		setMousePosition: function(x) {
			if (this.mousePosition !== x) {
				this.mousePosition = this.clampIfWalled(x).position;

				// Once I figure out why we're doing this, I'll write a note here
				if (this.simulation.paused)
					this.set('position', this.mousePosition);
			}
		},

		positionDriven: function() {
			return this.motionStrategy === MOTION_STRATEGY_POSITION;
		},

		velocityDriven: function() {
			return this.motionStrategy === MOTION_STRATEGY_VELOCITY;
		},

		accelerationDriven: function() {
			return this.motionStrategy === MOTION_STRATEGY_ACCELERATION;
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
		 *
		 */
		estimatedCenteredDerivatives: function(series) {
			var radius = DERIVATIVE_RADIUS;
			var points = [];
			var range, derivative;
			for (var i = 0; i < series.size(); i++) {
				range = series.getPointsInRange(i - radius, i + radius);
				derivative = MotionMath.estimateDerivatives(range);
				points.push({
					value: derivative,
					time:  series.getPoint(i).time
				});
			}
			return points;
		},

		/**
		 *
		 */
		getTimeNTimeStepsAgo: function(n) {
			var index = this.times.length - 1 - n;
			if (index < 0) 
				index = times.length - 1;

			var t = this.times[index];
			if (t > this.time) 
				throw 'Found a time n steps ago that was later than t=time';
			else
				return t;
		}

	});

	return MovingMan;
});

define(function (require, exports, module) {

	'use strict';

	//var _ = require('underscore');
	var Formula = require('fparser');
	var bs      = require('common/binarysearch/binarysearch');

	var Simulation = require('common/simulation/simulation');
	var MovingMan  = require('models/moving-man');

	/**
	 * Constants
	 */

	/**
	 * Wraps the update function in 
	 */
	var MovingManSimulation = Simulation.extend({
		defaults: {
			containerWidth: 20,
			halfContainerWidth: 10,
			wallsEnabled: true,
			furthestRecordedTime: 0,
			maxTime: 20,
			recording: true
		},

		/**
		 * Object fields
		 */
		history: [],
		time: 0,
		positionFormula: null,
		
		/**
		 *
		 */
		initialize: function(options) {
			Simulation.prototype.initialize.apply(this, [options]);

			this.noRecording = options ? options.noRecording : false;
			if (this.noRecording)
				this.set('recording', false);

			this.initComponents();

			this.on('change:containerWidth', function() {
				this.set('halfContainerWidth', this.get('containerWidth') / 2);
			});
		},

		/**
		 *
		 */
		initComponents: function() {
			this.initMovingMan();
		},

		/**
		 *
		 */
		initMovingMan: function() {
			this.movingMan = new MovingMan(null, {
				simulation: this,
				noRecording: this.noRecording
			});
		},

		/**
		 *
		 */
		reset: function() {
			Simulation.prototype.reset.apply(this);

			// This is the fastest way to clear an array by benchmarks
			var history = this.history;
			while (history.length > 0) {
				history.pop();
			}

			this.time = 0;
		},

		/**
		 * Only runs if simulation isn't currently paused.
		 * If we're recording, it saves state
		 */
		_update: function(time, delta) {
			if (this.get('recording')) {
				// Run update and then save state
				this.movingMan.update(time, delta);
				this.recordState();
				this.set('furthestRecordedTime', time);
			}
			else {
				// Either we're playing back or we just don't ever record
				if (!this.noRecording) {
					// We're playing back, so apply a saved state instead of updating
					this.applyPlaybackState();

					// And if we've reached the end of what we've recorded, stop
					if (time >= this.get('furthestRecordedTime'))
						this.pause();
				}
				else
					this.movingMan.update(time, delta);
			}
		},

		/**
		 *
		 */
		positionWithinBounds: function(x) {
			return (x >= -this.get('halfContainerWidth') && x <= this.get('halfContainerWidth'));
		},

		/**
		 * Evaluates the custom user-specified expression
		 */
		evaluatePositionFunction: function(time) {
			if (this.positionFormula)
				return this.positionFormula.evaluate({ t: time });
			else
				return 0;
		},

		/**
		 * Tries to set the custom expression and throws error if the
		 *   expression is bad.
		 */
		useCustomPositionFunction: function(expression) {
			// Showing the try-catch block even though we pass the error up
			try {
				// If this next line throws an error, we know it's bad.
				Formula.calc(expression, { t: 0 });

				// So if we made it this far, we've got a winner.
				this.positionFormula = new Formula(expression);
				this.movingMan.positionDriven(true);
			}
			catch (e) {
				this.positionFormula = null;
				throw e;
			}
		},

		/**
		 *
		 */
		dropCustomPositionFunction: function() {
			this.positionFormula = null;
		},

		/**
		 *
		 */
		usingCustomPositionFunction: function() {
			return this.positionFormula !== null;
		},

		/**
		 * We need to set up some stuff before we can play back.  The
		 *   PhET version sorted the history by the time closest to
		 *   the current step time at each step and had a "todo" note
		 *   to make it something more efficient like a binary search, 
		 *   so I'm going ahead and implementing a binary search on a
		 *   presorted history instead of sorting states from all 
		 *   frames on every frame.
		 */
		play: function() {
			if (!this.get('recording')) {
				// Sort the historical states by time ascending
				_.sortBy(this.history, function(state) {
					return state.time;
				});

				/* Store just the times in a parallel array so we
				 *   can do a binary search.
				 */
				this._historyTimes = _.pluck(this.history, 'time');
			}

			Simulation.prototype.play.apply(this);
		},

		/**
		 *
		 */
		rewind: function() {
			this.time = 0;
		},	

		/**
		 *
		 */
		resetTimeAndHistory: function() {
			// This is the fastest way to clear an array by benchmarks
			var history = this.history;
			while (history.length > 0) {
				history.pop();
			}

			this.time = 0;

			this.movingMan.clear();
		},

		/**
		 * Sets playback mode to record
		 */
		record: function() {
			this.set('recording', true);
		},

		/**
		 * Sets playback mode to playback
		 */
		stopRecording: function() {
			this.set('recording', false);
		},

		/**
		 * Stores the current state of everything as a json object
		 *   in the history array for playback later.
		 */
		recordState: function() {
			this.history.push({
				time: this.time,
				wallsEnabled: this.get('wallsEnabled'),
				movingMan: this.movingMan.getState()
			});
		},

		/**
		 * Finds the appropriate state in history for this step and
		 *   applies it to the simulation.
		 */
		applyPlaybackState: function() {
			var state = this.findStateWithClosestTime(this.time);
			this.set('wallsEnabled', state.wallsEnabled);
			this.movingMan.applyState(this.time, state.movingMan);
			//console.log(state.movingMan.position, state.movingMan.velocity, state.movingMan.acceleration);
		},

		/**
		 * Performs a binary search to find the state whose time
		 *   is closest to the specified time.
		 */
		findStateWithClosestTime: function(time) {
			var stateIndex = bs.closest(this._historyTimes, time);
			return this.history[stateIndex];
		},

	});

	return MovingManSimulation;
});

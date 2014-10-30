define(function (require, exports, module) {

	'use strict';

	//var _ = require('underscore');
	var Formula = require('fparser');

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
			wallsEnabled: true
		},

		/**
		 * Object fields
		 */
		recording: true,
		history: [],
		positionFormula: null,
		
		/**
		 *
		 */
		initialize: function(options) {
			Simulation.prototype.initialize.apply(this, [options]);

			this.noRecording = options ? options.noRecording : false;

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
			this.movingMan = new MovingMan({
				simulation: this,
				noRecording: this.noRecording
			});
		},

		/**
		 * Only runs if simulation isn't currently paused.
		 */
		_update: function(time, delta) {
			if (this.recording) {
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
		 * Sets playback mode to record
		 */
		record: function() {
			this.recording = true;
		},

		/**
		 * Sets playback mode to playback
		 */
		stopRecording: function() {
			this.recording = false;
		},


	});

	return MovingManSimulation;
});

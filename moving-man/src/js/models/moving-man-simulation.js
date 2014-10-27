define(function (require) {

	'use strict';

	//var _ = require('underscore');

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
			customExpression: null,
			wallsEnabled: true
		},

		/**
		 * Object fields
		 */
		recording: true,
		history: [],
		
		/**
		 *
		 */
		initialize: function(options) {
			Simulation.prototype.initialize.apply(this, [options]);

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
				simulation: this
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
		evaluateExpression: function() {
			return 0;
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

define(function (require) {

	'use strict';

	//var _ = require('underscore');

	var Simulation = require('common/simulation/simulation');
	var MovingMan  = require('models/moving-man');

	/**
	 * Wraps the update function in 
	 */
	var MovingManSimulation = Simulation.extend({
		defaults: {
			containerWidth: 20,
			halfContainerWidth: 10,
			customExpression: null
		},
		
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
			this.movingMan.update(time, delta);
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
		}


	});

	return MovingManSimulation;
});

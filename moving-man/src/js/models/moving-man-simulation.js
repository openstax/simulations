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
			containerWidth: 20
		},
		
		/**
		 *
		 */
		initialize: function(options) {
			Simulation.prototype.initialize.apply(this, [options]);

			this.initComponents();
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
		}

	});

	return MovingManSimulation;
});

define(function (require) {

	'use strict';

	var _ = require('underscore');

	var Simulation = require('common/simulation/simulation');
	var MovingMan  = require('models/moving-man');

	/**
	 * Wraps the update function in 
	 */
	var MovingManSimulation = Simulation.extend({
		defaults: {

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
		 * 
		 */
		_update: function() {

		}

	});

	return MovingManSimulation;
});

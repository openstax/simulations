define(function (require) {

	'use strict';

	var _ = require('underscore');

	var Simulation = require('common/simulation/simulation');

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
			
		},

		/**
		 * 
		 */
		_update: function() {

		}

	});

	return MovingManSimulation;
});

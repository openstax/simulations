define(function (require, exports, module) {

	'use strict';

	var _ = require('underscore');

	var FixedIntervalSimulation = require('common/simulation/simulation');

	/**
	 * Constants
	 */

	/**
	 * 
	 */
	var EFCSimulation = FixedIntervalSimulation.extend({

		defaults: _.extend(FixedIntervalSimulation.prototype.defaults, {

		}),
		
		/**
		 *
		 */
		initialize: function(attributes, options) {
			FixedIntervalSimulation.prototype.initialize.apply(this, [attributes, options]);


		},

		/**
		 *
		 */
		applyOptions: function(options) {
			FixedIntervalSimulation.prototype.applyOptions.apply(this, [options]);

			
		},

		/**
		 *
		 */
		initComponents: function() {
			
		},

		/**
		 *
		 */
		reset: function() {
			FixedIntervalSimulation.prototype.reset.apply(this);

		},

		/**
		 *
		 */
		play: function() {
			// May need to save the current state here for the rewind button

			FixedIntervalSimulation.prototype.play.apply(this);
		},

		/**
		 *
		 */
		rewind: function() {
			// Apply the saved state
		},

		/**
		 * 
		 */
		_update: function(time, delta) {
			// For the time slider and anything else relying on time
			this.set('time', time);


		},

	});

	return EFCSimulation;
});

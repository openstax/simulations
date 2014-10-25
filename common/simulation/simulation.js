define(function (require) {

	'use strict';

	var Backbone = require('backbone');

	/**
	 * Wraps the update function in 
	 */
	var Simulation = Backbone.Model.extend({

		defaults: {
			wallsEnabled: true
		},
		
		/**
		 *
		 */
		initialize: function(options) {
			this.initComponents();
		},

		/**
		 *
		 */
		initComponents: function() {},

		/**
		 * 
		 */
		update: function(time, delta) {

			if (!this.paused) {
				this._update(time, delta);
			}
			
		},

		/**
		 * Only runs if the simulation isn't currently paused.
		 */
		_update: function(time, delta) {},

		play: function() {
			this.paused = false;
			this.trigger('play');
		},

		pause: function() {
			this.paused = true;
			this.trigger('pause');
		},

		reset: function() {
			this.initComponents();
		},

		postRender: function() {}

	});

	return Simulation;
});

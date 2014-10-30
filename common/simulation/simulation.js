define(function (require) {

	'use strict';

	var Backbone = require('backbone');

	/**
	 * Wraps the update function in 
	 */
	var Simulation = Backbone.Model.extend({

		defaults: {
			paused: false
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
				this._update(time / 1000, delta / 1000);
			}
			
		},

		/**
		 * Only runs if the simulation isn't currently paused.
		 */
		_update: function(time, delta) {},

		play: function() {
			this.paused = false;
			this.set('paused', false);
			this.trigger('play');
		},

		pause: function() {
			this.paused = true;
			this.set('paused', true);
			this.trigger('pause');
		},

		reset: function() {
			this.initComponents();
		},

		/**
		 * 
		 */
		postRender: function() {}

	});

	return Simulation;
});

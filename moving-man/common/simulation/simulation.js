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
		initialize: function(attributes, options) {
			this.time = 0;
			this.initComponents();
		},

		/**
		 *
		 */
		initComponents: function() {},

		/**
		 * Calls the internal _update function with an internally kept
		 *   time counter which is in seconds instead of milliseconds.
		 */
		update: function(time, delta) {

			if (!this.get('paused')) {
				delta /= 1000;
				this.time += delta;
				this._update(this.time, delta);
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

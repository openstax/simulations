define(function (require) {

	'use strict';

	var $ = require('jquery');
	var _ = require('underscore');

	var SimView      = require('common/app/sim');
	var GOSimulation = require('simulation');

	require('nouislider');
	require('bootstrap');

	// CSS
	require('less!styles/sim');
	require('less!common/styles/slider');
	require('less!common/styles/radio');

	// HTML
	var simHtml   = require('text!templates/sim.html');

	/**
	 * 
	 */
	var GOSimView = SimView.extend({

		/**
		 * Root element properties
		 */
		tagName:   'section',
		className: 'sim-view',

		/**
		 * Template for rendering the basic scaffolding
		 */
		template: _.template(simHtml),

		/**
		 * Dom event listeners
		 */
		events: {
			// Playback controls
			'click .play-btn'   : 'play',
			'click .pause-btn'  : 'pause',
			'click .reset-btn'  : 'reset'
		},

		/**
		 * Inits simulation, views, and variables.
		 *
		 * @params options
		 */
		initialize: function(options) {
			SimView.prototype.initialize.apply(this, [options]);

			// Initialize the 
		},

		/**
		 * Initializes the Simulation.
		 */
		initSimulation: function() {
			this.simulation = new GOSimulation();
		},

		/**
		 * Renders everything
		 */
		render: function() {
			this.$el.empty();

			this.renderScaffolding();

			return this;
		},

		/**
		 * Renders page content. Should be overriden by child classes
		 */
		renderScaffolding: function() {
			this.$el.html(this.template());
		},

		/**
		 * Called after every component on the page has rendered to make sure
		 *   things like widths and heights and offsets are correct.
		 */
		postRender: function() {
			
		},

		/**
		 *
		 */
		resetComponents: function() {
			SimView.prototype.resetComponents.apply(this);
			
		},

		/**
		 * This is run every tick of the updater.  It updates the wave
		 *   simulation and the views.
		 */
		update: function(time, delta) {
			// Update the model
			this.simulation.update(time, delta);

			// Update the scene
			
		},

		/**
		 * The simulation changed its paused state.
		 */
		pausedChanged: function() {
			if (this.simulation.get('paused'))
				this.$el.removeClass('playing');
			else
				this.$el.addClass('playing');
		},

	});

	return GOSimView;
});

define(function (require) {

	'use strict';

	var $ = require('jquery');
	var _ = require('underscore');

	var SimView      = require('common/app/sim');
	var SceneView    = require('views/scene');
	var GOSimulation = require('models/simulation');

	require('nouislider');
	require('bootstrap');

	// CSS
	require('less!styles/sim');
	require('less!styles/playback-controls');
	require('less!common/styles/slider');
	require('less!common/styles/radio');

	// HTML
	var simHtml        = require('text!templates/sim.html');
	var controlsHtml   = require('text!templates/playback-controls.html');

	/**
	 * 
	 */
	var EFCSimView = SimView.extend({

		/**
		 * Root element properties
		 */
		tagName:   'section',
		className: 'sim-view',

		/**
		 * Template for rendering the basic scaffolding
		 */
		template:                _.template(simHtml),
		propertiesPanelTemplate: _.template(propertiesHtml),

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

			// Initialize the scene view
			this.initSceneView();
		},

		// /**
		//  * Initializes the Simulation.
		//  */
		// initSimulation: function() {
		// 	this.simulation = new GOSimulation();
		// },

		/**
		 * Initializes the Simulation.
		 */
		initSceneView: function() {
			this.sceneView = new SceneView({
				simulation: this.simulation
			});
		},

		/**
		 * Renders everything
		 */
		render: function() {
			this.$el.empty();

			this.renderScaffolding();
			this.renderSceneView();
			this.renderPlaybackControls();

			return this;
		},

		/**
		 *
		 */
		renderSceneView: function() {
			this.sceneView.render();
			this.$('.scene-view-placeholder').replaceWith(this.sceneView.$el);
		},

		/**
		 * Renders page content. Should be overriden by child classes
		 */
		renderScaffolding: function() {
			this.$el.html(this.template());
		},

		/**
		 * Renders the playback controls at the bottom of the screen
		 */
		renderPlaybackControls: function() {
			this.$controls = $(this.controlsTemplate({
				unique: this.cid
			}));

			// Initialize speed slider
			this.$controls.find('.playback-speed').noUiSlider({
				start: 1,
				range: {
					'min': [ 0.2 ],
					'50%': [ 1 ],
					'max': [ 4 ]
				}
			});

			this.$('.playback-controls-placeholder').replaceWith(this.$controls);
		},

		/**
		 * Called after every component on the page has rendered to make sure
		 *   things like widths and heights and offsets are correct.
		 */
		postRender: function() {
			this.sceneView.postRender();
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
			this.sceneView.update(time, delta);
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

	return EFCSimView;
});

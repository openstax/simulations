define(function (require) {

	'use strict';

	var $                     = require('jquery');
	var _                     = require('underscore');
	var Backbone              = require('backbone');

	var SimView               = require('common/app/sim');
	var MovingManSimulation   = require('models/wave-sim');
	var SceneView             = require('views/scene');

	require('nouislider');

	// Templates
	var simHtml = require('text!templates/sim.html');

	/**
	 * 
	 */
	var MovingManSimView = SimView.extend({

		/**
		 * Root element properties
		 */
		tagName: 'section',
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
			'click .play-btn' : 'play',
			'click .pause-btn': 'pause',
			'click .step-btn' : 'step',
			'click .reset-btn': 'reset'
		},

		/**
		 * Inits simulation, views, and variables.
		 *
		 * @params options
		 */
		initialize: function(options) {
			options = _.extend({
				title: 'Simulation',
				name: 'sim'
			}, options);

			this.title = options.title;
			this.name  = options.name;

			// Initialize the HeatmapView
			this.initSceneView();
		},

		/**
		 * Initializes the Simulation.
		 */
		initSimulation: function() {
			this.simulation = new MovingManSimulation();
		},

		/**
		 * Initializes the SceneView.
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

			this.renderSceneView();
			this.renderPlaybackControls();

			return this;
		},

		/**
		 * Renders the scene view
		 */
		renderSceneView: function() {},

		/**
		 * Renders the playback controls
		 */
		renderPlaybackControls: function() {},

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
			this.initSceneView();
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
		}

	});

	return MovingManSimView;
});

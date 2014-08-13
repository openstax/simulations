define([
	'jquery', 
	'underscore', 
	'backbone',
	'pixi',

	'models/wave-simulation',
	'utils/updater'
], function ($, _, Backbone, PIXI, WaveSimulation, Updater) {

	'use strict';

	var SimView = Backbone.View.extend({

		/**
		 * Root element properties
		 */
		tagName: 'section',
		className: 'sim-view',

		/**
		 * Dom event listeners
		 */
		events: {
			'resize window'   : 'resize',
			'click .play-btn' : 'play',
			'click .pause-btn': 'pause',
			'click .step-btn' : 'step',
			'click .reset-btn': 'reset'
		},

		/**
		 * Inits stage, simulation, visualizers, and variables.
		 *
		 * @params options
		 */
		initialize: function(options) {
			options = options || {};

			this.stage = new PIXI.Stage(0xFFFFFF);

			this.waveSimulation = new WaveSimulation({
				damping:    options.simulationDamping,
				dimensions: options.simulationDimensions
			});

			this.update = _.bind(this.update, this);

			this.updater = new Updater();
			this.updater.addFrameListener(this.update);

			// Test code
			this.graphics = new PIXI.Graphics().beginFill(0x8888FF).moveTo(-50, -50).lineTo(50, 100).lineTo(100,-50).lineTo(-50,-50).endFill();
			this.graphics.position.x = 200;
			this.graphics.position.y = 200;
			this.direction = 1;
			this.stage.addChild(this.graphics);
		},

		/**
		 * Makes Simulation model properties accesssible
		 *
		 * @params key
		 */
		get: function(key) {
			if (this.model)
				return this.model.get(key);
			else
				return null;
		},

		/**
		 * Renders content and simulation canvas
		 */
		render: function() {
			this.$el.empty();

			this.renderContent();
			this.renderCanvas();

			return this;
		},

		/**
		 * Renders page content. Should be overriden by child classes
		 */
		renderContent: function() {},

		/**
		 * Initializes a renderer and prepends a canvas to the root element
		 */
		renderCanvas: function() {
			this.renderer = PIXI.autoDetectRenderer(null, null, null, false, true); // Turn on antialiasing

			var $renderer = $(this.renderer.view);
			$renderer.addClass('simulation-canvas');
			this.$el.prepend($renderer);
		},

		/**
		 * Called on a window resize to resize the canvas
		 */
		resize: function(event) {
			this.renderer.resize(this.$el.width(), this.$el.height());
		},

		/**
		 * Plays the simulation
		 */
		play: function(event) {
			this.updater.play();
		},

		/**
		 * Pauses the simulation
		 */
		pause: function(event) {
			this.updater.pause();
		},

		/**
		 * Plays the simulation for a specified duration
		 */
		step: function(event) {
			
			var milliseconds = 100;
			this.play();
			setTimeout(_.bind(this.pause, true), milliseconds);
		},

		/**
		 * Resets the simulation back to time zero.
		 */
		reset: function(event) {
			this.updater.reset();
			this.waveSimulation.reset();
		},

		update: function(delta) {


			// Test code
			this.graphics.rotation += (Math.PI / 8000) * delta;
			this.graphics.position.x += (200 / 1000) * delta * this.direction;

			if (this.graphics.position.x > 700)
				this.direction = -1;
			else if (this.graphics.position.x < 100)
				this.direction = 1;
			// End test code

			console.log(this.model.get('title') + ' ' + delta);
			
			// Update the model
			this.waveSimulation.update(this.updater.total);

			// Render everything
			this.renderer.render(this.stage);
		}

	});

	return SimView;
});

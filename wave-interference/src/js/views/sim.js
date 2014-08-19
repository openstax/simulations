define([
	'jquery', 
	'underscore', 
	'backbone',
	'pixi',

	'models/wave-sim',
	'utils/updater',

	'text!templates/sim-playback.html',
], function ($, _, Backbone, PIXI, WaveSimulation, Updater, playbackControls) {

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
			'click .play-btn' : 'play',
			'click .pause-btn': 'pause',
			'click .step-btn' : 'step',
			'click .reset-btn': 'reset',

			'change .oscillator-count': 'changeOscillatorCount',
			'change .frequency'       : 'changeFrequency',
			'change .amplitude'       : 'changeAmplitude',
			'change .barrier-style'   : 'changeBarrierStyle',
		},

		/**
		 * Inits stage, simulation, visualizers, and variables.
		 *
		 * @params options
		 */
		initialize: function(options) {
			options = options || {};

			this.stage = new PIXI.Stage(0xFFFFFF);

			this.waveSimulation = options.waveSimulation || new WaveSimulation();

			this.update = _.bind(this.update, this);

			this.updater = new Updater();
			this.updater.addFrameListener(this.update);

			// We want it to start playing when they first open the tab
			this.resumePaused = false;
			this.$el.addClass('playing');

			$(window).bind('resize', $.proxy(this.resize, this));


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
			this.renderPlaybackControls();

			return this;
		},

		/**
		 * Renders page content. Should be overriden by child classes
		 */
		renderContent: function() {},

		renderPlaybackControls: function() {
			this.$el.append(playbackControls);
		},

		/**
		 * Initializes a renderer and prepends a canvas to the root element
		 */
		renderCanvas: function() {
			this.renderer = PIXI.autoDetectRenderer(null, null, null, false, true); // Turn on antialiasing

			var $renderer = $(this.renderer.view);
			$renderer.addClass('sim-canvas');
			this.$el.prepend($renderer);
		},

		/**
		 * Called on a window resize to resize the canvas
		 */
		resize: function(event) {
			var $area = this.$el.parents('.sims');
			this.renderer.resize($area.width(), $area.height());
		},

		/**
		 * Click event handler that plays the simulation
		 */
		play: function(event) {
			this.updater.play();
			this.$el.addClass('playing');
		},

		/**
		 * Click event handler that pauses the simulation
		 */
		pause: function(event) {
			this.updater.pause();
			this.$el.removeClass('playing');
		},

		/**
		 * Click event handler that plays the simulation for a specified duration
		 */
		step: function(event) {
			var milliseconds = 20;

			// Set the UI to pause mode
			this.pause();

			// Play until a certain number of milliseconds has elapsed.
			this.updater.play();
			setTimeout(_.bind(this.updater.pause, this.updater), milliseconds);
		},

		/**
		 * Click event handler that resets the simulation back to time zero.
		 */
		reset: function(event) {
			this.updater.reset();
			this.waveSimulation.reset();
		},

		/**
		 * If we switch to a new sim, we pause this one,
		 *   but we want to save whether or not it was
		 *   paused already so it doesn't resume when we
		 *   don't want it to.
		 */
		halt: function() {
			this.updater.pause();
		},

		/**
		 * Used from the outside to continue execution but
		 *   paying attention to whether it was already
		 *   paused or not before it was halted.
		 */
		resume: function() {
			if (this.$el.hasClass('playing'))
				this.updater.play();
		},

		update: function(time, delta) {
			// Update the model
			this.waveSimulation.update(this.updater.total);

			// Render everything
			this.renderer.render(this.stage);
		},

		/**
		 * Click event handler for oscillator count radio buttons
		 */
		changeOscillatorCount: function(event) {
			var val = parseInt($(event.target).val());
			this.waveSimulation.set('oscillatorCount', val);

			if (val > 1)
				this.$('.oscillator-spacing').prev().addBack().removeAttr('disabled');
			else
				this.$('.oscillator-spacing').prev().addBack().attr('disabled', 'disabled');
		},

		changeFrequency: function(event) {
			this.waveSimulation.set('frequency', $(event.target).val());
		},

		changeAmplitude: function(event) {
			this.waveSimulation.set('amplitude', $(event.target).val());
		},

		changeBarrierStyle: function(event) {
			var val = parseInt($(event.target).val());

			if (val > 0)
				$(event.target).parents('fieldset').find('.slider').prev().addBack().removeAttr('disabled');
			else
				$(event.target).parents('fieldset').find('.slider').prev().addBack().attr('disabled', 'disabled');
		}
	});

	return SimView;
});

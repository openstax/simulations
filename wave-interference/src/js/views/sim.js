define(function (require) {

	'use strict';

	var $                = require('jquery');
	var _                = require('underscore');
	var Backbone         = require('backbone');
	var WaveSimulation   = require('models/wave-sim');
	var Updater          = require('utils/updater');
	var HeatmapView      = require('views/heatmap');
	var playbackControls = require('text!templates/sim-playback.html');


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
			// Playback controls
			'click .play-btn' : 'play',
			'click .pause-btn': 'pause',
			'click .step-btn' : 'step',
			'click .reset-btn': 'reset',

			// General Control-Panel
			'click .panel-btn': 'panelButtonClicked',

			// Tools
			'click .add-detector' : 'addDetector',

			// Simulation properties
			'change .oscillator-count':   'changeOscillatorCount',
			'slide  .oscillator-spacing': 'changeOscillatorSpacing',

			/*
			 * Note: the heatmap view looks smoother when we listen for the
			 *   'change' event instead of the 'slide' event, but then changes
			 *   only become live when sliding is finished.  The problem
			 *   with changing frequency quickly is that it has a drastic
			 *   effect on the sine function. Changing the frequency
			 *   modifies the input into the sine function, so changing
			 *   it quickly produces wildly different values, and we get
			 *   short, sporadic waves in our oscillator as we slide the
			 *   frequency handle, and then it takes a second to normalize.
			 *   This was also a problem in the original sim, but I was hoping
			 *   we could fix it in this version.
			 */
			'slide .frequency'       : 'changeFrequency',
			'slide .amplitude'       : 'changeAmplitude',

			'change .barrier-style'   : 'changeBarrierStyle',
			'click .add-barrier': 'addBarrier'
		},

		/**
		 * Inits stage, simulation, visualizers, and variables.
		 *
		 * @params options
		 */
		initialize: function(options) {
			options = _.extend({
				heatmapBrightness: 0.5
			}, options);

			this.waveSimulation = options.waveSimulation || new WaveSimulation();

			this.heatmapView = new HeatmapView({
				waveSimulation: this.waveSimulation,
				brightness: options.heatmapBrightness
			});

			// Updater stuff
			this.update = _.bind(this.update, this);

			this.updater = new Updater();
			this.updater.addFrameListener(this.update);

			this.interpolationFactor = 0;

			// We want it to start playing when they first open the tab
			this.resumePaused = false;
			this.$el.addClass('playing');

			this.on('remove', function() {
				this.unbind();
				this.updater.pause();
			});
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
			this.renderPlaybackControls();

			this.heatmapView.render();
			this.$el.append(this.heatmapView.el);

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
			var milliseconds = 50;

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
			this.pause();
			this.updater.reset();
			this.waveSimulation.reset();
			this.update(0, 0);
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
			this.interpolationFactor = this.waveSimulation.update(time, delta);

			// Update the heatmap
			this.heatmapView.update(this.interpolationFactor);
		},

		changeFrequency: function(event) {
			this.waveSimulation.set('frequency', $(event.target).val());
		},

		changeAmplitude: function(event) {
			this.waveSimulation.set('amplitude', $(event.target).val());
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

		changeOscillatorSpacing: function(event) {
			var val = parseFloat($(event.target).val()) / this.waveSimulation.get('dimensions').height;
			this.waveSimulation.set('oscillatorSpacing', val);
		},

		changeBarrierStyle: function(event) {
			var val = parseInt($(event.target).val());

			if (val > 0)
				$(event.target).parents('fieldset').find('.slider').prev().addBack().removeAttr('disabled');
			else
				$(event.target).parents('fieldset').find('.slider').prev().addBack().attr('disabled', 'disabled');

			this.waveSimulation.set('barrierStyle', val);
		},

		addBarrier: function(event) {
			
		},

		addDetector: function(event) {
			
		},

		panelButtonClicked: function(event) {
			event.preventDefault();

			$(event.target).addClass('clicked');
			setTimeout(function(){
				$(event.target).removeClass('clicked');
			}, 500);
		},
	});

	return SimView;
});

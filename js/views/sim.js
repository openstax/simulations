define(function (require) {

	'use strict';

	var $                = require('jquery');
	var _                = require('underscore');
	var Backbone         = require('backbone');
	var WaveSimulation   = require('models/wave-sim');
	var Updater          = require('utils/updater');
	var HeatmapView      = require('views/heatmap');
	var GraphView        = require('views/graph');
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
			'slide .slit-width'       : 'changeSlitWidth',
			'slide .barrier-location' : 'changeBarrierX',
			'slide .slit-separation'  : 'changeSlitSeparation',

			'click .add-segment-potential' : 'addSegmentPotential'
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
				x: {
					start: 0,
					end: this.waveSimulation.get('dimensions').width,
					step: this.waveSimulation.get('dimensions').width / 10,
					label: 'x (' + this.waveSimulation.get('units').distance + ')'
				},
				y: {
					start: 0,
					end: this.waveSimulation.get('dimensions').height,
					step: this.waveSimulation.get('dimensions').height / 10,
					label: 'y (' + this.waveSimulation.get('units').distance + ')'
				},
				waveSimulation: this.waveSimulation,
				brightness: options.heatmapBrightness
			});

			this.graphView = new GraphView({
				x: {
					start: 0,
					end: this.waveSimulation.get('dimensions').width,
					step: this.waveSimulation.get('dimensions').width / 10,
					label: 'x (' + this.waveSimulation.get('units').distance + ')',
					showNumbers: true
				},
				y: {
					start: -1,
					end: 1,
					step: 0.5,
					label: 'Water Level',
					showNumbers: false
				},
				waveSimulation: this.waveSimulation
			});

			// Updater stuff
			this.update = _.bind(this.update, this);

			this.updater = new Updater();
			this.updater.addFrameListener(this.update);

			this.interpolationFactor = 0;

			this.listenTo(this.waveSimulation, 'change:barrierX',         this.updateBarrierX);
			this.listenTo(this.waveSimulation, 'change:barrierSlitWidth', this.updateBarrierSlitWidth);

			// We want it to start playing when they first open the tab
			this.resumePaused = false;
			this.$el.addClass('playing');
		},

		remove: function() {
			Backbone.View.prototype.remove.apply(this);
			this.unbind();
			this.updater.pause();
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

			this.graphView.render();
			this.$el.append(this.graphView.el);

			// Name and cache barrier sliders for quick and easy access
			this.$slitWidth      = this.$('.properties-panel .slit-width').prev().addBack();
			this.$barrierX       = this.$('.properties-panel .barrier-location').prev().addBack();
			this.$slitSeparation = this.$('.properties-panel .slit-separation').prev().addBack();
			this.$barrierSliders = this.$slitWidth.add(this.$barrierX).add(this.$slitSeparation);

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
			this.waveSimulation.update(time, delta);

			// Update the heatmap
			this.heatmapView.update(time, delta);

			this.graphView.update(time, delta);
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

			switch (val) {
				case 1:
					this.$slitWidth.removeAttr('disabled');
					this.$barrierX.removeAttr('disabled');
					this.$slitSeparation.attr('disabled', 'disabled');
					break;
				case 2:
					this.$barrierSliders.removeAttr('disabled');
					break;
				default: 
					this.$barrierSliders.attr('disabled', 'disabled');
			} 

			this.waveSimulation.set('barrierStyle', val);
		},

		changeSlitWidth: function(event) {
			var val = parseFloat($(event.target).val());
			this.setFromInput('barrierSlitWidth', val);
		},

		changeBarrierX: function(event) {
			var val = parseFloat($(event.target).val());
			this.setFromInput('barrierX', val);
		},

		changeSlitSeparation: function(event) {
			var val = parseFloat($(event.target).val());
			this.setFromInput('barrierSlitSeparation', val);
		},

		updateBarrierX: function() {
			this.updateInput(this.$barrierX, this.waveSimulation.get('barrierX'));
		},

		updateBarrierSlitWidth: function() {
			this.updateInput(this.$slitWidth, this.waveSimulation.get('barrierSlitWidth'));
		},

		setFromInput: function(property, value) {
			if (this.updatingProperty)
				return;

			this.inputtingProperty = true;
			this.waveSimulation.set(property, value);
			this.inputtingProperty = false;
		},

		updateInput: function($input, value) {
			if (this.inputtingProperty)
				return;

			this.updatingProperty = true;
			$input.val(value);
			this.updatingProperty = false;
		},

		addSegmentPotential: function(event) {
			this.waveSimulation.addSegmentPotential();
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

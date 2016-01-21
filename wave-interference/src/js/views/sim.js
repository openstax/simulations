define(function (require) {

	'use strict';

	var $                     = require('jquery');
	var _                     = require('underscore');
	var Backbone              = require('backbone'); Backbone.$ = $;

	var AppView = require('common/app/app');

	var WaveSimulation        = require('../models/wave-sim');
	var Updater               = require('../utils/updater');

	var HeatmapView           = require('./heatmap');
	var CrossSectionGraphView = require('./graph/cross-section');
	var MeasuringTapeView     = require('./measuring-tape');
	var StopwatchView         = require('./stopwatch');
	var DetectorView          = require('./detector');

	require('nouislider');
	require('bootstrap');

	// CSS
	require('less!styles/sim');
	require('less!common/styles/slider');
	require('less!common/styles/radio');

	// Templates
	var simHtml                = require('text!../../templates/sim.html');
	var controlPanelHtml       = require('text!../../templates/control-panel.html');
	var toolsHtml              = require('text!../../templates/control-panel-components/tools.html');
	var waveControlsHtml       = require('text!../../templates/control-panel-components/wave.html');
	var oscillatorControlsHtml = require('text!../../templates/control-panel-components/oscillators.html');
	var barrierControlsHtml    = require('text!../../templates/control-panel-components/barriers.html');
	var playbackControlsHtml   = require('text!../../templates/playback-controls.html');


	/*
	 * "Local" variables for functions to share and recycle
	 */
	var i;


	/**
	 * SimView represents a tab in the simulation.  SimView is extended to create
	 *   three new views representing the water, sound, and light tabs.  SimViews
	 *   interface with a WaveSimulation and contain all necessary views for
	 *   visualizing and interacting with a wave simulation.
	 */
	var SimView = Backbone.View.extend({

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
			'click .reset-btn': 'reset',

			// General Control-Panel
			'click .tab'      : 'tabClicked',
			'click .panel-btn': 'panelButtonClicked',

			// Tools
			'click  .add-detector'         : 'addDetector',
			'change .measuring-tape-check' : 'toggleMeasuringTape',
			'change .stopwatch-check'      : 'toggleStopwatch',

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
				heatmapBrightness: 0.5,
				title: 'Simulation',
				name: 'sim',
				link: 'wave-interference',
				segmentPotentialName: 'Wall',
				detectorYLabel: 'Water Level'
			}, options);

			this.heatmapBrightness = options.heatmapBrightness;
			this.title = options.title;
			this.name  = options.name;
			this.link = options.link;
			this.segmentPotentialName = options.segmentPotentialName;
			this.detectorYLabel = options.detectorYLabel;

			// Initialize the WaveSimulation
			this.initWaveSimulation();

			// Initialize the HeatmapView
			this.initHeatmapView();

			// Initialize the GraphView
			this.initCrossSectionGraphView();

			// Detector views to update
			this.detectorViews = [];

			// Stepping
			this._stepFinished = _.bind(this._stepFinished, this);

			// Updater stuff
			this.update = _.bind(this.update, this);

			this.updater = new Updater();
			this.updater.addEventListener('update', this.update);

			this.interpolationFactor = 0;

			this.listenTo(this.waveSimulation, 'change:barrierX',         this.updateBarrierX);
			this.listenTo(this.waveSimulation, 'change:barrierSlitWidth', this.updateBarrierSlitWidth);

			this.listenTo(this.heatmapView, 'cross-section-slide-start', this.crossSectionSlideStart);
			this.listenTo(this.heatmapView, 'cross-section-slide-stop',  this.crossSectionSlideStop);

			// We want it to start playing when they first open the tab
			this.resumePaused = false;
			this.$el.addClass('playing');
		},

		/**
		 * Called when the view is being removed. Unbinds bound events
		 *   and stops the updater.
		 */
		remove: function() {
			Backbone.View.prototype.remove.apply(this);
			this.unbind();
			this.updater.pause();
		},

		/**
		 * Initializes the WaveSimulation.
		 */
		initWaveSimulation: function() {
			this.waveSimulation = new WaveSimulation();
		},

		/**
		 * Initializes the HeatmapView.
		 */
		initHeatmapView: function() {
			this.heatmapView = new HeatmapView(this.getHeatmapViewOptions());
		},

		/**
		 * Uses the sim view's WaveSimulation instance to determine
		 *   appropriate options for initializing the HeatmapView
		 *   and returns them as an object.
		 */
		getHeatmapViewOptions: function() {
			return {
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
				brightness: this.heatmapBrightness
			};
		},

		/**
		 * Initializes the CrossSectionGraphView.
		 */
		initCrossSectionGraphView: function() {
			this.crossSectionGraphView = new CrossSectionGraphView(this.getGraphViewOptions());
		},

		/**
		 * Uses the sim view's WaveSimulation instance to determine
		 *   appropriate options for initializing the GraphView and
		 *   returns them as an object.
		 */
		getGraphViewOptions: function() {
			return {
				title: 'Cross-Section Side View',
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
				waveSimulation: this.waveSimulation,
				heatmapView: this.heatmapView
			};
		},

		/**
		 * Renders everything
		 */
		render: function() {
			this.$el.empty();

			this.renderScaffolding();
			this.renderControlPanel();
			this.renderHeatmapView();
			this.renderGraphView();
			this.renderPlaybackControls();
			this.renderTools();

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
		renderScaffolding: function() {
			this.$el.html(this.template());
		},

		/**
		 * Renders the control panel and all its controls.
		 */
		renderControlPanel: function() {
			var $controlPanel = $(controlPanelHtml);

			// Run the template for the oscillator controls
			var oscillatorControls = _.template(oscillatorControlsHtml)({
				oscillatorName:       this.waveSimulation.get('oscillatorName'),
				oscillatorNamePlural: this.waveSimulation.get('oscillatorNamePlural'),
				unique: this.cid
			});

			var barrierControls = _.template(barrierControlsHtml)({
				unique: this.cid,
				segmentPotentialName: this.segmentPotentialName
			});

			var tools = _.template(toolsHtml)({
				unique: this.cid
			});

			var waveControls = _.template(waveControlsHtml)({
				unique: this.cid
			});

			// Fill the tools section of the control panel
			$controlPanel.find('.tools-panel')
				.append(tools);

			// Fill the properties section of the control panel
			$controlPanel.find('.properties-panel')
				.append(oscillatorControls)
				.append(barrierControls);

			this.$('.heatmap-column').after(waveControls);

			// Initialize all of the sliders
			this.$('.frequency').noUiSlider({
				start: this.waveSimulation.get('frequency'),
				connect: 'lower',
				range: {
					min: this.waveSimulation.get('minFrequency'),
					max: this.waveSimulation.get('maxFrequency')
				}
			});

			this.$('.amplitude').noUiSlider({
				start: this.waveSimulation.get('amplitude'),
				connect: 'lower',
				range: {
					min: this.waveSimulation.get('minAmplitude'),
					max: this.waveSimulation.get('maxAmplitude')
				}
			});

			$controlPanel.find('.oscillator-spacing').noUiSlider({
				start: this.waveSimulation.get('dimensions').height / 2,
				connect: 'lower',
				range: {
					min: 0,
					'50%': this.waveSimulation.get('dimensions').height / 2,
					max: this.waveSimulation.get('dimensions').height
				}
			});

			// this.$('#drip-spacing').noUiSlider_pips({
			// 	mode: 'range',
			// 	density: 5
			// });

			$controlPanel.find('.slit-width').noUiSlider({
				start: this.waveSimulation.get('barrierSlitWidth'),
				connect: 'lower',
				range: {
					min: 0,
					max: this.waveSimulation.get('dimensions').height / 2
				}
			});

			var simWidth = this.waveSimulation.get('dimensions').width
			$controlPanel.find('.barrier-location').noUiSlider({
				start: this.waveSimulation.get('barrierX'),
				connect: 'lower',
				range: {
					min: 0,
					max: simWidth - (2.5 * simWidth / this.waveSimulation.get('latticeSize').width)
				}
			});

			$controlPanel.find('.slit-separation').noUiSlider({
				start: this.waveSimulation.get('barrierSlitSeparation'),
				connect: 'lower',
				range: {
					min: 0,
					max: this.waveSimulation.get('dimensions').height * 0.75
				}
			});

			// Place it in the view
			this.$('#control-panel-placeholder').replaceWith($controlPanel);
		},

		/**
		 * Renders the heatmap view
		 */
		renderHeatmapView: function() {
			this.heatmapView.render();
			this.$('#heatmap-view-placeholder').replaceWith(this.heatmapView.el);
		},

		/**
		 * Renders the graph view
		 */
		renderGraphView: function() {
			this.crossSectionGraphView.render();
			this.$('#graph-view-placeholder').replaceWith(this.crossSectionGraphView.el);
		},

		/**
		 * Renders the playback controls
		 */
		renderPlaybackControls: function() {
			this.$('#playback-controls-placeholder').replaceWith(playbackControlsHtml);
		},

		/**
		 * Renders the measuring tape and stopwatch views
		 */
		renderTools: function() {
			this.measuringTapeView = new MeasuringTapeView({
				heatmapView: this.heatmapView,
				dragFrame: this.el
			});
			this.measuringTapeView.render();
			this.$el.append(this.measuringTapeView.el);

			this.stopwatchView = new StopwatchView({
				heatmapView: this.heatmapView,
				dragFrame: this.el
			});
			this.stopwatchView.render();
			this.$el.append(this.stopwatchView.el);
		},

		/**
		 * Called after every component on the page has rendered to make sure
		 *   things like widths and heights and offsets are correct.
		 */
		postRender: function() {
			this.heatmapView.postRender();
			this.crossSectionGraphView.postRender();

			this.measuringTapeView.hide();
			this.stopwatchView.hide();

			if (AppView.windowIsShort())
				this.$('.wave-properties').detach().prependTo(this.$('.properties-panel'));
		},

		/**
		 * Click event handler that plays the simulation
		 */
		play: function(event) {
			this.waveSimulation.play();
			this.$el.addClass('playing');
		},

		/**
		 * Click event handler that pauses the simulation
		 */
		pause: function(event) {
			this.waveSimulation.pause();
			this.$el.removeClass('playing');
		},

		/**
		 * Click event handler that plays the simulation for a specified duration
		 */
		step: function(event) {
			var milliseconds = 50;

			this.play();

			// Set the UI to pause mode
			this.$el.removeClass('playing');

			// Play until a certain number of milliseconds has elapsed.
			setTimeout(this._stepFinished, milliseconds);
		},

		/**
		 * Called after a step through is finished
		 */
		_stepFinished: function() {
			this.pause();
		},

		/**
		 * Click event handler that resets the simulation back to time zero.
		 */
		reset: function(event) {
			if (!window.confirm('Are you sure you want to reset everything?'))
				return;

			// Save whether or not it was paused when we reset
			var wasPaused = this.waveSimulation.paused;

			// Set pause the updater and reset everything
			this.updater.pause();
			this.updater.reset();
			this.resetComponents();
			this.render();
			this.postRender();

			// Paint the first frame
			this.waveSimulation.play();
			this.update(0, 0);
			this.waveSimulation.pause();

			// Resume normal function
			this.updater.play();
			if (!wasPaused)
				this.waveSimulation.play();
		},

		/**
		 *
		 */
		resetComponents: function() {
			this.waveSimulation.reset();
			this.initWaveSimulation();
			this.initHeatmapView();
			this.initCrossSectionGraphView();
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
			this.updater.play();
		},

		/**
		 * This is run every tick of the updater.  It updates the wave
		 *   simulation and the views.
		 */
		update: function(time, delta) {
			// Update the model
			this.waveSimulation.update(time, delta);

			// Update the views
			this.heatmapView.update(time, delta);
			this.crossSectionGraphView.update(time, delta);
			this.measuringTapeView.update(time, delta);
			this.stopwatchView.update(time, delta);

			for (i = 0; i < this.detectorViews.length; i++)
				this.detectorViews[i].update(time, delta);
		},

		tabClicked: function(event) {
			var $tab = $(event.target).closest('.tab');
			if (!$tab.hasClass('active')) {
				// Activate the right tab, deactivating the others
				var selector = $tab.data('content-selector');
				$tab.add(this.$(selector))
					.addClass('active')
					.siblings()
					.removeClass('active');
			}
		},

		/**
		 * Respond to changes from the frequency slider
		 */
		changeFrequency: function(event) {
			this.waveSimulation.set('frequency', $(event.target).val());
		},

		/**
		 * Respond to changes from the amplitude slider
		 */
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

		/**
		 * Respond to changes from the oscillator spacing slider
		 */
		changeOscillatorSpacing: function(event) {
			var val = parseFloat($(event.target).val()) / this.waveSimulation.get('dimensions').height;
			this.waveSimulation.set('oscillatorSpacing', val);
		},

		/**
		 * Respond to clicks on the barrier style radio buttons
		 */
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

		/**
		 * Respond to changes from the barrier slit width slider
		 */
		changeSlitWidth: function(event) {
			var val = parseFloat($(event.target).val());
			this.setFromInput('barrierSlitWidth', val);
		},

		/**
		 * Respond to changes from the barrier location slider
		 */
		changeBarrierX: function(event) {
			var val = parseFloat($(event.target).val());
			this.setFromInput('barrierX', val);
		},

		/**
		 * Respond to changes from the barrier slit separation slider
		 */
		changeSlitSeparation: function(event) {
			var val = parseFloat($(event.target).val());
			this.setFromInput('barrierSlitSeparation', val);
		},

		/**
		 * Set the barrier location slider to match changes in the wave simulation properties
		 */
		updateBarrierX: function() {
			this.updateInput(this.$barrierX, this.waveSimulation.get('barrierX'));
		},

		/**
		 * Set the barrier slit width slider to match changes in the wave simulation properties
		 */
		updateBarrierSlitWidth: function() {
			this.updateInput(this.$slitWidth, this.waveSimulation.get('barrierSlitWidth'));
		},

		/**
		 * Helper function for setting properties on the waveSimulation without causing a
		 *   loop of updates between the wave simulation model and the view
		 */
		setFromInput: function(property, value) {
			if (this.updatingProperty)
				return;

			this.inputtingProperty = true;
			this.waveSimulation.set(property, value);
			this.inputtingProperty = false;
		},

		/**
		 * Helper function for updating inputs from the wave simulation without causing a
		 *   loop of updates between the wave simulation model and the view
		 */
		updateInput: function($input, value) {
			if (this.inputtingProperty)
				return;

			this.updatingProperty = true;
			$input.val(value);
			this.updatingProperty = false;
		},

		/**
		 * Tells the wave simulation to add a new segment potential
		 */
		addSegmentPotential: function(event) {
			this.waveSimulation.addSegmentPotential();
		},

		/**
		 * Adds a DetectorView and renders it puts it in an array for updating
		 */
		addDetector: function(event) {
			var detectorView = new DetectorView({
				waveSimulation: this.waveSimulation,
				heatmapView: this.heatmapView,
				dragFrame: this.el,
				yLabel: this.detectorYLabel
			});
			detectorView.render();
			this.$el.append(detectorView.el);
			detectorView.postRender();

			this.listenTo(detectorView, 'remove', function(){
				this.detectorViews = _.without(this.detectorViews, detectorView);
			});

			this.detectorViews.push(detectorView);
		},

		/**
		 * Toggles the measuring tape's visibility
		 */
		toggleMeasuringTape: function(event) {
			if ($(event.target).is(':checked'))
				this.measuringTapeView.show();
			else
				this.measuringTapeView.hide();
		},

		/**
		 * Toggles the stopwatch's visibility
		 */
		toggleStopwatch: function(event) {
			if ($(event.target).is(':checked'))
				this.stopwatchView.show();
			else
				this.stopwatchView.hide();
		},

		/**
		 * This just add and removes classes for an animation on panel buttons.
		 */
		panelButtonClicked: function(event) {
			event.preventDefault();

			$(event.target).addClass('clicked');
			setTimeout(function(){
				$(event.target).removeClass('clicked');
			}, 500);
		},

		/**
		 * Tell the graph view that we're making changes to the cross section location.
		 */
		crossSectionSlideStart: function() {
			this.crossSectionGraphView.startChanging();
		},

		/**
		 * Tell the graph view that we've stopped making changes to the cross section
		 *   location.
		 */
		crossSectionSlideStop: function(){
			this.crossSectionGraphView.stopChanging();
		}

	});

	return SimView;
});

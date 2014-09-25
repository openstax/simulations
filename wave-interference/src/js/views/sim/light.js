define(function (require) {

	'use strict';

	var _ = require('underscore');

	var Utils = require('utils/utils');

	var LightSimulation  = require('models/wave-sim/light');
	var LightHeatmapView = require('views/heatmap/light');
	var ScreenGraphView  = require('views/graph/screen');
	var SimView          = require('views/sim');

	/*
	 * Constants
	 */
	var SPEED_OF_LIGHT = 1000;

	/**
	 *
	 */
	var LightSimView = SimView.extend({

		events: _.extend({
			'slide  .wavelength' : 'changeWavelength'
		}, SimView.prototype.events),

		initialize: function(options) {
			options = _.extend({
				heatmapBrightness: 0.5,
				title: 'Light',
				segmentPotentialName: 'Mirror'
			}, options);
			
			SimView.prototype.initialize.apply(this, [ options ]);

			this.initScreenGraphView();
		},

		/**
		 * Initializes the WaveSimulation.
		 */
		initWaveSimulation: function() {
			this.waveSimulation = new LightSimulation();
		},

		/**
		 * Initializes the HeatmapView.
		 */
		initHeatmapView: function() {
			this.heatmapView = new LightHeatmapView(this.getHeatmapViewOptions());
		},

		/**
		 * Uses the sim view's WaveSimulation instance to determine
		 *   appropriate options for initializing the GraphView and
		 *   returns them as an object.
		 */
		getGraphViewOptions: function() {
			return {
				title: 'Electric Field Across X-Axis',
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
					label: 'Electric Field',
					showNumbers: false
				},
				waveSimulation: this.waveSimulation,
				heatmapView: this.heatmapView
			};
		},

		/**
		 * Initializes the ScreenGraphView.
		 */
		initScreenGraphView: function() {
			this.screenGraphView = new ScreenGraphView({
				waveSimulation: this.waveSimulation,
				heatmapView: this.heatmapView
			});
		},

		/**
		 *
		 */
		render: function() {
			SimView.prototype.render.apply(this);

			this.renderScreenGraphView();
		},

		/**
		 * Renders the graph view
		 */
		renderScreenGraphView: function() {
			this.screenGraphView.render();
			this.heatmapView.$el.before(this.screenGraphView.el);
		},

		/**
		 * Renders the control panel and all its controls.
		 */
		renderControlPanel: function() {
			SimView.prototype.renderControlPanel.apply(this);

			// Create a wavelength slider
			var $wavelengthSlider = $('<div class="slider wavelength" id="wavelength">');
			$wavelengthSlider.noUiSlider({
				start: 700,
				range: {
					min: Math.MIN_WAVELENGTH,
					max: Math.MAX_WAVELENGTH
				}
			})

			// Create a canvas background for the wavelength slider
			this.$wavelengthSliderCanvas = $('<canvas class="wavelength-slider-canvas">').prependTo($wavelengthSlider);

			// Need to add an element to the handle because it's difficult to modify the css for a pseudo-element.
			this.$wavelengthSliderHandle = $('<div class="handle-content">').appendTo($wavelengthSlider.find('.noUi-handle'));

			// Replace the frequency slider and change the label
			var $frequencySlider = this.$('.frequency');
			$frequencySlider.prev('label').attr('for', $wavelengthSlider.attr('id')).html('Wavelength');
			$frequencySlider.replaceWith($wavelengthSlider);
		},

		/**
		 * Called after every component on the page has rendered to make sure
		 *   things like widths and heights and offsets are correct.
		 */
		postRender: function() {
			SimView.prototype.postRender.apply(this);

			// Resize the wavelength slider canvas and paint the colors
			var $slider = this.$wavelengthSliderCanvas.parent();
			var height = 16;
			var width  = $slider.width() + height;
			this.$wavelengthSliderCanvas[0].width  = width;
			this.$wavelengthSliderCanvas[0].height = height;
			this.$wavelengthSliderCanvas.width(width);
			this.$wavelengthSliderCanvas.paintVisibleLightSpectrum();

			// Set the starting color
			$slider.trigger('slide');
		},

		/**
		 *
		 */
		resetComponents: function() {
			SimView.prototype.resetComponents.apply(this);

			this.initScreenGraphView();
		},

		update: function(time, delta) {
			if (!this.waveSimulation.paused) {
				this.screenGraphView.update(time, delta);
			}

			SimView.prototype.update.apply(this, [time, delta]);
		},

		/**
		 * Handles wavelength slider slide events
		 */
		changeWavelength: function(event) {
			var wavelength = parseInt($(event.target).val());
			var rgb = Math.nmToRGB(wavelength);
			var hex = Utils.rgbToHex(rgb.red, rgb.green, rgb.blue);

			this.$wavelengthSliderHandle.css('background-color', hex);

			this.heatmapView.color = hex;

			this.waveSimulation.set('wavelength', wavelength);
			this.waveSimulation.set('frequency', SPEED_OF_LIGHT / wavelength);
			this.waveSimulation.resetWave();
		},

	});

	return LightSimView;
});

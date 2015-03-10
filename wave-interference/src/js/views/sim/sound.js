define(function (require) {

	'use strict';

	// This bower module doesn't satisfy AMD, so I'm just trying to satisfy the linter
	require('timbre'); var T = window.T;

	var _ = require('underscore');
	var $ = require('jquery');

	var SoundSimulation  = require('../../models/wave-sim/sound');
	var SoundHeatmapView = require('../heatmap/sound');
	var SimView          = require('../sim');

	var audioControlsHtml    = require('text!../../../templates/control-panel-components/audio.html');
	var particleControlsHtml = require('text!../../../templates/control-panel-components/particles.html');

	// CSS
	require('less!styles/sound');
	

	var SoundSimView = SimView.extend({

		events: _.extend({
			'slide  .sound-volume' : 'changeVolume',
			'change .sound-check'  : 'toggleSound',

			'change .heatmap-mode'   : 'changeHeatmapMode',
		}, SimView.prototype.events),

		initialize: function(options) {
			options = _.extend({
				heatmapBrightness: 0.5,
				title: 'Sound',
				detectorYLabel: 'Pressure'
			}, options);
			
			SimView.prototype.initialize.apply(this, [ options ]);

			this.volume = 50;
			this.frequencyScale = 440 / 0.5; // from PhET's SoundModuleAudio class

			this.sound = T('sin');
			this.sound.set({ 
				freq: parseFloat(this.waveSimulation.get('frequency')) * this.frequencyScale, 
				mul: this.volume / 100 
			});

			this.listenTo(this.waveSimulation, 'change:frequency', this.frequencyChanged);
		},

		/**
		 * Initializes the WaveSimulation.
		 */
		initWaveSimulation: function() {
			this.waveSimulation = new SoundSimulation();
		},

		/**
		 * Initializes the HeatmapView.
		 */
		initHeatmapView: function() {
			this.heatmapView = new SoundHeatmapView(this.getHeatmapViewOptions());
		},

		/**
		 * Uses the sim view's WaveSimulation instance to determine
		 *   appropriate options for initializing the GraphView and
		 *   returns them as an object.
		 */
		getGraphViewOptions: function() {
			return {
				title: 'Pressure Across X-Axis',
				x: {
					start: 0,
					end: this.waveSimulation.get('dimensions').width,
					step: this.waveSimulation.get('dimensions').width / 10,
					label: 'x-Position (' + this.waveSimulation.get('units').distance + ')',
					showNumbers: true
				},
				y: {
					start: -1,
					end: 1,
					step: 0.5,
					label: 'Pressure',
					showNumbers: false
				},
				waveSimulation: this.waveSimulation,
				heatmapView: this.heatmapView
			};
		},

		/**
		 * Renders the control panel and all its controls.
		 */
		renderControlPanel: function() {
			SimView.prototype.renderControlPanel.apply(this);

			var audioControls    = _.template(audioControlsHtml)(   { unique: this.cid });
			var particleControls = _.template(particleControlsHtml)({ unique: this.cid });

			var $audioControls = $(audioControls);
			$audioControls.find('.sound-volume').noUiSlider({
				start: this.volume,
				connect: 'lower',
				range: {
					min: 0,
					max: 100
				}
			});
			this.$('.oscillator-controls').before($audioControls);

			$(particleControls).insertBefore($audioControls);
		},

		/**
		 * Updates simulation and visual components in the render loop
		 */
		update: function(time, delta) {
			SimView.prototype.update.apply(this, [time, delta]);
		},

		/**
		 * Handles volume slider slide events
		 */
		changeVolume: function(event) {
			var volume = parseInt($(event.target).val());

			if (volume === 0) {
				this.nullVolume = true;
				this.$('.sound-volume-slider-wrapper .fa-volume-off').show();
				this.$('.sound-volume-slider-wrapper .fa-volume-down').hide();
			}
			else if (this.nullVolume) {
				this.nullVolume = false;
				this.$('.sound-volume-slider-wrapper .fa-volume-down').show();
				this.$('.sound-volume-slider-wrapper .fa-volume-off').hide();
			}

			this.volume = volume;
			this.sound.set({ mul: this.volume / 100 });
		},

		/**
		 * Changes the frequency of the sound based on the frequency in the wave simulation
		 */
		frequencyChanged: function() {
			this.sound.set({ freq: parseFloat(this.waveSimulation.get('frequency')) * this.frequencyScale });
		},

		toggleSound: function(event) {
			if ($(event.target).is(':checked'))
				this.sound.play();
			else
				this.sound.pause();
		},

		changeHeatmapMode: function(event) {
			var mode = $(event.target).val();

			if (mode == 'heatmap')
				this.heatmapView.disablePressureParticles();
			else
				this.heatmapView.enablePressureParticles();
		}
	});

	return SoundSimView;
});

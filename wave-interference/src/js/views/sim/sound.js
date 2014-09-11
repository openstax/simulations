define(function (require) {

	'use strict';

	require('timbre');

	var SoundSimulation  = require('models/wave-sim/sound');
	var SimView          = require('views/sim');

	var audioControlsHtml = require('text!templates/control-panel-components/audio.html');

	var SoundSimView = SimView.extend({

		events: _.extend({
			'slide  .sound-volume' : 'changeVolume',
			'change .sound-check'  : 'toggleSound',
		}, SimView.prototype.events),

		initialize: function(options) {
			options = _.extend({
				heatmapBrightness: 0.5,
				title: 'Sound'
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
		 * Renders the control panel and all its controls.
		 */
		renderControlPanel: function() {
			SimView.prototype.renderControlPanel.apply(this);

			var $audioControls = $(audioControlsHtml);

			$audioControls.find('.sound-volume').noUiSlider({
				start: this.volume,
				connect: 'lower',
				range: {
					min: 0,
					max: 100
				}
			});

			this.$('.oscillator-controls').before($audioControls);
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

		toggleSound: function() {
			if ($(event.target).is(':checked'))
				this.sound.play();
			else
				this.sound.pause();
		}
	});

	return SoundSimView;
});

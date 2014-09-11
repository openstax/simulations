define(function (require) {

	'use strict';

	var SoundSimulation  = require('models/wave-sim/sound');
	var SimView          = require('views/sim');

	var audioControlsHtml = require('text!templates/control-panel-components/audio.html');

	var SoundSimView = SimView.extend({

		events: _.extend({
			'slide .sound-volume'  : 'changeVolume',
		}, SimView.prototype.events),

		initialize: function(options) {
			options = _.extend({
				heatmapBrightness: 0.5,
				title: 'Sound'
			}, options);
			
			SimView.prototype.initialize.apply(this, [ options ]);
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
				start: 50,
				connect: 'lower',
				range: {
					min: 0,
					max: 100
				}
			});

			this.$('.oscillator-controls').before($audioControls);
		},

		update: function(time, delta) {
			SimView.prototype.update.apply(this, [time, delta]);
		}
	});

	return SoundSimView;
});

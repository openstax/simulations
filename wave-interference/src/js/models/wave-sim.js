define([
	'underscore', 
	'backbone',

	'models/lattice2d',
	'models/oscillator',
	'models/wave-propagator'
], function (_, Backbone, Lattice2D, Oscillator, WavePropagator) {

	'use strict';

	var WaveSimulation = Backbone.Model.extend({
		defaults: {
			damping: {
				x: 20,
				y: 20
			},
			dimensions: {
				width: 100,
				height: 100
			},
			units: {
				distance: 'm',
				time: 's'
			},
			time: 0,
			timeScale: 1.0,

			oscillatorCount: 1,
			frequency: 0.5,
			amplitude: 1.0
		},
		
		initialize: function(options) {

			// Default options
			options = _.extend({
				/**
				 * Lattice size should only matter internally.
				 * It's basically the simulation's level of 
				 *   precision. Conversions
				 */
				latticeSize: {
					width: 60,
					height: 60
				}
			}, options);

			// Lattice
			this.lattice = new Lattice2D({
				width: options.latticeSize.width,
				height: options.latticeSize.height,
				initialValue: 0
			});

			// Wave propagator
			this.propagator = new WavePropagator({
				lattice: this.lattice
			});

			// Oscillators
			this.initOscillators();

			// Event listeners
			this.on('change:oscillatorCount', this.initOscillators);
			this.on('change:frequency',       this.changeFrequency);
			this.on('change:amplitude',       this.changeAmplitude);
		},

		update: function(time, delta) {

			this.propagator.propagate();
			this.oscillators[0].update(time);

			// var lat = this.lattice.data;
			// var width = this.lattice.width;
			// var height = this.lattice.height;

			// var val;

			// for (var i = 0; i < width; i++) {
			// 	for (var j = 0; j < height; j++) {
			// 		val = lat[i][j] + Math.random() * 0.2 - 0.1;
			// 		if (val > 1)
			// 			val = 1;
			// 		if (val < 0)
			// 			val = 0;
			// 		lat[i][j] = val;
			// 	}
			// }
		},

		reset: function() {

		},

		resize: function() {
			
		},

		initOscillators: function() {
			this.oscillators = [];
			for (var i = 0; i < this.get('oscillatorCount'); i++) {
				this.oscillators.push(new Oscillator({
					frequency: this.get('frequency'),
					amplitude: this.get('amplitude'),
					lattice:   this.lattice,
					x: 4,
					y: 30,
					radius: 2
				}));
			}
		},

		changeFrequency: function(model, value) {
			_.each(this.oscillators, function(oscillator) {
				oscillator.frequency = value;
			}, this);
		},

		changeAmplitude: function(model, value) {
			_.each(this.oscillators, function(oscillator) {
				oscillator.amplitude = value;
			}, this);
		}
	});

	return WaveSimulation;
});

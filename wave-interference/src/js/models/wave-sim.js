define([
	'underscore', 
	'backbone',

	'models/lattice2d',
	'models/oscillator'
], function (_, Backbone, Lattice2D, Oscillator) {

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

			this.oscillators = [];

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

			this.lattice = new Lattice2D({
				width: options.latticeSize.width,
				height: options.latticeSize.height,
				initialValue: 0
			});

			this.on('change:oscillatorCount', this.initOscillators);
			this.on('change:frequency',       this.changeFrequency);
			this.on('change:amplitude',       this.changeAmplitude);

			this.initOscillators();
		},

		update: function(time, delta) {
			
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
					y: 4,
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

define([
	'underscore', 
	'backbone',

	'models/lattice2d',
	'models/oscillator',
	'models/wave-propagator'
], function (_, Backbone, Lattice2D, Oscillator, WavePropagator) {

	'use strict';

	var i;

	var WaveSimulation = Backbone.Model.extend({
		defaults: {
			latticeSize: {
				width: 60,
				height: 60
			},
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

			this.initComponents();

			// Event listeners
			this.on('change:oscillatorCount', this.initOscillators);
			this.on('change:frequency',       this.changeFrequency);
			this.on('change:amplitude',       this.changeAmplitude);
		},

		initComponents: function() {
			// Lattice
			this.lattice = new Lattice2D({
				width:  this.get('latticeSize').width,
				height: this.get('latticeSize').height,
				initialValue: 0
			});

			// Wave propagator
			this.propagator = new WavePropagator({
				lattice: this.lattice
			});

			// Oscillators
			this.initOscillators();
		},

		initOscillators: function() {
			this.oscillators = [];
			for (i = 0; i < this.get('oscillatorCount'); i++) {
				this.oscillators.push(new Oscillator({
					frequency: this.get('frequency'),
					amplitude: this.get('amplitude'),
					x: 4,
					y: 30,
					radius: 2,
					enabled: !i, // Only enable the first one

					waveSimulation: this,
				}));
			}
		},

		update: function(time, delta) {
			this.propagator.propagate();

			for (i = 0; i < this.oscillators.length; i++)
				this.oscillators[i].update(time);
		},

		reset: function() {
			this.initComponents();
		},

		resize: function() {
			
		},

		isValidPoint: function(x, y) {
			return (x < this.lattice.width && x >= 0 && y < this.lattice.height && y >= 0);
		},

		setSourceValue: function(x, y, val) {
			this.propagator.setSourceValue(x, y, val);
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

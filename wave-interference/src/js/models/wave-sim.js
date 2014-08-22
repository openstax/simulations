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
			oscillatorSpacing: 0.5,
			frequency: 0.5,
			amplitude: 1.0
		},
		
		initialize: function(options) {

			this.initComponents();

			// Event listeners
			this.on('change:oscillatorCount',   this.initOscillators);
			this.on('change:oscillatorSpacing', this.calculateOscillatorSpacing);

			this.on('change:frequency',       this.changeFrequency);
			this.on('change:amplitude',       this.changeAmplitude);

			this.timestep = 1000 / 30; // milliseconds, from PhET's WaveInterferenceClock
			this.accumulator = 0;
			this.time = 0;
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
					y: 0,
					radius: 2,

					waveSimulation: this,
				}));
			}

			this.calculateOscillatorSpacing();
		},

		/**
		 * This function finds the y positions for oscillators given the
		 *   percent spacing between them and the height of the lattice.
		 *   It's a generalized solution that takes any oscillator count
		 *   greater than zero. It basically finds the maximum distance
		 *   between each point and multiplies that by the spacing
		 *   modifier and offsets each of them from the vertical center
		 *   (and if there are an odd number of oscillators, one is in
		 *   the center).
		 */
		calculateOscillatorSpacing: function() {
			var count = this.get('oscillatorCount');
			var maxDistance = count > 1 ? this.lattice.height / (count - (count % 2)) : 0;
			var percentMaxDistance = this.get('oscillatorSpacing');
			var midpoint = this.lattice.height / 2;

			var middleIndex = (count - 1) / 2;
			var distanceFromMiddleIndex;

			for (i = 0; i < count; i++) {
				distanceFromMiddleIndex = Math.ceil(Math.abs(i - middleIndex));

				if (i - middleIndex > 0)
					this.oscillators[i].y = parseInt(midpoint + (maxDistance * percentMaxDistance * distanceFromMiddleIndex));
				else
					this.oscillators[i].y = parseInt(midpoint - (maxDistance * percentMaxDistance * distanceFromMiddleIndex));
				console.log(this.oscillators[i].y);
			}
		},

		/**
		 * Because we need to update the simulation on a fixed interval
		 *   for accuracy--especially since the propagator isn't based
		 *   off of time but acts in discrete steps--we need a way to
		 *   keep track of step intervals independent of the varying
		 *   intervals created by window.requestAnimationFrame. This 
		 *   clever solution was found here: 
		 *
		 *   http://gamesfromwithin.com/casey-and-the-clearly-deterministic-contraptions
		 */
		update: function(time, delta) {

			this.accumulator += delta;

			while (this.accumulator >= this.timestep) {
				this.time += this.timestep;

				this.propagator.propagate();

				for (i = 0; i < this.oscillators.length; i++)
					this.oscillators[i].update(this.time);
				
				this.accumulator -= this.timestep;
			}

			return this.accumulator / this.timestep;
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

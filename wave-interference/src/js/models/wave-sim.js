define(function (require) {

	'use strict';

	var $              = require('jquery');
	var _              = require('underscore');
	var Backbone       = require('backbone'); Backbone.$ = $;

	var Lattice2D      = require('./lattice2d');
	var Oscillator     = require('./oscillator');
	var WavePropagator = require('./wave-propagator');
	var Barrier        = require('./barrier');

	var CompositePotential = require('./potential/composite');
	var SegmentPotential   = require('./potential/segment');

	var i;

	/**
	 * The WaveSimulation contains all necessary components to model a wave-interference
	 *   simulation independent of a graphical representation.  It's implemented as a
	 *   Backbone model and uses Backbone's built-in events system to respond to input
	 *   from the views and give feedback.
	 */
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

			oscillatorName: 'Oscillator',
			oscillatorNamePlural: 'Oscillators',

			oscillatorCount: 1,
			oscillatorSpacing: 0.5,
			frequency: 0.5,
			amplitude: 1.0,
			minFrequency: 0.01,
			maxFrequency: 3,
			minAmplitude: 0,
			maxAmplitude: 2,

			barrierX: null,
			barrierSlitWidth: null,
			barrierSlitSeparation: null,
			barrierStyle: 0,

			crossSectionY: null
		},
		
		initialize: function(options) {

			// Event listeners
			this.on('change:oscillatorCount',   this.calculateOscillatorSpacing);
			this.on('change:oscillatorSpacing', this.calculateOscillatorSpacing);

			this.on('change:frequency',       this.changeFrequency);
			this.on('change:amplitude',       this.changeAmplitude);
			this.on('change:dimensions change:latticeSize', this.resize);

			this.timestep = 1000 / 30; // milliseconds, from PhET's WaveInterferenceClock
			this.accumulator = 0;
			this.time = 0;

			// Set default barrier properties
			if (this.get('barrierX') === null)
				this.set('barrierX', this.get('dimensions').width * 0.75);
			if (this.get('barrierSlitWidth') === null)
				this.set('barrierSlitWidth', this.get('dimensions').height / 5);
			if (this.get('barrierSlitSeparation') === null)
				this.set('barrierSlitSeparation', this.get('dimensions').height / 5);

			// Ranges
			this.set('barrierSlitWidthRange', {
				min: 0,
				max: this.get('dimensions').height * 0.5
			});
			this.set('barrierXRange', {
				min: 0,
				max: this.get('dimensions').width
			});
			this.set('barrierSlitSeparationRange', {
				min: 0,
				max: this.get('dimensions').height * 0.75
			});

			if (this.get('crossSectionY') === null)
				this.set('crossSectionY', this.get('dimensions').height / 2);

			// Set latticeSize:dimensions ratio
			this.resize();

			this.initComponents();
		},

		initComponents: function() {
			// Composite Potential
			this.potential = new CompositePotential();

			// Lattice
			this.initLattice();

			// Wave propagator
			this.initPropagator();

			// Barrier
			this.initBarrier();

			// Oscillators
			this.initOscillators();
		},

		initLattice: function() {
			this.lattice = new Lattice2D({
				width:  this.get('latticeSize').width,
				height: this.get('latticeSize').height,
				initialValue: 0
			});
		},

		initPropagator: function() {
			this.propagator = new WavePropagator({
				lattice: this.lattice,
				potential: this.potential
			});
		},

		initBarrier: function() {
			this.barrier = new Barrier({
				waveSimulation: this
			});
		},

		initOscillators: function() {
			this.oscillators = [];	

			for (i = 0; i < 2; i++) {
				this.oscillators.push(new Oscillator({
					frequency: this.get('frequency'),
					amplitude: this.get('amplitude'),
					x: 4,
					y: 0,
					radius: 2
				}, {
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
					this.oscillators[i].set('y', parseInt(midpoint + (maxDistance * percentMaxDistance * distanceFromMiddleIndex)));
				else
					this.oscillators[i].set('y', parseInt(midpoint - (maxDistance * percentMaxDistance * distanceFromMiddleIndex)));
			}

			this.trigger('oscillators-changed');
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

			if (!this.paused) {
				this.accumulator += delta;

				while (this.accumulator >= this.timestep) {
					this.time += this.timestep;

					this._update();
					
					this.accumulator -= this.timestep;
				}	
			}
			
		},

		/**
		 * Inside the fixed-interval loop
		 */
		_update: function() {
			this.propagator.propagate();

			for (i = 0; i < this.get('oscillatorCount'); i++)
				this.oscillators[i].update(this.time);
		},

		play: function() {
			this.paused = false;
			this.trigger('play');
		},

		pause: function() {
			this.paused = true;
			this.trigger('pause');
		},

		reset: function() {
			this.initComponents();
		},

		resize: function() {
			this.widthRatio  = this.get('latticeSize').width / this.get('dimensions').width;
			this.heightRatio = this.get('latticeSize').height / this.get('dimensions').height;
		},

		isValidPoint: function(x, y, padding) {
			if (padding === undefined)
				return this.lattice.contains(x, y);
			else {
				return this.lattice.contains(x - padding, y - padding) && 
				       this.lattice.contains(x + padding, y + padding);
			}
		},

		setSourceValue: function(x, y, val) {
			this.propagator.setSourceValue(x, y, val);
		},

		addSegmentPotential: function() {
			var segment = new SegmentPotential({
				start: {
					x: 11,
					y: 49
				},
				end: {
					x: 49,
					y: 11
				},
				thickness: 3
			});
			this.potential.add(segment);
			this.trigger('segment-potential-added', segment);
		},

		changeFrequency: function(model, value) {
			_.each(this.oscillators, function(oscillator) {
				oscillator.set('frequency', value);
			}, this);
		},

		changeAmplitude: function(model, value) {
			_.each(this.oscillators, function(oscillator) {
				oscillator.set('amplitude', value);
			}, this);
		},

		addPotential: function(potential) {
			this.potential.add(potential);
		},

		removePotential: function(potential) {
			this.potential.remove(potential);
		}
	});

	return WaveSimulation;
});

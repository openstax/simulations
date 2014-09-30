
define(function(require) {

	'use strict';

	var $        = require('jquery');
	var Backbone = require('backbone'); Backbone.$ = $;

	/**
	 * These "local" variables assume no concurrent use of this class.
	 */
	var waveSim,
	    oscillatingValue,
	    i,
	    j,
	    x,
	    y,
	    radius,
	    twoPI = Math.PI * 2,
	    peakTime,
	    halfPeriod,
	    remainderTime;

	/**
	 * The oscillator works along with a lattice and propagator to generate the
	 *   waves in the wave model.  Its calculations are based soley on time
	 *   (instead of steps, like the propagator).  At any given time (inputted
	 *   in the update function by the update loop), it will calculate what new
	 *   oscillating value it should write to its origin in the lattice and
	 *   then write those values to their corresponding location on the
	 *   propagator's source lattices--the lattices that keep a history of the
	 *   previous lattice values and which are used to generate the next values
	 *   on the lattice according to the discrete wave-propagation function.
	 *   The oscillating values come from a sinusoidal equation.  The core
	 *   functions are modelled from PhET's Oscillator class.
	 */
	var Oscillator = Backbone.Model.extend({

		defaults: {
			x: 0,
			y: 0,
			frequency: 0.5,
			amplitude: 1.0,
			radius:    2,
			enabled: true
		},

		initialize: function(attrs, options) {
			if (options.waveSimulation)
				this.waveSimulation = options.waveSimulation;
			else
				throw 'Oscillator requires a wave simulation to run.';

			// Used to modify the time-based cosine argument when we're pulsing
			this.pulsePhase = 0.0;
			this.pulseEnabled = false;
		},

		/**
		 * Called every tick to set the oscillating cells to their new value
		 *   based on time ellapsed since the beginning of the simulation in
		 *   milliseconds.
		 */
		update: function(time) {
			// But the oscillator wants time in seconds, not milliseconds
			time /= 1000;

			this.time = time;

			if (this.get('enabled')) {
				oscillatingValue = this.oscillatingValue(time);

				waveSim = this.waveSimulation;
				radius  = this.get('radius');
				x       = this.get('x');
				y       = this.get('y');

				/*
				 * Within the circle of radius [radius] centered around [x, y], fill
				 *   in those cells with the current calculated oscillating value.
				 */
				for (i = x - radius; i <= x + radius; i++) {
					for (j = y - radius; j <= y + radius; j++) {
						if (radius === 0 || Math.sqrt(Math.pow(i - x, 2) + Math.pow(j - y, 2)) < radius) {
							// Make sure we don't go out of bounds if we're on an edge
							if (waveSim.isValidPoint(i, j))
								waveSim.setSourceValue(i, j, oscillatingValue);
						}
					}
				}
			}

			if (this.pulseEnabled && this.cosArg(time) + this.pulsePhase >= twoPI) {
				this.pulseEnabled = false;
				this.pulsePhase = 0;
				this.enabled = false;
			}
		},

		/**
		 * Returns the value of an oscillating lattice cell at a given time.
		 * This function corresponds with PhET's Oscillator.getValue()
		 */
		oscillatingValue: function(time) {
			return this.get('amplitude') * Math.cos(this.cosArg(time) + this.pulsePhase);
		},

		/**
		 * Returns the cosine argument based on frequency and time.
		 */
		cosArg: function(time) {
			return twoPI * this.get('frequency') * time;
		},

		/**
		 * Fire a pulse that just goes through one oscillation.
		 *
		 * Returns an estimate in milliseconds of when the pulse will end 
		 *   or false if it is currently pulsing.
		 */
		firePulse: function() {
			if (!this.pulseEnabled) {
				this.set('enabled', true);
				this.pulsePhase = -this.cosArg(this.time) + Math.PI / 2; // start wave at value = 0
				this.pulseEnabled = true;

				/**
				 * Working backwards from this.cosArg(time_1) + this.pulsePhase = 2*PI
				 *   given the pulsePhase equation, I simplified it down to this:
				 *      estimated time = 3 / (4 * frequency)
				 *   and then I optimize it an multiply by 1000 to get it in ms.
				 */
				return (0.75 / this.get('frequency')) * 1000;
			}
			return false;
		},

		/**
		 * Returns the period in seconds
		 */
		period: function() {
			return 1 / this.get('frequency');
		},

		/**
		 * Based on the oscillator's internal time, this function calculates
		 *   when the next peak will be (when cos(cosArg) = 1, which happens
		 *   whenever cosArg is a multiple of twoPI).
		 */
		getNextPeakTime: function() {
			/*
			 * let f = frequency, t = time
			 *   (ft % 1) is the remainder portion of ft keeping it from 
			 *   being an integer. Therefore ((ft % 1) / f) is the time
			 *   portion that is keeping ft from being an integer, since
			 *   frequency is a constant in this context.
			 */
			remainderTime = ((this.time * this.get('frequency')) % 1) / this.get('frequency');

			/* (this.time - remainderTime) gets us the previous peak, so we
			 *   add a period to get the next one.
			 */ 
			return this.time - remainderTime + this.period();
		},

		/**
		 * Just shifts the next peak time by half a period to get the trough
		 *   time.
		 */
		getNextTroughTime: function() {
			peakTime = this.getNextPeakTime();
			halfPeriod = this.period() / 2;

			if (peakTime - halfPeriod > this.time)
				return peakTime - halfPeriod;
			else
				return peakTime + halfPeriod;
		}
	});

	return Oscillator;
});
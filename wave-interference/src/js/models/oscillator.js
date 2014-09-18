
define(function(require) {

	'use strict';

	var _ = require('underscore');

	var Oscillator = function(options) {

		// Default values
		options = _.extend({
			frequency: 0.5,
			amplitude: 1.0,
			radius:    2,
			enabled: true
		}, options);
		
		this.frequency = options.frequency;
		this.amplitude = options.amplitude;
		this.radius    = options.radius;

		this.enabled = options.enabled;

		if (options.waveSimulation)
			this.waveSimulation = options.waveSimulation;
		else
			throw 'Oscillator requires a wave simulation to run.';

		if (_.isNumber(options.x) && _.isNumber(options.y)) {
			this.x = options.x;
			this.y = options.y;
		}
		else
			throw 'Oscillator\'s constructor requires a numeric "x" and "y" value.';

		// Used to modify the time-based cosine argument when we're pulsing
		this.pulsePhase = 0.0;
		this.pulseEnabled = false;
	};

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

	_.extend(Oscillator.prototype, {

		/**
		 * Called every tick to set the oscillating cells to their new value
		 *   based on time ellapsed since the beginning of the simulation in
		 *   milliseconds.
		 */
		update: function(time) {
			// But the oscillator wants time in seconds, not milliseconds
			time /= 1000;

			this.time = time;

			if (this.enabled) {
				oscillatingValue = this.oscillatingValue(time);

				waveSim = this.waveSimulation;
				radius  = this.radius;
				x       = this.x;
				y       = this.y;

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
			return this.amplitude * Math.cos(this.cosArg(time) + this.pulsePhase);
		},

		/**
		 * Returns the cosine argument based on frequency and time.
		 */
		cosArg: function(time) {
			return twoPI * this.frequency * time;
		},

		/**
		 * Fire a pulse that just goes through one oscillation.
		 *
		 * Returns an estimate in milliseconds of when the pulse will end 
		 *   or false if it is currently pulsing.
		 */
		firePulse: function() {
			if (!this.pulseEnabled) {
				this.enabled = true;
				this.pulsePhase = -this.cosArg(this.time) + Math.PI / 2; // start wave at value = 0
				this.pulseEnabled = true;

				/**
				 * Working backwards from this.cosArg(time_1) + this.pulsePhase = 2*PI
				 *   given the pulsePhase equation, I simplified it down to this:
				 *      estimated time = 3 / (4 * frequency)
				 *   and then I optimize it an multiply by 1000 to get it in ms.
				 */
				return (0.75 / this.frequency) * 1000;
			}
			return false;
		},

		/**
		 * Returns the period in seconds
		 */
		period: function() {
			return 1 / this.frequency;
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
			remainderTime = ((this.time * this.frequency) % 1) / this.frequency;

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
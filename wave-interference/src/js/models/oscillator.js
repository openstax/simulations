
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


	var waveSim,
	    oscillatingValue,
	    i,
	    j,
	    x,
	    y,
	    xMax,
	    yMax,
	    radius,
	    twoPI = Math.PI * 2;

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
				xMax    = x + radius;
				yMax    = y + radius;

				/*
				 * Within the circle of radius [radius] centered around [x, y], fill
				 *   in those cells with the current calculated oscillating value.
				 */
				for (i = x - radius; i < xMax; i++) {
					for (j = y - radius; j < yMax; j++) {
						if (Math.sqrt(Math.pow(i - x, 2) + Math.pow(j - y, 2)) < radius) {
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
		}
	});

	return Oscillator;
});
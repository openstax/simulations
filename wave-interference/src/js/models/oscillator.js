
define([
	'underscore'
], function(_) {

	'use strict';

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

		if (options.lattice)
			this.lattice   = options.lattice;
		else
			throw 'Oscillator requires a lattice to run.';

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


	var lat,
		width,
		height,
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
		 *   based on time ellapsed since the beginning of the simulation.
		 */
		update: function(time) {
			if (this.enabled) {
				// Oscillator wants time in seconds, not milliseconds
				oscillatingValue = this.oscillatingValue(time / 1000);

				lat    = this.lattice.data;
				width  = this.lattice.width;
				height = this.lattice.height;
				radius = this.radius;
				x      = this.x;
				y      = this.y;
				xMax   = x + radius;
				yMax   = y + radius;

				/*
				 * Within the circle of radius [radius] centered around [x, y], fill
				 *   in those cells with the current calculated oscillating value.
				 */
				for (i = x - radius; i < xMax; i++) {
					for (j = y - radius; j < yMax; j++) {
						if (Math.sqrt(Math.pow(i - x, 2) + Math.pow(j - y, 2)) < radius) {
							// Make sure we don't go out of bounds if we're on an edge
							if (i < width && i >= 0 && j < height && j >= 0)
								lat[i][j] = oscillatingValue;
						}
					}
				}
			}

			if (this.pulseEnabled && this.cosArg() + this.pulsePhase > twoPI) {
				this.pulseEnabled = false;
				this.pulsePhase = 0;
				this.enabled = true;
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
	});

	return Oscillator;
});
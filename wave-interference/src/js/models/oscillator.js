
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

	/* &#^%#$%#$%
	 * Big question:
	 *   why is [phase] independent of time?
	 *  ohhh, okay, it is only used for pulse
	 *  so really i should be naming it something to do with pulse, like pulsePhase
	 */

	var lat,
		w,
		h,
	    val,
	    i,
	    j,
	    xMax,
	    yMax,
	    r,
	    twoPI = Math.PI * 2;

	_.extend(Oscillator.prototype, {

		/**
		 * Called every tick to set the oscillating cells to their new value
		 *   based on time ellapsed since the beginning of the simulation.
		 */
		update: function(time) {
			if (this.enabled) {
				val = this.value(time);

				lat  = this.lattice.data;
				w    = this.lattice.w;
				h    = this.lattice.h;
				r    = this.radius;
				xMax = this.x + r;
				yMax = this.y + r;

				for (i = this.x - r; i < xMax; i++) {
					for (j = this.y - r; j < yMax; j++) {
						if (Math.sqrt(Math.pow(i - x, 2) + Math.pow(j - y, 2)) < r) {
							if (i < w && j < h)
								lat[i][j] = val;
						}
					}
				}
			}

			if (this.pulseEnabled && this.cosArg() + pulsePhase > twoPI) {
				this.pulseEnabled = false;
				this.pulsePhase = 0;
				this.enabled = true;
			}
		},

		/**
		 * Returns the value of an oscillating lattice cell at a given time.
		 */
		value: function(time) {
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
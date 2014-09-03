/*
 * Based on a gist from Dan Tello
 * https://gist.github.com/greypants/3739036
 */

define(function (require) {

	'use strict';

	require('pixi');

	var Updater = function() {

		var DORMANCY_THRESHOLD = 333;      // 3Hz in millseconds
		var DORMANCY_CHECK_INTERVAL = 100; // ms

		var listeners = {
			update: [],
			sleep: [],
			awaken: []
		};
		var i;

		var animationFrame;
		var playing = false;
		var dormant = false;
		
		var last  = 0;
		var now   = 0;
		var delta = 0;

		var dormancyCheckInterval = null;

		this.total = 0;

		// Runs every frame and calls listening functions
		var frame = function() {
			now   = Date.now();
			delta = now - last;
			last  = now;
			this.total += delta;

			if (!dormant) {
				for (i = 0; i < listeners.update.length; i++)
					listeners.update[i](this.total, delta);	
			}
			
			animationFrame = window.requestAnimFrame(frame);
		}.bind(this);

		/**
		 * Runs at 3Hz with setInterval. If requestAnimationFrame
		 *  has fallen to 3Hz or below, it declares the updater
		 *  asleep and calls listeners of the 'sleep' event.
		 */
		var dormancyCheck = function() {
			if (!dormant) {
				now   = Date.now();
				delta = now - last;

				if (delta > DORMANCY_THRESHOLD) {
					dormant = true;

					for (i = 0; i < listeners.sleep.length; i++)
						listeners.sleep[i]();
				}
			}
			else {
				now   = Date.now();
				delta = now - last;

				if (delta < DORMANCY_THRESHOLD) {
					dormant = false;

					// Reset the last time so we don't build up time
					last = now - delta;

					// Call listeners
					for (i = 0; i < listeners.awaken.length; i++)
						listeners.awaken[i]();
				}
			}
		}.bind(this);

		this.play = function() {
			if (!playing) {
				playing = true;
				/*
				 * Subtract the last delta so we don't do two frames 
				 * at the same this.total time after unpausing.
				 */
				last = Date.now() - delta;
				clearInterval(dormancyCheckInterval);
				dormancyCheckInterval = setInterval(dormancyCheck, DORMANCY_CHECK_INTERVAL);
				frame();
			}
		};

		this.pause = function() {
			window.cancelAnimationFrame(animationFrame);
			playing = false;
		};

		this.paused = function() {
			return !playing;
		};

		this.reset = function() {
			this.pause();
			this.total = 0;
		};

		this.addEventListener = function(event, listener) {
			listeners[event].push(listener);
		};
	};

	return Updater;
});

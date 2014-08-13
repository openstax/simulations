/*
 * Based on a gist from Dan Tello
 * https://gist.github.com/greypants/3739036
 */

define([
	'pixi'
], function (PIXI) {

	'use strict';

	var Updater = function() {

		var listeners = [];
		var i;

		var animationFrame;
		var playing = false;
		
		var last  = 0;
		var now   = 0;
		var delta = 0;

		this.total = 0;

		var frame = (function() {
			now   = Date.now();
			delta = now - last;
			last  = now;
			this.total += delta;

			for (i = 0; i < listeners.length; i++)
				listeners[i](delta);

			animationFrame = window.requestAnimFrame(frame);
		}).bind(this);

		this.play = function() {
			if (!playing) {
				playing = true;
				last = Date.now();
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

		this.addFrameListener = function(listener) {
			listeners.push(listener);
		};
	};

	return Updater;
});

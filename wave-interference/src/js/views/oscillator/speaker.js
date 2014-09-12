define(function(require) {

	'use strict';

	var $ = require('jquery');

	var OscillatorView = require('views/oscillator');

	/*
	 * "Local" variables for functions to share and recycle
	 */
	var period,
	    releaseTime,
	    n, // What PhET called it--I'm not sure what it represents
	    $drop,
	    i;

	var SpeakerOscillatorView = OscillatorView.extend({

		className: OscillatorView.prototype.className + ' speaker-oscillator-view',

		initialize: function(options) {
			OscillatorView.prototype.initialize.apply(this, [options]);

			this.time = 0;

			this.listenTo(this.waveSimulation, 'change:amplitude change:frequency', this.resize);
			this.listenTo(this.waveSimulation, 'play',             this.play);
			this.listenTo(this.waveSimulation, 'pause',            this.pause);
		},

		render: function() {
			this.$el.html(this.template({ unique: this.cid }));
			this.$graphic = this.$('.oscillator-graphic');

			this.$speakerCone = this.$graphic.find('.part-2');

			this.resize();
			this.update(0, 0);
		},

		play: function() {
			this.paused = false;
		},

		pause: function() {
			this.paused = true;
		},

		update: function(time, delta) {
			if (!this.hidden && !this.waveSimulation.paused) {
				/**
				 * Keep track of our own time so we can actually pause 
				 *   the animation if the simulation is paused.
				 */
				this.time += delta;
				this.updateSpeaker(this.time, delta);
			}

			if (this.updateOnNextFrame) {
				// Change the distance the cone moves in a cycle
				
			}

			OscillatorView.prototype.update.apply(this, [time, delta]);
		},


		updateSpeaker: function(time, delta) {

			var period = this.oscillator.period() + 's';

			// this.$speakerCone.css({
			// 	'-webkit-animation-duration': period,
			// 	        'animation-duration': period
			// });
			this.$speakerCone[0].style.webkitAnimationDuration = period;


			transform = 'translateX(' + startX + 'px)';

			// Set the width so it spans the two points
			this.$speaker.css({
				'-webkit-transform': transform,
				'-ms-transform': transform,
				'-o-transform': transform,
				'transform': transform,
			});

			// // See if it's time to drip another drop
			// if (this.oscillator.enabled) {
			// 	if (this.justBeforeReleaseTime(this.lastOscillatorTime) && this.justAfterReleaseTime(this.oscillator.time))
			// 		this.drip(time);
			// }
			// this.lastOscillatorTime = this.oscillator.time;
		},

		// recycleDrop: function($drop) {
		// 	this.$stagedDrops.push($drop);
		// 	$drop.hide();
		// },

		// drip: function(time) {
		// 	$drop = this.$stagedDrops.pop();
		// 	if ($drop) {
		// 		$drop.show();
		// 		$drop.data('birth', time);
		// 		$drop.data('period', this.animationDuration * 1000);
		// 		this.$activeDrops.push($drop);
		// 	}
		// },

		// justBeforeReleaseTime: function(time) {
		// 	releaseTime = this.getNearestReleaseTime(time);
		// 	if (time < releaseTime/* && Math.abs(releaseTime - time) < this.oscillator.period() / 4*/)
		// 		return true;
		// 	return false;
		// },

		// justAfterReleaseTime: function(time) {
		// 	releaseTime = this.getNearestReleaseTime(time);
		// 	if (time >= releaseTime/* && Math.abs(releaseTime - time) < this.oscillator.period() / 4*/)
		// 		return true;
		// 	return false;
		// },

	});

	return SpeakerOscillatorView;
});
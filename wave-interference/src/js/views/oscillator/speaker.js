define(function(require) {

	'use strict';

	var OscillatorView = require('views/oscillator');

	/*
	 * "Local" variables for functions to share and recycle
	 */
	var movementPercentage,
	    transform;

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
			if (!this.hidden && !this.waveSimulation.paused && this.oscillator.enabled) {
				this.time += delta / 1000;
				this.updateSpeaker();
			}

			if (this.updateOnNextFrame) {
				// Change the distance the cone moves in a cycle
				this.movementDistance = 4 * this.waveSimulation.get('amplitude');
				this.halfPeriod = this.oscillator.period() / 2;
			}

			OscillatorView.prototype.update.apply(this, [time, delta]);
		},


		updateSpeaker: function() {

			// First starting (captures undefined, 0, NaN)
			if (!this.nextPeakTime) {
				this.nextPeakTime   = this.oscillator.getNextPeakTime();
				this.nextTroughTime = this.oscillator.getNextTroughTime();
			}

			// We've hit a peak
			if (this.time > this.nextPeakTime) {
				this.nextPeakTime = this.oscillator.getNextPeakTime();
			}

			// We've hit a trough
			if (this.time > this.nextTroughTime) {
				this.nextTroughTime = this.oscillator.getNextTroughTime();
			}

			// Figure out which way we're going and our progress in that direction
			if (this.nextPeakTime > this.nextTroughTime) {
				// We're on our way to a trough
				movementPercentage = 1 - ((this.nextTroughTime - this.time) / this.halfPeriod);
			}
			else {
				// We're on our way to a peak
				movementPercentage = (this.nextPeakTime - this.time) / this.halfPeriod;
			}

			// While the slider is being moved, make sure it stays within reasonable bounds
			movementPercentage = Math.min(movementPercentage, 1);
			movementPercentage = Math.max(movementPercentage, 0);

			// The rotation is a fix for webkit and firefox that triggers sub-pixel rendering
			transform = 'translateX(' + (-this.movementDistance * movementPercentage) + 'px) rotate(.0001deg)';

			// Set the width so it spans the two points
			this.$speakerCone.css({
				'-webkit-transform': transform,
				'-ms-transform':     transform,
				'-o-transform':      transform,
				'transform':         transform,
			});
		}

	});

	return SpeakerOscillatorView;
});
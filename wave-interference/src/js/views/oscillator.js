define(function (require) {

	'use strict';

	var $        = require('jquery');
	var _        = require('underscore');
	var Backbone = require('backbone');

	var html  = require('text!templates/oscillator.html');

	var OscillatorView = Backbone.View.extend({

		template: _.template(html),

		tagName: 'div',
		className: 'oscillator-view',

		events: {
			'click .btn-oscillator-pulse' : 'pulseClicked',
			'change .oscillator-on-off'   : 'changeState',
		},

		initialize: function(options) {
			if (options.heatmapView)
				this.heatmapView = options.heatmapView;
			else
				throw 'OscillatorView requires a HeatmapView instance.';

			if (options.oscillator)
				this.oscillator = options.oscillator;
			else
				throw 'OscillatorView requires an Oscillator instance.';

			this.waveSimulation = this.heatmapView.waveSimulation;

			this.listenTo(this.heatmapView, 'resized', this.resize);
			this.listenTo(this.waveSimulation, 'oscillators-changed', function(){
				this.updateOnNextFrame = true;
			});
			this.listenTo(this.waveSimulation, 'change:oscillatorCount', this.determinePosition);
		},

		resize: function(){
			this.updateOnNextFrame = true;

			
		},

		render: function() {
			this.$el.html(this.template({ unique: this.cid }));
			this.$graphic = this.$('.oscillator-graphic');

			this.$stagedDrops = [];
			this.$activeDrops = [];
			var $stream = this.$graphic.find('.part-1');
			var $drip;
			for (var i = 0; i < 6; i++) {
				$drip = $('<div class="drip">');
				$stream.append($drip);
				this.$stagedDrops.push($drip);
			}
			this.dripTimer = 0;

			this.resize();
			this.update(0, 0);
		},

		update: function(time, delta) {
			if (!this.hidden) {
				this.updateDrops(time, delta);
			}

			if (!this.updateOnNextFrame)
				return;

			this.updateOnNextFrame = false;

			if (!this.hidden) {
				this.$graphic.css('top', this.heatmapView.height - this.oscillator.y * this.heatmapView.ySpacing);
			}
		},


		updateDrops: function(time, delta) {
			// Check first to see if we can recycle any drops so we can use them later
			for (var i = this.$activeDrops.length - 1; i > 0; i--) {
				if (time > this.$activeDrops[i].data('birth') + this.$activeDrops[i].data('birth')) {
					this.recycleDrop(this.$activeDrops[i]);
					this.$activeDrops.splice(i, 1);
				}
			}

			// See if it's time to drip another drop
			this.dripTimer += delta;
			var period = 1000 / this.oscillator.frequency;
			if (this.dripTimer >= period) {
				this.drip(time, period);
				this.dripTimer -= period;
			}
		},

		recycleDrop: function($drop) {
			this.$stagedDrops.push($drop);
			$drop.hide();
		},

		drip: function(time, period) {
			var $drip = this.$stagedDrops.pop();
			if ($drip) {
				$drip.show();
				$drip.data('birth', time);
				$drip.data('period', time);
				this.$activeDrops.push($drip);
			}
			else
				console.log('There aren\'t enough drops in the pool!');
		},

		

		toLatticeXScale: function(x) {
			return x / this.heatmapView.xSpacing;
		},

		toLatticeYScale: function(y) {
			return y / this.heatmapView.ySpacing * -1;
		},

		pulseClicked: function(event) {
			event.preventDefault();

			var estimatedTime = this.oscillator.firePulse();

			$(event.target)
				.css({
					'animation-duration': estimatedTime + 'ms',
					'-webkit-animation-duration': estimatedTime + 'ms'
				})
				.addClass('clicked')
				.prop('disabled', true);

			var $on = this.$('#oscillator-on-' + this.cid);
			setTimeout(function(){
				if ($on.is(':checked')) {
					$(event.target)
						.removeClass('clicked');
				}
				else {
					$(event.target)
						.removeClass('clicked')
						.prop('disabled', false);	
				}
			}, estimatedTime);
		},

		changeState: function(event) {
			var enabled = parseInt($(event.target).val());

			this.$('.btn-oscillator-pulse')
				.prop('disabled', enabled)
				.removeClass('clicked');

			this.oscillator.enabled = enabled;
		},

		hide: function() {
			this.hidden = true;
			this.$el.hide();
		},

		show: function() {
			this.hidden = false;
			this.$el.show();
		},

		determinePosition: function() {
			if (this.waveSimulation.get('oscillatorCount') > 1) {
				var pos = _.indexOf(this.waveSimulation.oscillators, this.oscillator);

				if (pos === 0)
					this.$el.addClass('bottom-oscillator');
				else
					this.$el.addClass('top-oscillator');
			}
			else {
				this.$el
					.removeClass('top-oscillator')
					.removeClass('bottom-oscillator');
			}
		}

	});

	return OscillatorView;
});

define(function (require) {

	'use strict';

	var $        = require('jquery');
	var _        = require('underscore');
	var Backbone = require('backbone');

	var html  = require('text!templates/oscillator.html');

	var oscillator;

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
		},

		resize: function(){
			this.updateOnNextFrame = true;

			
		},

		render: function() {
			this.$el.html(this.template({ unique: this.cid }));

			this.resize();
			this.update(0, 0);
		},

		update: function(time, delta) {
			oscillator = this.oscillator;

			if (!oscillator.enabled || !this.updateOnNextFrame)
				return;

			this.updateOnNextFrame = false;

			
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
		}

	});

	return OscillatorView;
});

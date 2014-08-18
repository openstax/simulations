define([
	'jquery', 
	'underscore', 
	'backbone',
	'nouislider',

	'views/sim',
	'models/wave-sim-water',

	'text!templates/sim-water.html',
], function ($, _, Backbone, noui, SimView, WaterSimulation, template) {

	'use strict';

	var WaterSimView = SimView.extend({

		template: _.template(template),
		tagName: 'section',
		className: 'sim-view',

		initialize: function(options) {
			options = _.extend({
				waveSimulation: new WaterSimulation()
			}, options);
			
			SimView.prototype.initialize.apply(this, [ options ]);

			this.model = new Backbone.Model({
				title: 'Water'
			});
		},

		renderContent: function() {
			this.$el.html(this.template());

			$(window)
				.off('better', $.proxy(this.reattachFaucetControls, this))
				.on( 'better', $.proxy(this.reattachFaucetControls, this))
				.off('worse',  $.proxy(this.detachFaucetControls, this))
				.on( 'worse',  $.proxy(this.detachFaucetControls, this));
			this.detachFaucetControls();

			// TODO: put this in SimView and just tie it to oscillators
			this.$('#water-frequency').noUiSlider({
				start: 0.5,
				connect: 'lower',
				range: {
					min: 0,
					max: 3
				}
			});

			this.$('#water-amplitude').noUiSlider({
				start: 1.0,
				connect: 'lower',
				range: {
					min: 0,
					max: 2
				}
			});

			this.$('#drip-spacing').noUiSlider({
				start: 3,
				connect: 'lower',
				range: {
					min: 0,
					max: 10
				}
			});
		},

		detachFaucetControls: function() {
			this.$('#faucet-controls').appendTo(this.$el);
		},

		reattachFaucetControls: function() {
			this.$('#faucet-controls').prependTo(this.$('.properties-panel'));
		},
	});

	return WaterSimView;
});

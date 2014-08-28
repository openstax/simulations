define([
	'jquery', 
	'underscore', 
	'backbone',
	'nouislider',

	'views/sim',
	'models/wave-sim/water',

	'text!templates/sim-water.html',
], function ($, _, Backbone, noui, SimView, WaterSimulation, template) {

	'use strict';

	var WaterSimView = SimView.extend({

		template: _.template(template),
		tagName: 'section',
		className: 'sim-view',

		events: _.extend(SimView.prototype.events, {
			
		}),

		initialize: function(options) {
			options = _.extend({
				waveSimulation: new WaterSimulation(),
				heatmapBrightness: 0.5
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
				start: this.waveSimulation.get('dimensions').height / 2,
				connect: 'lower',
				range: {
					min: 0,
					'50%': this.waveSimulation.get('dimensions').height / 2,
					max: this.waveSimulation.get('dimensions').height
				}
			});

			// this.$('#drip-spacing').noUiSlider_pips({
			// 	mode: 'range',
			// 	density: 5
			// });

			this.$('.slit-width').noUiSlider({
				start: this.waveSimulation.get('barrierSlitWidth'),
				connect: 'lower',
				range: {
					min: 0,
					max: this.waveSimulation.get('dimensions').height / 2
				}
			});

			this.$('.barrier-location').noUiSlider({
				start: this.waveSimulation.get('barrierX'),
				connect: 'lower',
				range: {
					min: 0,
					max: this.waveSimulation.get('dimensions').width
				}
			});

			this.$('.slit-separation').noUiSlider({
				start: this.waveSimulation.get('barrierSlitSeparation'),
				connect: 'lower',
				range: {
					min: 0,
					max: this.waveSimulation.get('dimensions').height * .75
				}
			});
		},

		detachFaucetControls: function() {
			this.$('#faucet-controls').appendTo(this.$el);
		},

		reattachFaucetControls: function() {
			this.$('#faucet-controls').prependTo(this.$('.properties-panel'));
		},

		// update: function(time, delta) {
		// 	SimView.prototype.update.apply(this, [time, delta]);
		// }
	});

	return WaterSimView;
});

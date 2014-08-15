define([
	'jquery', 
	'underscore', 
	'backbone',

	'views/sim',
	'models/wave-sim-water',

	'text!templates/sim-water.html',
], function ($, _, Backbone, SimView, WaterSimulation, template) {

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

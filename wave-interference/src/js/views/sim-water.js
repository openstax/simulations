define([
	'jquery', 
	'underscore', 
	'backbone',

	'views/sim',

	'text!templates/sim-water.html',
], function ($, _, Backbone, SimView, template) {

	'use strict';

	var WaterSimView = SimView.extend({

		template: _.template(template),
		tagName: 'section',
		className: 'sim-view',

		initialize: function(options) {
			SimView.prototype.initialize.apply(this, [ _.extend({}, options, {
				simulationDamping: {
					x: 20,
					y: 20
				},
				simulationDimensions: {
					w: 60,
					h: 60
				}
			}) ]);

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

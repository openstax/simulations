define(function(require) {

	'use strict';

	var $        = require('jquery');
	var _        = require('underscore');
	var Backbone = require('backbone');

	var template = require('text!./app.html');

	require('less!./app');
	require('less!./tabs');

	var AppView = Backbone.View.extend({
		template: _.template(template),
		tagName: 'div',
		className: 'app-view loading',

		events: {
			'click .tab' : 'tabClicked',
			'tab-selected .sim-tab' : 'simTabSelected'
		},

		initialize: function(options) {
			if (!this.simViews)
				throw "App requires a list of SimViews to render.";
		},

		remove: function() {
			Backbone.View.prototype.remove.apply(this);
			_.each(this.simViews, function(sim, key) {
				sim.remove();
			});
		},

		getRenderData: function() {
			var data = {
				simViews: _.map(this.simViews, function(simView) {
					return {
						cid:   simView.cid,
						name:  simView.name,
						title: simView.title
					};
				})
			};

			return data;
		},

		render: function() {
			// Render basic page structure
			this.$el.html(this.template(this.getRenderData()));

			// Then render views for each sim
			_.each(this.simViews, this.renderSimView, this);

			return this;
		},

		renderSimView: function(simView) {
			simView.render();
			this.$('#sim-' + simView.cid).append(simView.el);
		},

		/**
		 * Called after every component on the page has rendered to make sure
		 *   things like widths and heights and offsets are correct.
		 */
		postRender: function() {
			// Make them all visible for the post-render calculations
			this.$('.sim-content').addClass('active');

			_.each(this.sims, function(sim) {
				sim.postRender();
			});

			// Only hide the other tabs after they've all been rendered visibly
			this.$('.sim-tab').first().click();

			// Remove the stage curtains
			this.$el.removeClass('loading');
		},

		tabClicked: function(event) {
			var $tab = $(event.target).closest('.tab');
			if (!$tab.hasClass('active')) {
				// Activate the right tab, deactivating the others
				var selector = $tab.data('content-selector');
				$tab.add(this.$(selector))
					.addClass('active')
					.siblings()
					.removeClass('active');
				$tab.trigger('tab-selected');
			}
		},

		simTabSelected: function(event) {
			var $tab = $(event.target).closest('.sim-tab');
			this.simSelected($tab.data('cid'));
		},

		simSelected: function(cid) {
			// Play the right sim, pausing the others
			_.each(this.simViews, function(sim){
				if (sim.cid == cid)
					sim.resume();
				else
					sim.halt();
			}, this);
		}

	});

	return AppView;
});

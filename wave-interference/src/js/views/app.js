define(function (require) {

	'use strict';

	var $        = require('jquery');
	var _        = require('underscore');
	var Backbone = require('backbone'); Backbone.$ = $;

	var WaterSimView = require('./sim/water.js');
	var SoundSimView = require('./sim/sound.js');
	var LightSimView = require('./sim/light.js');

	var template = require('../../templates/app.html');

	var AppView = Backbone.View.extend({
		template: _.template(template),
		tagName: 'div',
		className: 'app-view loading',

		events: {
			'click .tab' : 'tabClicked',
			'tab-selected .sim-tab' : 'simTabSelected'
		},

		initialize: function() {
			this.sims = {
				water: new WaterSimView(),
				sound: new SoundSimView(),
				light: new LightSimView()
			};
		},

		remove: function() {
			Backbone.View.prototype.remove.apply(this);
			_.each(this.sims, function(sim, key) {
				sim.remove();
			});
		},

		render: function() {
			// Make basic sim info accessible to template renderer
			var data = {
				sims: {}
			};

			_.each(this.sims, function(sim, key) {
				data.sims[key] = sim.title;
			});

			// Render basic page structure
			this.$el.html(this.template(data));

			// Then render views for each sim
			_.each(this.sims, this.renderSim, this);

			

			return this;
		},

		renderSim: function(sim, key) {
			sim.render();
			this.$('#sim-' + key).append(sim.el);
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
			this.simSelected($tab.data('sim'));
		},

		simSelected: function(simKey) {
			// Play the right sim, pausing the others
			_.each(this.sims, function(sim, key){
				if (key == simKey)
					sim.resume();
				else
					sim.halt();
			}, this);
		}

	});

	return AppView;
});

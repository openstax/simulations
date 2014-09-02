define([
	'jquery', 
	'underscore', 
	'backbone',

	'text!templates/app.html',

	'views/sim/water',
	'views/sim/sound',
	'views/sim/light'
], function ($, _, Backbone, template, WaterSimView, SoundSimView, LightSimView) {
	'use strict';

	var AppView = Backbone.View.extend({
		template: _.template(template),
		tagName: 'div',
		className: 'app-view',

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
				data.sims[key] = sim.get('title');
			});

			// Render basic page structure
			this.$el.html(this.template(data));

			// Then render views for each sim
			_.each(this.sims, this.renderSim, this);

			this.$('.sim-tab').first().click();

			return this;
		},

		renderSim: function(sim, key) {
			sim.render();
			this.$('#sim-' + key).append(sim.el);
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

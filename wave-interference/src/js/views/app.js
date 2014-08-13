define([
	'jquery', 
	'underscore', 
	'backbone',

	'text!../../templates/app.html',

	'views/sim-water',
	'views/sim-sound',
	'views/sim-light'
], function ($, _, Backbone, template, WaterSimView, SoundSimView, LightSimView) {
	'use strict';

	var AppView = Backbone.View.extend({
		template: _.template(template),
		tagName: 'div',
		className: 'app-view',

		events: {
			'click .tab' : 'tabClicked'
		},

		initialize: function(options) {
			this.sims = {
				water: new WaterSimView(),
				sound: new SoundSimView(),
				light: new LightSimView()
			};
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

			this.selectTab(this.$('.tab').first());

			return this;
		},

		renderSim: function(sim, key) {
			sim.render();

			this.$('#sim-' + key).append(sim.el);
		},

		tabClicked: function(event) {
			var $target = $(event.target).closest('.tab');
			if (!$target.hasClass('active')) {
				this.selectTab($target);
			}
		},

		selectTab: function($tab) {
			// Activate the right tab, deactivating the others
			var selector = $tab.data('content-selector');
			$tab.add(this.$(selector))
				.addClass('active')
				.siblings()
				.removeClass('active');	

			// Play the right sim, pausing the others
			var simKey = $tab.data('sim');
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

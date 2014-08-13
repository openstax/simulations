define([
	'jquery', 
	'underscore', 
	'backbone',

	'text!../../templates/app.html',

	'water-module',
	'sound-module',
	'light-module'
], function ($, _, Backbone, template, WaterModule, SoundModule, LightModule) {
	'use strict';

	var AppView = Backbone.View.extend({
		template: _.template(template),
		tagName: 'div',
		className: 'app-view',

		initialize: function(options) {
			this.modules = {
				water: new WaterModule(),
				sound: new SoundModule(),
				light: new LightModule()
			};
		},

		render: function() {
			// Make basic module info accessible to template renderer
			var data = {
				modules: _.map(this.modules, function(module) {
					return module.get('title');
				})
			};

			// Render basic page structure
			this.$el.html(this.template(data));

			// Then render views for each module
			_.each(this.modules, this.renderModule, this);

			return this;
		},

		renderModule: function(module, index) {
			module.render();

			this.$('#module-' + index).append(module.el);
		}
	});

	return AppView;
});

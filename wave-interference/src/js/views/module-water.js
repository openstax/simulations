define([
	'jquery', 
	'underscore', 
	'backbone',

	'module',

	'text!../../templates/module-water.html',
], function ($, _, Backbone, ModuleView) {

	'use strict';

	var WaterModuleView = ModuleView.extend({

		initialize: function(options) {
			Module.prototype.initialize.apply(this, [ _.extend(options, {
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


	});

	return WaterModuleView;
});

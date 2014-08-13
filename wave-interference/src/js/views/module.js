define([
	'jquery', 
	'underscore', 
	'backbone',
	
	'../models/wave-simulation'
], function ($, _, Backbone, WaveSimulation) {

	'use strict';

	var ModuleView = Backbone.View.extend({
		tagName: 'section',
		className: 'module-view',

		initialize: function(options) {

			this.waveSimulation = new WaveSimulation({
				damping:    options.simulationDamping,
				dimensions: options.simulationDimensions
			});

		},

		get: function(key) {
			if (this.model)
				return this.model.get(key);
			else
				return null;
		},


	});

	return ModuleView;
});

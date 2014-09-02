define([
	'jquery', 
	'underscore', 
	'backbone',

	'views/sim',
	'models/wave-sim/light'
], function ($, _, Backbone, SimView, LightSimulation) {

	'use strict';

	var LightModuleView = SimView.extend({

		initialize: function(options) {
			options = _.extend({
				waveSimulation: new LightSimulation(),
				heatmapBrightness: 0.5,
				title: 'Light'
			}, options);
			
			SimView.prototype.initialize.apply(this, [ options ]);
		},

	});

	return LightModuleView;
});

define([
	'jquery', 
	'underscore', 
	'backbone',
	'nouislider',

	'views/sim',
	'models/wave-sim/water',
], function ($, _, Backbone, noui, SimView, WaterSimulation) {

	'use strict';

	var WaterSimView = SimView.extend({

		//template: _.template(template),
		// tagName: 'section',
		// className: 'sim-view',

		events: _.extend(SimView.prototype.events, {
			
		}),

		initialize: function(options) {
			options = _.extend({
				waveSimulation: new WaterSimulation(),
				heatmapBrightness: 0.5,
				title: 'Water'
			}, options);
			
			SimView.prototype.initialize.apply(this, [ options ]);
		},
	});

	return WaterSimView;
});

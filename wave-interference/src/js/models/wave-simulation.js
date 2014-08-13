define([
	'underscore', 
	'backbone',
	'pixi'
], function (_, Backbone, PIXI) {

	'use strict';

	var WaveSimulation = Backbone.Model.extend({
		defaults: {
			damping: {
				x: 20,
				y: 20
			},
			dimensions: {
				w: 60,
				h: 60
			},
			time: 0
		},
		
		initialize: function(options) {
			
		},

		update: function(time) {
			
		},

		reset: function() {

		}
	});

	return WaveSimulation;
});

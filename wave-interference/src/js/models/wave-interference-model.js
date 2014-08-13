define([
	'underscore', 
	'backbone'
], function (_, Backbone) {

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
			}
		},
		
		initialize: function(options) {
			
		},
	});

	return WaveSimulation;
});

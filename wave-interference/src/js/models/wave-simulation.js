define([
	'underscore', 
	'backbone',

	'models/lattice2d'
], function (_, Backbone, Lattice2D) {

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
			time: 0,
		},
		
		initialize: function() {
			
			// Set listeners
			this.on('change:dimensions', this.resize);

			// Initialize the lattice
			this.resize();
		},

		update: function(time) {
			
		},

		reset: function() {

		},

		resize: function() {
			this.lattice = new Lattice2D({
				w: this.get('dimensions').w,
				h: this.get('dimensions').h,
				initialValue: 0
			});
		},

		w: function() {
			return this.get('dimensions').w;
		},

		h: function() {
			return this.get('dimensions').h;
		}
	});

	return WaveSimulation;
});

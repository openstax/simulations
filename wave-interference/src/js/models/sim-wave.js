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
				w: 100,
				h: 100
			},
			units: {
				distance: 'm',
				time: 's'
			},
			time: 0,
			timeScale: 1.0,
		},
		
		initialize: function(options) {

			this.oscillators = [];

			options = _.extend({
				/**
				 * Lattice size should only matter internally.
				 * It's basically the simulation's level of 
				 *   precision. Conversions
				 */
				latticeSize: {
					w: 60,
					h: 60
				}
			}, options);

			this.lattice = new Lattice2D({
				w: options.latticeSize.w,
				h: options.latticeSize.h,
				initialValue: 0
			});
		},

		update: function(time) {
			
		},

		reset: function() {

		},

		resize: function() {
			
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

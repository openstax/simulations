define(function (require) {

	'use strict';

	var _        = require('underscore');
	var Backbone = require('backbone');
	var glMatrix = require('glmatrix');

	/**
	 * 
	 */
	var Body = Backbone.Model.extend({

		defaults: {
			
		},
		
		initialize: function(attributes, options) {

			// Create vectors
			this.set('position',     glMatrix.vec2.create());
			this.set('velocity',     glMatrix.vec2.create());
			this.set('acceleration', glMatrix.vec2.create());
			this.set('force',        glMatrix.vec2.create());

			// Derived properties
			this.set('density', this.get('mass') / this.getVolume());
		},

		/**
		 * 
		 */
		update: function(time, delta) {

			
		},

		/**
		 * This function gets called after all the bodies in a simulation have
		 *   been updated by the physics engine. We have no way of knowing all
		 *   the ways in which a body will be affected by other bodies during
		 *   their updates, so we put code here that needs to run after all
		 *   changes have been finalized for this step.
		 */
		postUpdate: function() {
			
		},

		/**
		 *
		 */
		translate: function(dx, dy) {
			this.get('position')[0] += dx;
			this.get('position')[1] += dy;
			this.set('position', this.get('position')); // Trigger a change
		}

	});

	return Body;
});

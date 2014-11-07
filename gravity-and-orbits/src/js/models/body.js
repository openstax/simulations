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
			// Aesthetic qualities and meta data
			name:  'space debris',
			color: '#aaa',
			bounds: {
				width:  10,
				height: 10,
			},
			massReadoutBelow: false,
			massSettable:     true,

			// Static physical properties
			mass:     1,
			diameter: 1,
			density:  1,
			fixed:    false,

			// Dynamic physical properties
			position:     null,
			velocity:     null,
			acceleration: null,
			force:        null, 
			
			// State properties
			userControlled: false, // Whether the user is currently controlling the position
			path:           [],
			maxPathLength:  500,
			collided:       false,
			clockTicksSinceExplosion: 0,

			// Associated Information
			/**
			 * Though the user can change the mass of these bodies, they are by default set
			 *   to a value that corresponds to an object that most users are familiar with.
			 *   For example, the "planet" body would have a tickLabel of "Earth" and a
			 *   tickMass of the earth's mass.
			 */
			tickMass: 1,
			tickLabel: 1,
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
		 *
		 */
		translate: function(dx, dy) {
			this.get('position')[0] += dx;
			this.get('position')[1] += dy;
			this.set('position', this.get('position')); // Trigger a change
		}

		/**
		 *
		 */
		getVolume: function() {
			return 4 / 3 * Math.PI * Math.pow()
		},

		/**
		 *
		 */
		getRadius: function() {
			return this.get('diameter') / 2;
		}

	});

	return Body;
});

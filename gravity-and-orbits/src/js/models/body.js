define(function (require) {

	'use strict';

	var _        = require('underscore');
	var Backbone = require('backbone');

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
			minMass: 0.5,
			maxMass: 2,
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
			 *   For example, the "planet" body would have a referenceMassLabel of "Earth" 
			 *   and a referenceMass of the earth's mass.
			 */
			referenceMass: 1,
			referenceMassLabel: 'a Model-T'
		},
		
		initialize: function(attributes, options) {

			// Create vectors
			

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
			if (!this.get('userControlled'))
				this.addPathPoint();
		},

		/**
		 *
		 */
		translate: function(dx, dy) {
			this.get('position')[0] += dx;
			this.get('position')[1] += dy;
			this.set('position', this.get('position')); // Trigger a change
		},

		/**
		 *
		 */
		collidesWith: function(body) {
			var distance = this.get('position').distance(body.get('position'));
			var radiiSum = this.get('diameter') / 2 + body.get('diameter') / 2;
			return distance < radiiSum;
		},

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
		},

		/**
		 *
		 */
		setRewindPoint: function() {

		},

		/**
		 *
		 */
		rewind: function() {

		},

		/**
		 *
		 */
		addPathPoint: function() {
			var path = this.get('path');

			path.push([
				this.get('position')[0],
				this.get('position')[1]
			]);

			if (path.length > this.get('maxPathLength'))
				path.shift();

			// Trigger a change
			this.set('path', path);
		}

	});

	return Body;
});

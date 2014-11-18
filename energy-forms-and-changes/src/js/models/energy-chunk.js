define(function (require) {

	'use strict';

	var _        = require('underscore');
	var Vector2  = require('vector2-node');

	/**
	 * 
	 */
	var EnergyChunk = function(energyType, position, velocity, visible) {
		// Position in model space.
		this.position = position || new Vector2(0, 0);
		// Used for some simple 3D layering effects.
		this.zPosition = 0; 

		// At the time of this writing, this is only used in the
		// algorithms that distribute energy chunks in a container.
		this.velocity = velocity || new Vector2(0, 0); // In meters/sec.

		// Property that controls visibility in view.
		this.visible = visible !== undefined ? visible : true;

		// Energy type.  This can change during the life of the energy chunk.
		this.energyType = energyType !== undefined ? energyType : null;

		// For internal use to avoid creating and destroying objects
		this._vec2 = new Vector2(0, 0);
	};

	/**
	 * Energy types
	 */
	EnergyChunk.THERMAL    = 0;
   	EnergyChunk.ELECTRICAL = 1;
    EnergyChunk.MECHANICAL = 2;
    EnergyChunk.LIGHT      = 3;
    EnergyChunk.CHEMICAL   = 4;
    EnergyChunk.HIDDEN     = 5;

    /**
     * Functions
     */
	_.extend(EnergyChunk.prototype, {

		translate: function(movement) {
		 	this.position.add(movement);
		},

		translateBasedOnVelocity: function(time) {
			this._vec2.set(this.velocity);
			this.translate(this._vec2.scale(time));
		},

		// Actually, instead of using this, you can just use 
		//   chunk.velocity.set(x, y) or chunk.velocity.set(vector)
		// setVelocity: function( x, y ) {
		// 	this.velocity.x = x;
		// 	this.velocity.y = y;
		// },

	});

	return EnergyChunk;
});

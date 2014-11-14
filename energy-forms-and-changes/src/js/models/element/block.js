define(function (require) {

	'use strict';

	var _        = require('underscore');
	var Vector2  = require('vector2');

	var RectangularThermalMovableElement = require('models/rectangular-thermal-movable');

	/**
	 * Constants
	 */
	// Height and width of all block surfaces, since it is a cube.
	var SURFACE_WIDTH = 0.045; // In meters

	// Number of slices where energy chunks may be placed.
	var NUM_ENERGY_CHUNK_SLICES = 4;

	var MAX_TEMPERATURE = 450; // Degrees Kelvin, value is pretty much arbitrary. Whatever works.

	/**
	 * 
	 */
	var Block = RectangularThermalMovableElement.extend({

		initialize: function(attributes, options) {
			RectangularThermalMovableElement.prototype.initialize.apply(this, [attributes, options]);

			this._rect = new Rectangle2(
		    	this.get('position').x - SURFACE_WIDTH / 2,
		        this.get('position').y,
		        SURFACE_WIDTH,
		        SURFACE_WIDTH
		    );

			// Surfaces used for stacking and thermal interaction.
			this.topSurface    = new HorizontalSurface(this.getRect().left(), this.getRect().right(), this.getRect().top());
			this.bottomSurface = new HorizontalSurface(this.getRect().left(), this.getRect().right(), this.getRect().bottom());

			this.on('position:change', this.updateTopSurfaceProperty);
			this.on('position:change', this.updateBottomSurfaceProperty);
		},

		/**
		 * Get the top surface of this model element.  Only model elements that can
		 * support other elements on top of them have top surfaces.
		 *
		 * @return The top surface of this model element
		 */
		getTopSurface: function() {
		    return this.topSurface;
		},

		/**
		 * Get the bottom surface of this model element.  Only model elements that
		 * can rest on top of other model elements have bottom surfaces.
		 *
		 * @return The bottom surface of this model element
		 */
		getBottomSurface: function() {
		    return this.bottomSurface;
		},

		/**
		 * Get a rectangle the defines the current shape in model space.  By
		 * convention for this simulation, the position is the middle of the
		 * bottom of the block's defining rectangle.
		 *
		 * @return rectangle that defines this item's 2D shape
		 */
		getRect: function() {
			this._rect.x = this.get('position').x;
			this._rect.y = this.get('position').y;
		    return this._rect;
		},

		updateTopSurfaceProperty: function() {
			this.topSurface.minX = this.getRect().left();
			this.topSurface.maxX = this.getRect().right();
			this.topSurface.posY = this.getRect().top();
		},

		updateBottomSurfaceProperty: function() {
			this.bottomSurface.minX = this.getRect().left();
			this.bottomSurface.maxX = this.getRect().right();
			this.bottomSurface.posY = this.getRect().bottom();
		}

	});

	return Block;
});

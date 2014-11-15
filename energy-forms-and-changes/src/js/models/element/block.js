define(function (require) {

	'use strict';

	var _        = require('underscore');
	var Vector2  = require('vector2');

	var RectangularThermalMovableElement = require('models/rectangular-thermal-movable');
	var EnergyChunkContainerSlice        = require('models/energy-chunk-container-slice');

	/**
	 * Constants
	 */
	var Constants = require('models/constants');
	var Static = {};
	// Height and width of all block surfaces, since it is a cube.
	Static.SURFACE_WIDTH = 0.045; // In meters
	// Number of slices where energy chunks may be placed.
	Static.NUM_ENERGY_CHUNK_SLICES = 4;
	Static.MAX_TEMPERATURE = 450; // Degrees Kelvin, value is pretty much arbitrary. Whatever works.

	/**
	 * 
	 */
	var Block = RectangularThermalMovableElement.extend({

		initialize: function(attributes, options) {
			RectangularThermalMovableElement.prototype.initialize.apply(this, [attributes, options]);

			this._rect = new Rectangle2(
		    	this.get('position').x - SURFACE_WIDTH / 2,
		        this.get('position').y,
		        Block.SURFACE_WIDTH,
		        Block.SURFACE_WIDTH
		    );

		    this._thermalContactArea = new ThermalContactArea(this._rect, false);

		    this._sliceBounds = new Rectangle();

			// Surfaces used for stacking and thermal interaction.
			this.topSurface    = new HorizontalSurface(this.getRect().left(), this.getRect().right(), this.getRect().top());
			this.bottomSurface = new HorizontalSurface(this.getRect().left(), this.getRect().right(), this.getRect().bottom());

			this.on('position:change', this.updateTopSurfaceProperty);
			this.on('position:change', this.updateBottomSurfaceProperty);
			this.on('position:change', this.positionEnergyChunkSlices);
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
		},

		/**
		 * Returns the thermal contact area for this object.
		 */
		getThermalContactArea: function() {
			this._thermalContactArea.setBounds(this.getRect());
			return this._thermalContactArea;
		},

		/**
		 * Creates the energy chunk slices for this object
		 */
		addEnergyChunkSlices: function() {
			// The slices for the block are intended to match the projection used in the view.
			var projectionToFront = Constants.MAP_Z_TO_XY_OFFSET(SURFACE_WIDTH / 2);
			var slice;

			for (var i = 0; i < Block.NUM_ENERGY_CHUNK_SLICES; i++) {
				var projectionOffsetVector = Constants.MAP_Z_TO_XY_OFFSET(i * (-Block.SURFACE_WIDTH / (Block.NUM_ENERGY_CHUNK_SLICES - 1)));
				
				slice = new EnergyChunkContainerSlice(this.getBounds(), -i * (Block.SURFACE_WIDTH / (Block.NUM_ENERGY_CHUNK_SLICES - 1)));
				this.slices.push(slice);
			}

			this.positionEnergyChunkSlices();
		},

		/**
		 * Update the bounds (including x-y position) of all the chunk slices
		 *   to reflect the new block position.
		 */
		positionEnergyChunkSlices: function() {
			for (var i = 0; i < this.slices.length; i++) {
				// I've simplified this process from using the Java AffineTransform class, so let's hope it works
				this._sliceBounds.set(this.getBounds());
				this._sliceBounds.x += projectionToFront.x + projectionOffsetVector.x;
				this._sliceBounds.y += projectionToFront.y + projectionOffsetVector.y;
				this.slices[i].bounds.set(this._sliceBounds);
			}
		},

		getEnergyBeyondMaxTemperature: function() {
			return Math.max(this.get('energy') - (Block.MAX_TEMPERATURE * this.get('mass') * this.get('specificHeat')), 0);
		}

	}, Static);

	return Block;
});

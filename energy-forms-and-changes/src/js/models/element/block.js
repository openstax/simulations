define(function (require) {

    'use strict';

    var Rectangle = require('rectangle-node');

    var RectangularThermalMovableElement = require('models/element/rectangular-thermal-movable');
    var EnergyChunkContainerSlice        = require('models/energy-chunk-container-slice');
    var HorizontalSurface                = require('models/horizontal-surface');
    var ThermalContactArea               = require('models/thermal-contact-area');

    /**
     * Constants
     */
    var Constants = require('models/constants');

    /**
     * 
     */
    var Block = RectangularThermalMovableElement.extend({

        initialize: function(attributes, options) {
            RectangularThermalMovableElement.prototype.initialize.apply(this, arguments);

            this._rect = new Rectangle(
                this.get('position').x - Block.SURFACE_WIDTH / 2,
                this.get('position').y,
                Block.SURFACE_WIDTH,
                Block.SURFACE_WIDTH
            );

            this._thermalContactArea = new ThermalContactArea(this._rect, false);

            this._sliceBounds = new Rectangle();

            // Surfaces used for stacking and thermal interaction.
            this.topSurface    = new HorizontalSurface(this.getRect().left(), this.getRect().right(), this.getRect().top(),    this);
            this.bottomSurface = new HorizontalSurface(this.getRect().left(), this.getRect().right(), this.getRect().bottom(), this);

            this.on('position:change', this.updateTopSurface);
            this.on('position:change', this.updateBottomSurface);
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

        updateTopSurface: function() {
            this.topSurface.minX = this.getRect().left();
            this.topSurface.maxX = this.getRect().right();
            this.topSurface.posY = this.getRect().top();
        },

        updateBottomSurface: function() {
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
            var slice;

            for (var i = 0; i < Block.NUM_ENERGY_CHUNK_SLICES; i++) {
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
            // The slices for the block are intended to match the projection used in the view.
            var projectionToFront = Constants.MAP_Z_TO_XY_OFFSET(Block.SURFACE_WIDTH / 2);

            for (var i = 0; i < this.slices.length; i++) {
                // I've simplified this process from using the Java AffineTransform class, so let's hope it works
                var projectionOffsetVector = Constants.MAP_Z_TO_XY_OFFSET(i * (-Block.SURFACE_WIDTH / (Block.NUM_ENERGY_CHUNK_SLICES - 1)));
                this._sliceBounds.set(this.getBounds());
                this._sliceBounds.x += projectionToFront.x + projectionOffsetVector.x;
                this._sliceBounds.y += projectionToFront.y + projectionOffsetVector.y;
                this.slices[i].getBounds().set(this._sliceBounds);
            }
        },

        getEnergyBeyondMaxTemperature: function() {
            return Math.max(this.get('energy') - (Block.MAX_TEMPERATURE * this.get('mass') * this.get('specificHeat')), 0);
        }

    }, Constants.Block);

    return Block;
});

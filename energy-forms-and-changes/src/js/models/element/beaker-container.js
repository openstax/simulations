define(function (require) {

    'use strict';

    var _       = require('underscore');
    var Vector2 = require('common/math/vector2');

    var Beaker                      = require('models/element/beaker');
    var EnergyChunkWanderController = require('models/energy-chunk-wander-controller');

    /**
     * 
     */
    var BeakerContainer = Beaker.extend({

        initialize: function(attributes, options) {
            options = options || {};

            Beaker.prototype.initialize.apply(this, arguments);

            this.potentiallyContainedElements = options.potentiallyContainedElements || [];

            this._motionVector = new Vector2();
        },

        /*
         * Update the fluid level in the beaker based upon any displacement that
         * could be caused by the given rectangles.  This algorithm is strictly
         * two dimensional, even though displacement is more of the 3D concept.
         */
        updateFluidLevel: function(potentiallyDisplacingRectangles) {
            // Calculate the amount of overlap between the rectangle that
            //   represents the fluid and the displacing rectangles.
            var fluidRectangle = this._fluidRect.set(
                this.getRect().x,
                this.getRect().y,
                this.get('width'),
                this.get('height') * this.get('fluidLevel')
            );
            var intersection;
            var overlappingArea = 0;
            _.each(potentiallyDisplacingRectangles, function(rectangle) {
                if (rectangle.overlaps(fluidRectangle)) {
                    intersection = rectangle.intersection(fluidRectangle);
                    overlappingArea += intersection.w * intersection.h;
                }
            });

            // Map the overlap to a new fluid height.  The scaling factor was
            //   empirically determined to look good.
            var newFluidLevel = Math.min(Beaker.INITIAL_FLUID_LEVEL + overlappingArea * 120, 1);
            var proportionateIncrease = newFluidLevel / this.get('fluidLevel');

            if (this.get('fluidLevel') != newFluidLevel) {
                this.set('fluidLevel', newFluidLevel);

                // Update the shapes of the energy chunk slices.
                _.each(this.slices, function(slice) {
                    var originalBounds = slice.getShape().getBounds();
                    slice.getShape().scale(1, proportionateIncrease);
                    console.log(originalBounds.toString(4) + ' | ' + slice.getShape().getBounds().toString(4));
                    //console.log((originalBounds.x - slice.getShape().getBounds().x) + ',' + (originalBounds.y - slice.getShape().getBounds().y) + ' ' + (originalBounds.w - slice.getShape().getBounds().w) + 'x' + (originalBounds.h - slice.getShape().getBounds().h));
                    slice.getShape().translate(
                        originalBounds.x - slice.getShape().getBounds().x,
                        originalBounds.y - slice.getShape().getBounds().y
                    );
                });
            }
            
        },

        isEnergyChunkObscured: function(chunk) {
            var element;
            for (var i = 0; i < this.potentiallyContainedElements.length; i++) {
                element = this.potentiallyContainedElements[i];
                if (this.getThermalContactArea().getBounds().contains(element.getRect()) && element.getProjectedShape().contains(chunk.get('position')))
                    return true;
            }
            return false;
        },

        animateUncontainedEnergyChunks: function(deltaTime) {
            var controller;
            var chunk;
            for (var i = this.energyChunkWanderControllers.length - 1; i >= 0; i--) {
                controller = this.energyChunkWanderControllers[i];
                chunk = controller.energyChunk;

                if (this.isEnergyChunkObscured(chunk)) {
                    // This chunk is being transferred from a container in the
                    //   beaker to the fluid, so move it sideways.
                    var xVelocity = 0.05 * deltaTime * (this.getCenterPoint().x > chunk.get('position').x ? -1 : 1);
                    var motionVector = this._motionVector.set(xVelocity, 0);
                    chunk.translate(motionVector);
                }
                else {
                    controller.updatePosition(deltaTime);
                }

                if (!this.isEnergyChunkObscured(chunk) && this.getSliceBounds().contains(chunk.get('position'))) {
                    // Chunk is in a place where it can migrate to the slices and
                    //   stop moving.
                    this.moveEnergyChunkToSlices(controller.energyChunk);
                }
            }
        },

        addEnergyChunk: function(chunk) {
            if (this.isEnergyChunkObscured(chunk)) {
                // Chunk obscured by a model element in the beaker, probably
                //   because the chunk just came from the model element.
                chunk.zPosition = 0;
                this.approachingEnergyChunks.add(chunk);
                this.energyChunkWanderControllers.push(new EnergyChunkWanderController(chunk, this.get('position')));
            }
            else {
                Beaker.prototype.addEnergyChunk.apply(this, [chunk]);
            }
        }

    });

    return BeakerContainer;
});

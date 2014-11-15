define(function (require, exports, module) {

    'use strict';

    // Libraries
    var _ = require('underscore');

    // Project dependiencies
    var FixedIntervalSimulation = require('common/simulation/simulation');

    // Constants
    var Constants = require('models/constants');

    /**
     * Minimum distance allowed between two objects.  This basically prevents
     *   floating point issues.
     */
    var MIN_INTER_ELEMENT_DISTANCE = 1E-9; // In meters

    /** 
     * Threshold of temperature difference between the bodies in a multi-body
     *   system below which energy can be exchanged with air.
     */
    var MIN_TEMPERATURE_DIFF_FOR_MULTI_BODY_AIR_ENERGY_EXCHANGE = 2.0; // In degrees K, empirically determined

    // Initial thermometer location, intended to be away from any model objects.
    var INITIAL_THERMOMETER_LOCATION = new Vector2( 100, 100 );

    var NUM_THERMOMETERS = 3;
    
    var BEAKER_WIDTH = 0.085; // In meters.
    var BEAKER_HEIGHT = BEAKER_WIDTH * 1.1;

    // Flag that can be turned on in order to print out some profiling info.
    var ENABLE_INTERNAL_PROFILING = false;

    /**
     * 
     */
    var EFCIntroSimulation = FixedIntervalSimulation.extend({

        defaults: _.extend(FixedIntervalSimulation.prototype.defaults, {

            energyChunksVisible: false

        }),
        
        /**
         *
         */
        initialize: function(attributes, options) {

            (options || options = {});
            options.framesPerSecond = Constants.FRAMES_PER_SECOND;

            FixedIntervalSimulation.prototype.initialize.apply(this, [attributes, options]);

            // Burners
            this.leftBurner  = null;
            this.rightBurner = null;

            // Moveable thermal model objects
            this.brick     = null;
            this.ironBlock = null;
            this.beaker    = null;
            this.movableThermalEnergyContainers = [];
            this.movableThermalEnergyContainers.push(this.brick);
            this.movableThermalEnergyContainers.push(this.ironBlock);
            this.movableThermalEnergyContainers.push(this.beaker);

            // Thermometers
            this.thermometers = [];
            for (var i = 0; i < NUM_THERMOMETERS; i++) {
                //thermometers.push(new Thermometer)
            }

            // Air
            this.air = null;

            // Element groups
            this.movableElements = [
                this.ironBlock,
                this.brick,
                this.beaker
            ];
            this.supportingSurfaces = [
                this.leftBurner,
                this.rightBurner,
                this.brick,
                this.ironBlock,
                this.beaker
            ];
            this.burners = [
                this.leftBurner,
                this.rightBurner
            ];
        },

        /**
         *
         */
        applyOptions: function(options) {
            FixedIntervalSimulation.prototype.applyOptions.apply(this, [options]);

            
        },

        /**
         *
         */
        initComponents: function() {
            
        },

        /**
         *
         */
        reset: function() {
            FixedIntervalSimulation.prototype.reset.apply(this);

            this.air.reset();
            this.leftBurner.reset();
            this.rightBurner.reset();
            ironBlock.reset();
            brick.reset();
            beaker.reset();
            _.each(this.thermometers, function(thermometer){
                thermometer.reset();
            });
        },

        /**
         *
         */
        play: function() {
            // May need to save the current state here for the rewind button

            FixedIntervalSimulation.prototype.play.apply(this);
        },

        /**
         *
         */
        rewind: function() {
            // Apply the saved state
        },

        /**
         * 
         */
        _update: function(time, delta) {
            // For the time slider and anything else relying on time
            this.set('time', time);

            // Reposition elements with physics/snapping
            this._findSupportingSurfaces(time, delta);

            // Update the fluid level in the beaker, which could be displaced by
            //   one or more of the blocks.
            this.beaker.updateFluidLevel([
                this.brick.getRect(), 
                this.ironBlock.getRect()
            ]);

            // Exchange energy between objects
            this._exchangeEnergyChunks(time, delta);
        },

        /**
         * PhET Original explanation: 
         *   "Cause any user-movable model elements that are not supported by a
         *      surface to fall (or, in some cases, jump up) towards the nearest
         *      supporting surface."
         */
        _findSupportingSurfaces: function(time, delta) {
            _.each(this.movableElements, function(element) {
                if (!element.get('userControlled') && !element.getSupportingSurface() && element.get('position').y !== 0) {
                    var minYPos = 0;
                    
                    // Determine whether there is something below this element that
                    //   it can land upon.
                    var potentialSupportingSurface = this.findBestSupportSurface(element);
                    if (potentialSupportingSurface) {
                        minYPos = potentialSupportingSurface.get().yPos;

                        // Center the element above its new parent
                        var targetX = potentialSupportingSurface.get().getCenterX();
                        element.setX( targetX );
                    }
                    
                    // Calculate a proposed Y position based on gravitational falling.
                    var acceleration = -9.8; // meters/s*s
                    var velocity = element.verticalVelocity.get() + acceleration * delta;
                    var proposedYPos = element.position.get().getY() + velocity * delta;
                    if ( proposedYPos < minYPos ) {
                        // The element has landed on the ground or some other surface.
                        proposedYPos = minYPos;
                        element.verticalVelocity.set( 0.0 );
                        if ( potentialSupportingSurface != null ) {
                            element.setSupportingSurface( potentialSupportingSurface );
                            potentialSupportingSurface.get().addElementToSurface( element );
                        }
                    }
                    else {
                        element.verticalVelocity.set( velocity );
                    }
                    element.position.set( new Vector2( element.position.get().getX(), proposedYPos ) );
                }
            }, this);
        },

        /**
         * 
         */
        _exchangeEnergyChunks: function(time, delta) {
            /**
             *  Note: The original intent was to design all the energy containers
             *   such that the order of the exchange didn't matter, nor who was
             *   exchanging with whom.  This turned out to be a lot of extra work to
             *   maintain, and was eventually abandoned.  So, the order and nature of
             *   the exchanged below should be maintained unless there is a good
             *   reason not to, and any changes should be well tested.
             */

            // Loop through all the movable thermal energy containers and have them
            //   exchange energy with one another.
            for (var i = 0; i < this.movableElements.length - 1; i++) {
                for (var j = i + 1; j < this.moveablmovableElementseThermalEnergyContainers.length; j++) {
                    this.movableElements[i].exchangeEnergyWith(this.movableElements[j], delta);
                }
            }

            // Exchange thermal energy between the burners and the other thermal
            //   model elements, including air.
            _.each(this.burners, function(burner) {
                if (burner.areAnyOnTop(this.movableElements)) {
                    _.each(this.movableElements, function(element) {
                        burner.addOrRemoveEnergyToFromObject(element, delta);
                    });
                }
                else {
                    burner.addOrRemoveEnergyToFromObject(this.air, delta);
                }
            });

            // Exchange energy chunks between burners and non-air energy containers.
            
        },

        /**
         * Finds the most appropriate supporting surface for the element.
         */
        findBestSupportSurface: function(element) {
            var bestOverlappingSurface = null;

            // Check each of the possible supporting elements in the model to see
            //   if this element can go on top of it.
            _.each(this.supportingSurfaces, function(potentialSupportingSurface) {
                if ( potentialSupportingElement == element || potentialSupportingElement.isStackedUpon( element ) ) {
                    // The potential supporting element is either the same as the
                    //   test element or is sitting on top of the test element.  In
                    //   either case, it can't be used to support the test element,
                    //   so skip it.
                    continue;
                }
                if ( element.getBottomSurfaceProperty().get().overlapsWith( potentialSupportingElement.getTopSurfaceProperty().get() ) ) {
                    // There is at least some overlap.  Determine if this surface
                    //   is the best one so far.
                    var surfaceOverlap = getHorizontalOverlap( potentialSupportingElement.getTopSurfaceProperty().get(), element.getBottomSurfaceProperty().get() );
                    
                    // The following nasty 'if' clause determines if the potential
                    //   supporting surface is a better one than we currently have
                    //   based on whether we have one at all, or has more overlap
                    //   than the previous best choice, or is directly above the
                    //   current one.
                    if (bestOverlappingSurface == null || (
                            surfaceOverlap > this.getHorizontalOverlap(bestOverlappingSurface.get(), element.getBottomSurfaceProperty().get() ) && 
                            !this.isDirectlyAbove(bestOverlappingSurface.get(), potentialSupportingElement.getTopSurfaceProperty().get())
                        ) || (
                            this.isDirectlyAbove(potentialSupportingElement.getTopSurfaceProperty().get(), bestOverlappingSurface.get())
                        )) {
                        bestOverlappingSurface = potentialSupportingElement.getTopSurfaceProperty();
                    }
                }
            }, this);

            // Make sure that the best supporting surface isn't at the bottom of
            //   a stack, which can happen in cases where the model element being
            //   tested isn't directly above the best surface's center.
            if ( bestOverlappingSurface != null ) {
                while ( bestOverlappingSurface.get().getElementOnSurface() != null ) {
                    bestOverlappingSurface = bestOverlappingSurface.get().getElementOnSurface().getTopSurfaceProperty();
                }
            }

            return bestOverlappingSurface;
        },

        /**
         * Get the amount of overlap in the x direction between two horizontal surfaces.
         */
        getHorizontalOverlap: function(s1, s2) {
            var lowestMax  = Math.min( s1.xRange.getMax(), s2.xRange.getMax() );
            var highestMin = Math.max( s1.xRange.getMin(), s2.xRange.getMin() );
            return Math.max( lowestMax - highestMin, 0 );
        },
        
        /**
         * Returns true if surface s1's center is above surface s2.
         */
        isDirectlyAbove: function(s1, s2) {
            return s2.xRange.contains( s1.getCenterX() ) && s1.yPos > s2.yPos;
        },

    });

    return EFCIntroSimulation;
});

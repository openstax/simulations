define(function (require, exports, module) {

    'use strict';

    // Libraries
    var _ = require('underscore');

    // Project dependiencies
    var FixedIntervalSimulation = require('common/simulation/simulation');

    // Constants
    var Constants = require('models/constants');

    /**
     * 
     */
    var IntroSimulation = FixedIntervalSimulation.extend({

        defaults: _.extend(FixedIntervalSimulation.prototype.defaults, {

            energyChunksVisible: false

        }),
        
        /**
         *
         */
        initialize: function(attributes, options) {

            (options || options = {});
            options.framesPerSecond = Constants.FRAMES_PER_SECOND;

            FixedIntervalSimulation.prototype.initialize.apply(this, arguments);

            // Burners
            this.leftBurner  = null;
            this.rightBurner = null;

            // Moveable thermal model objects
            this.brick     = null;
            this.ironBlock = null;
            this.beaker    = null;

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
            this.blocks = [
                this.brick,
                this.ironBlock
            ];

            // Cached objects
            this._location   = Vector2();
            this._pointAbove = Vector2();
            this._initialMotionConstraints = Vector2();
            this._translation = Vector2();
            this._burnerBlockingRect = new Rectangle();
            this._beakerLeftSide = new Rectangle();
            this._beakerRightSide = new Rectangle();
            this._beakerBottom = new Rectangle();
            this._testRect = new Rectangle();
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
                for (var j = i + 1; j < this.movableElements.length; j++) {
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
            }, this);

            // Exchange energy chunks between burners and non-air energy containers.
            _.each(this.burners, function(burner) {
                _.each(this.movableElements, function(element) {
                    if (burner.inContactWith(element)) {
                        if (burner.canSupplyEnergyChunk() && (burner.getEnergyChunkBalanceWithObjects() > 0 || element.getEnergyChunkBalance() < 0)) {
                            // Push an energy chunk into the item on the burner.
                            element.addEnergyChunk(burner.extractClosestEnergyChunk(element.getCenterPoint()));
                        }
                        else if (burner.canAcceptEnergyChunk() && (burner.getEnergyChunkBalanceWithObjects() < 0 || element.getEnergyChunkBalance() > 0)) {
                            // Extract an energy chunk from the model element.
                            var chunk = element.extractClosestEnergyChunk(burner.getFlameIceRect());
                            if (chunk)
                                burner.addEnergyChunk(chunk);
                        }
                    }
                });
            }, this);

            // Exchange energy chunks between movable thermal energy containers.
            var elem1;
            var elem2;
            for (var i = 0; i < this.movableElements.length - 1; i++) {
                for (var j = i + 1; j < this.movableElements.length; j++) {
                    elem1 = this.movableElements[i];
                    elem2 = this.movableElements[j];
                    if (elem1.getThermalContactArea().getThermalContactLength(elem2.getThermalContactArea()) > 0) {
                        // Exchange chunks if appropriate
                        if (elem1.getEnergyChunkBalance() > 0 && elem2.getEnergyChunkBalance() < 0)
                            elem2.addEnergyChunk(elem1.extractClosestEnergyChunk(elem2.getThermalContactArea.getBounds()));
                        else if (elem1.getEnergyChunkBalance() < 0 && elem2.getEnergyChunkBalance() > 0)
                            elem1.addEnergyChunk(elem2.extractClosestEnergyChunk(elem1.getThermalContactArea.getBounds()));
                    }
                }
            }

            // Patrick's note: I have no idea why we're exchanging chunks between movable elements twice.

            // Exchange energy and energy chunks between the movable thermal
            //   energy containers and the air.
            _.each(this.movableElements, function(element) {
                // Set up some variables that are used to decide whether or not
                //   energy should be exchanged with air.
                var contactWithOtherMovableElement = false;
                var immersedInBeaker = false;
                var maxTemperatureDifference = 0;

                // Figure out the max temperature difference between touching
                //   energy containers.
                _.each(this.movableElements, function(otherElement) {
                    if (element === otherElement)
                        return;

                    if (element.getThermalContactArea().getThermalContactLength(otherElement.getThermalContactArea()) > 0) {
                        contactWithOtherMovableElement = true;
                        maxTemperatureDifference = Math.max(Math.abs(element.getTemperature() - otherElement.getTemperature()), maxTemperatureDifference);
                    }
                }, this);

                if (this.beaker.getThermalContactArea().getBounds().contains(element.getRect())) {
                    // This model element is immersed in the beaker.
                    immersedInBeaker = true;
                }

                // Exchange energy and energy chunks with the air if appropriate
                //   conditions met.
                if (!contactWithOtherMovableElement || (
                        !immersedInBeaker && (
                            maxTemperatureDifference < IntroSimulation.MIN_TEMPERATURE_DIFF_FOR_MULTI_BODY_AIR_ENERGY_EXCHANGE ||
                            element.getEnergyBeyondMaxTemperature() > 0
                        )
                    )
                ) {
                    this.air.exchangeEnergyWith(element, deltaTime);
                    if (element.getEnergyChunkBalance() > 0) {
                        var pointAbove = this._pointAbove.set(
                            Math.random() * element.getRect().w + element.getRect.left(),
                            element.getRect().top()
                        );
                        var chunk = element.extractClosestEnergyChunk(pointAbove);
                        if (chunk) {
                            var initialMotionConstraints = null;
                            if (element instanceof Beaker) {
                                // Constrain the energy chunk's motion so that it
                                // doesn't go through the edges of the beaker.
                                // There is a bit of a fudge factor in here to
                                // make sure that the sides of the energy chunk,
                                // and not just the center, stay in bounds.
                                var energyChunkWidth = 0.01;
                                initialMotionConstraints = this._initialMotionConstraints.set( 
                                    element.getRect().x + energyChunkWidth / 2,
                                    element.getRect().y,
                                    element.getRect().w - energyChunkWidth,
                                    element.getRect().h 
                                );
                            }
                            this.air.addEnergyChunk(chunk, initialMotionConstraints);
                        }
                    }
                    else if (element.getEnergyChunkBalance() < 0 && element.getTemperature() < this.air.getTemperature()) {
                        element.addEnergyChunk(this.air.requestEnergyChunk(element.getCenterPoint()));
                    }
                }
            }, this);

            // Exchange energy chunks between the air and the burners.
            _.each(this.burners, function(burner) {
                var energyChunkCountForAir = burner.getEnergyChunkCountForAir();
                if (energyChunkCountForAir > 0)
                    this.air.addEnergyChunk(burner.extractClosestEnergyChunk(burner.getCenterPoint()), null);
                else if (energyChunkCountForAir < 0)
                    burner.addEnergyChunk(this.air.requestEnergyChunk(burner.getCenterPoint()));
            });
        },

        /**
         * Validate the position being proposed for the given model element.  This
         * evaluates whether the proposed position would cause the model element
         * to move through another solid element, or the side of the beaker, or
         * something that would look weird to the user and, if so, prevent the odd
         * behavior from happening by returning a location that works better.
         *
         * @param element         Element whose position is being validated.
         * @param proposedPosition Proposed new position for element
         * @return The original proposed position if valid, or alternative position
         *         if not.
         */
        validatePosition: function(element, proposedPosition) {
            // Compensate for the element's center X position
            var translation = this._translation
                .set(proposedPosition)
                .sub(element.get('position'));

            // Figure out how far the block's right edge appears to protrude to
            //   the side due to perspective.
            var blockPerspectiveExtension = Constants.Block.SURFACE_WIDTH * Constants.BlockView.PERSPECTIVE_EDGE_PROPORTION * Math.cos(Constants.BlockView.PERSPECTIVE_ANGLE) / 2;

            // Validate against burner boundaries.  Treat the burners as one big
            //   blocking rectangle so that the user can't drag things between
            //   them.  Also, compensate for perspective so that we can avoid
            //   difficult z-order issues.
            var standPerspectiveExtension = this.leftBurner.getOutlineRect().h * Constants.IntroSimulationView.BURNER_EDGE_TO_HEIGHT_RATIO * Math.cos(Constants.BurnerStandView.PERSPECTIVE_ANGLE) / 2;
            var burnerRectX = this.leftBurner.getOutlineRect().x - standPerspectiveExtension - (element !== this.beaker ? blockPerspectiveExtension : 0);
            var burnerBlockingRect = this._burnerBlockingRect.set( 
                burnerRectX,
                this.leftBurner.getOutlineRect().y,
                this.rightBurner.getOutlineRect().right() - burnerRectX,
                this.leftBurner.getOutlineRect().h
            );
            translation = this.determineAllowedTranslation(element.getRect(), burnerBlockingRect, translation, false);

            // Validate against the sides of the beaker.
            if (element !== this.beaker) {
                // Create three rectangles to represent the two sides and the top
                //   of the beaker.
                var testRectThickness = 1E-3; // 1 mm thick walls.
                var beakerRect = this.beaker.getRect();
                var beakerLeftSide = this._beakerLeftSide.set(
                    beakerRect.getMinX() - blockPerspectiveExtension,
                    this.beaker.getRect().bottom(),
                    testRectThickness + blockPerspectiveExtension * 2,
                    this.beaker.getRect().h + blockPerspectiveExtension
                );
                var beakerRightSide = this._beakerRightSide.set(
                    this.beaker.getRect().right() - testRectThickness - blockPerspectiveExtension,
                    this.beaker.getRect().bottom(),
                    testRectThickness + blockPerspectiveExtension * 2,
                    this.beaker.getRect().h + blockPerspectiveExtension
                );
                var beakerBottom = this._beakerBottom.set(
                    this.beaker.getRect().left(), 
                    this.beaker.getRect().bottom(), 
                    this.beaker.getRect().w, 
                    testRectThickness
                );

                // Do not restrict the model element's motion in positive Y
                //   direction if the beaker is sitting on top of the model 
                //   element - the beaker will simply be lifted up.
                var restrictPositiveY = !this.beaker.isStackedUpon(element);

                // Clamp the translation based on the beaker position.
                translation = this.determineAllowedTranslation(element.getRect(), beakerLeftSide,  translation, restrictPositiveY);
                translation = this.determineAllowedTranslation(element.getRect(), beakerRightSide, translation, restrictPositiveY);
                translation = this.determineAllowedTranslation(element.getRect(), beakerBottom,    translation, restrictPositiveY);
            }

            // Now check the model element's motion against each of the blocks.
            _.each(this.blocks, function(block) {
                if (element === block)
                    return;

                // Do not restrict the model element's motion in positive Y
                //   direction if the tested block is sitting on top of the model
                //   element - the block will simply be lifted up.
                var restrictPositiveY = !block.isStackedUpon(element);

                var testRect = this._testRect.set(element.getRect());
                if (element === this.beaker) {
                    // Special handling for the beaker - block it at the outer
                    // edge of the block instead of the center in order to
                    // simplify z-order handling.
                    testRect.set( 
                        testRect.x - blockPerspectiveExtension,
                        testRect.y,
                        testRect.w + blockPerspectiveExtension * 2,
                        testRect.h
                    );
                }

                // Clamp the translation based on the test block's position, but
                //   handle the case where the block is immersed in the beaker.
                if (element !== this.beaker || !this.beaker.getRect().contains(block.getRect())) {
                    translation = this.determineAllowedTranslation(testRect, block.getRect(), translation, restrictPositiveY);
                }
            });

            // Determine the new position based on the resultant translation and return it.
            return translation.add(element.get('position'));
        },

        /*
         * Determine the portion of a proposed translation that may occur given
         * a moving rectangle and a stationary rectangle that can block the moving
         * one.
         *
         * @param movingRect
         * @param stationaryRect
         * @param proposedTranslation
         * @param restrictPosY        Boolean that controls whether the positive Y
         *                            direction is restricted.  This is often set
         *                            false if there is another model element on
         *                            top of the one being tested.
         * @return
         */
        determineAllowedTranslation: function(movingRect, stationaryRect, proposedTranslation, restrictPosY) {
            // TODO
        }

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

        /**
         * This replaces EFACIntroModel.getTemperatureAndColorAtLocation because
         *   I believe it should be the job of the element model to internally
         *   decide what it's temperature should be, and it should be up to the
         *   element view to determine the color.  Therefore, the simulation
         *   model will only return the element, and objects that use this will
         *   be responsible for requesting the temperature and color at location
         *   from the returned element.
         */
        getElementAtLocation: function(x, y) {
            var location = this._location;
            if (x instanceof Vector2)
                location.set(x);
            else
                location.set(x, y);

            // Test blocks first.  This is a little complicated since the z-order
            //   must be taken into account.
            this.blocks.sort(function(b1, b2) {
                if (b1.get('position').equals(b2.get('position')))
                    return 0;
                if (b2.get('position').x > b1.get('position').x || b2.get('position').y > b1.get('position').y)
                    return 1;
                return -1;
            });

            for (var i = 0; i < this.blocks.length; i++) {
                if (this.blocks[i].getProjectedShape().contains(location))
                    return this.blocks[i];
            }
            
            // Test if this point is in the water or steam associated with the beaker.
            if (this.beaker.getThermalContactArea().getBounds().contains(location) ||
                (this.beaker.getSteamArea().contains(location) && this.beaker.get('steamingProportion') > 0)) {
                return this.beaker;
            }
            
            // Test if the point is a burner.
            for (var j = 0; j < this.burners.length; j++) {
                if (this.burners[j].getFlameIceRect().contains(location))
                    return this.burners[j];
            }

            // Point is in nothing else, so return the air.
            return air;
        },

        getBlockList: function() {
            return this.blocks;
        },

        getBeaker(): function() {
            return this.beaker;
        }

    }, Constants.IntroSimulation);

    return IntroSimulation;
});

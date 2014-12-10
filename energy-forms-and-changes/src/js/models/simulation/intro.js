define(function (require, exports, module) {

    'use strict';

    // Libraries
    var _         = require('underscore');
    var Vector2   = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');

    // Project dependiencies
    var FixedIntervalSimulation     = require('common/simulation/fixed-interval-simulation');
    var PiecewiseCurve              = require('common/math/piecewise-curve');
    var Air                         = require('models/air');
    var Beaker                      = require('models/element/beaker');
    var BeakerContainer             = require('models/element/beaker-container');
    var Burner                      = require('models/element/burner');
    var Block                       = require('models/element/block');
    var Brick                       = require('models/element/brick');
    var IronBlock                   = require('models/element/iron-block');
    var ElementFollowingThermometer = require('models/element/element-following-thermometer');

    // Constants
    var Constants = require('constants');

    /**
     * 
     */
    var IntroSimulation = FixedIntervalSimulation.extend({

        defaults: _.extend(FixedIntervalSimulation.prototype.defaults, {}),
        
        /**
         *
         */
        initialize: function(attributes, options) {

            options = options || {};
            options.framesPerSecond = Constants.FRAMES_PER_SECOND;

            FixedIntervalSimulation.prototype.initialize.apply(this, arguments);

            // Burners
            this.rightBurner = new Burner({ position: new Vector2(0.18, 0) });
            this.leftBurner  = new Burner({ position: new Vector2(0.08, 0) });

            // Moveable thermal model objects
            this.brick     = new Brick(    { position: new Vector2(-0.1,   0) });
            this.ironBlock = new IronBlock({ position: new Vector2(-0.175, 0) });

            this.beaker = new BeakerContainer({ 
                position: new Vector2(-0.015, 0), 
                potentiallyContainedObjects: [
                    this.brick,
                    this.ironBlock
                ],
                width:  IntroSimulation.BEAKER_WIDTH,
                height: IntroSimulation.BEAKER_HEIGHT
            });

            // Thermometers
            this.thermometers = [];
            for (var i = 0; i < IntroSimulation.NUM_THERMOMETERS; i++) {
                this.thermometers.push(new ElementFollowingThermometer({
                    position: IntroSimulation.INITIAL_THERMOMETER_LOCATION,
                    active: false
                }, {
                    elementLocator: this
                }));
            }

            // Air
            this.air = new Air();

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
            this._location   = new Vector2();
            this._pointAbove = new Vector2();
            this._initialMotionConstraints = new Vector2();
            this._translation = new Vector2();
            this._allowedTranslation = new Vector2();
            this._burnerBlockingRect = new Rectangle();
            this._beakerLeftSide = new Rectangle();
            this._beakerRightSide = new Rectangle();
            this._beakerBottom = new Rectangle();
            this._testRect = new Rectangle();

            // Just for debugging
            this.leftBurner.cid = 'leftBurner';
            this.rightBurner.cid = 'rightBurner';
            this.brick.cid = 'brick';
            this.ironBlock.cid = 'ironBlock';
            this.beaker.cid = 'beaker';
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
            this.ironBlock.reset();
            this.brick.reset();
            this.beaker.reset();
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
        _update: function(time, deltaTime) {
            // For the time slider and anything else relying on time
            this.set('time', time);

            // Reposition elements with physics/snapping
            this._findSupportingSurfaces(time, deltaTime);

            // Update the fluid level in the beaker, which could be displaced by
            //   one or more of the blocks.
            this.beaker.updateFluidLevel([
                this.brick.getRect(), 
                this.ironBlock.getRect()
            ]);

            // Exchange energy between objects
            this._exchangeEnergy(time, deltaTime);
        },

        /**
         * PhET Original explanation: 
         *   "Cause any user-movable model elements that are not supported by a
         *      surface to fall (or, in some cases, jump up) towards the nearest
         *      supporting surface."
         */
        _findSupportingSurfaces: function(time, deltaTime) {
            _.each(this.movableElements, function(element) {
                // If the user is moving it, do nothing; if it's already at rest, do nothing.
                if (!element.get('userControlled') && !element.getSupportingSurface() && element.get('position').y !== 0) {
                    var minYPos = 0;
                    
                    // Determine whether there is something below this element that
                    //   it can land upon.
                    var potentialSupportingSurface = this.findBestSupportSurface(element);
                    if (potentialSupportingSurface) {
                        minYPos = potentialSupportingSurface.yPos;

                        // Center the element above its new parent
                        var targetX = potentialSupportingSurface.getCenterX();
                        element.setX( targetX );
                    }
                    
                    // Calculate a proposed Y position based on gravitational falling.
                    var acceleration = -9.8; // meters/s*s
                    var velocity = element.get('verticalVelocity') + acceleration * deltaTime;
                    var proposedYPos = element.get('position').y + velocity * deltaTime;
                    if (proposedYPos < minYPos) {
                        // The element has landed on the ground or some other surface.
                        proposedYPos = minYPos;
                        element.set('verticalVelocity', 0);
                        if (potentialSupportingSurface) {
                            element.setSupportingSurface(potentialSupportingSurface);
                            potentialSupportingSurface.addElementToSurface(element);
                        }
                    }
                    else {
                        element.set('verticalVelocity', velocity);
                    }
                    //console.log(element.cid + ': ' + element.get('position').x + ', ' + proposedYPos);
                    element.setPosition(element.get('position').x, proposedYPos);
                }
            }, this);
        },

        /**
         * 
         */
        _exchangeEnergy: function(time, deltaTime) {
            var i;
            var j;

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
            for (i = 0; i < this.movableElements.length - 1; i++) {
                for (j = i + 1; j < this.movableElements.length; j++) {
                    this.movableElements[i].exchangeEnergyWith(this.movableElements[j], deltaTime);
                }
            }

            // Exchange thermal energy between the burners and the other thermal
            //   model elements, including air.
            _.each(this.burners, function(burner) {
                if (burner.areAnyOnTop(this.movableElements)) {
                    _.each(this.movableElements, function(element) {
                        burner.addOrRemoveEnergyToFromObject(element, deltaTime);
                    });
                }
                else {
                    burner.addOrRemoveEnergyToFromObject(this.air, deltaTime);
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
            for (i = 0; i < this.movableElements.length - 1; i++) {
                for (j = i + 1; j < this.movableElements.length; j++) {
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
                            Math.random() * element.getRect().w + element.getRect().left(),
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
            var blockPerspectiveExtension = Block.SURFACE_WIDTH * Constants.BlockView.PERSPECTIVE_EDGE_PROPORTION * Math.cos(Constants.BlockView.PERSPECTIVE_ANGLE) / 2;

            // Validate against burner boundaries.  Treat the burners as one big
            //   blocking rectangle so that the user can't drag things between
            //   them.  Also, compensate for perspective so that we can avoid
            //   difficult z-order issues.
            var standPerspectiveExtension = this.leftBurner.getOutlineRect().h * Burner.EDGE_TO_HEIGHT_RATIO * Math.cos(Constants.BurnerStandView.PERSPECTIVE_ANGLE) / 2;
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
                    beakerRect.left() - blockPerspectiveExtension,
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
            }, this);

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
            var translation;

            translation = this.checkOverlapOnProposedTranslation(movingRect, stationaryRect, proposedTranslation, restrictPosY);
            
            if (translation)
                return translation;

            translation = this.checkCollisionsOnProposedTranslation(movingRect, stationaryRect, proposedTranslation, restrictPosY);

            return translation;
        },

        checkOverlapOnProposedTranslation: function(movingRect, stationaryRect, proposedTranslation, restrictPosY) {
            var translation = this._allowedTranslation;

            // Test for case where rectangles already overlap.
            if (movingRect.overlaps(stationaryRect)) {
                // The rectangles already overlap.  Are they right on top of one another?
                if (movingRect.center().x === stationaryRect.center().x && movingRect.center().x === stationaryRect.center().x) {
                    console.error('IntroSimulation - Warning: Rectangle centers in same location--returning zero vector.');
                    return translation.set(0, 0);
                }

                // Determine the motion in the X & Y directions that will "cure"
                //   the overlap.
                var xOverlapCure = 0;
                if (movingRect.right() > stationaryRect.left() && movingRect.left() < stationaryRect.left()) {
                    xOverlapCure = stationaryRect.left() - movingRect.right();
                }
                else if (stationaryRect.right() > movingRect.left() && stationaryRect.left() < movingRect.left()) {
                    xOverlapCure = stationaryRect.right() - movingRect.left();
                }
                var yOverlapCure = 0;
                if (movingRect.top() > stationaryRect.bottom() && movingRect.bottom() < stationaryRect.bottom()) {
                    yOverlapCure = stationaryRect.bottom() - movingRect.top();
                }
                else if ( stationaryRect.top() > movingRect.bottom() && stationaryRect.bottom() < movingRect.bottom()) {
                    yOverlapCure = stationaryRect.top() - movingRect.bottom();
                }

                // Something is wrong with algorithm if both values are zero,
                //   since overlap was detected by the "intersects" method.
                if (xOverlapCure === 0 && yOverlapCure === 0)
                    return;

                // Return a vector with the smallest valid "cure" value, leaving
                //   the other translation value unchanged.
                if (xOverlapCure !== 0 && Math.abs(xOverlapCure) < Math.abs(yOverlapCure)) {
                    return translation.set(xOverlapCure, proposedTranslation.y);
                }
                else {
                    return translation.set(proposedTranslation.x, yOverlapCure);
                }
            }
        },

        checkCollisionsOnProposedTranslation: function(movingRect, stationaryRect, proposedTranslation, restrictPosY) {
            var translation = this._allowedTranslation;

            var xTranslation = proposedTranslation.x;
            var yTranslation = proposedTranslation.y;

            // X direction.
            if (proposedTranslation.x > 0) {
                // Check for collisions moving right.
                var rightEdgeSmear = this.projectShapeFromLine(movingRect.right(), movingRect.bottom(), movingRect.right(), movingRect.top(), proposedTranslation);

                if (movingRect.right() <= stationaryRect.left() && rightEdgeSmear.intersects(stationaryRect)) {
                    // Collision detected, limit motion.
                    xTranslation = stationaryRect.left() - movingRect.right() - IntroSimulation.MIN_INTER_ELEMENT_DISTANCE;
                }
            }
            else if (proposedTranslation.x < 0) {
                // Check for collisions moving left.
                var leftEdgeSmear = this.projectShapeFromLine(movingRect.left(), movingRect.bottom(), movingRect.left(), movingRect.top(), proposedTranslation);

                if (movingRect.left() >= stationaryRect.right() && leftEdgeSmear.intersects(stationaryRect)) {
                    // Collision detected, limit motion.
                    xTranslation = stationaryRect.right() - movingRect.left() + IntroSimulation.MIN_INTER_ELEMENT_DISTANCE;
                }
            }

            // Y direction.
            if (proposedTranslation.y > 0 && restrictPosY) {
                // Check for collisions moving up.
                var topEdgeSmear = this.projectShapeFromLine(movingRect.left(), movingRect.top(), movingRect.right(), movingRect.top(), proposedTranslation);

                if (movingRect.top() <= stationaryRect.bottom() && topEdgeSmear.intersects(stationaryRect)) {
                    // Collision detected, limit motion.
                    yTranslation = stationaryRect.bottom() - movingRect.top() - IntroSimulation.MIN_INTER_ELEMENT_DISTANCE;
                }
            }
            if (proposedTranslation.y < 0) {
                // Check for collisions moving down.
                var bottomEdgeSmear = this.projectShapeFromLine(movingRect.left(), movingRect.bottom(), movingRect.right(), movingRect.bottom(), proposedTranslation);

                if (movingRect.bottom() >= stationaryRect.top() && bottomEdgeSmear.intersects(stationaryRect)) {
                    // Collision detected, limit motion.
                    yTranslation = stationaryRect.top() - movingRect.bottom() + IntroSimulation.MIN_INTER_ELEMENT_DISTANCE;
                }
            }

            return translation.set(xTranslation, yTranslation);
        },

        projectShapeFromLine: function(x1, y1, x2, y2, projection) {
            var curve = new PiecewiseCurve();
            curve.moveTo(x1, y1);
            curve.lineTo(x1 + projection.x, y1 + projection.y);
            curve.lineTo(x2 + projection.x, y2 + projection.y);
            curve.lineTo(x2, y2);
            curve.close();
            return curve;
        },

        /**
         * Finds the most appropriate supporting surface for the element.
         */
        findBestSupportSurface: function(element) {
            var bestOverlappingSurface = null;

            // Check each of the possible supporting elements in the model to see
            //   if this element can go on top of it.
            _.each(this.supportingSurfaces, function(potentialSupportingElement) {
                if (potentialSupportingElement === element || potentialSupportingElement.isStackedUpon(element)) {
                    // The potential supporting element is either the same as the
                    //   test element or is sitting on top of the test element.  In
                    //   either case, it can't be used to support the test element,
                    //   so skip it.
                    return;
                }

                if (element.getBottomSurface().overlapsWith( potentialSupportingElement.getTopSurface())) {
                    // There is at least some overlap.  Determine if this surface
                    //   is the best one so far.
                    var surfaceOverlap = this.getHorizontalOverlap(potentialSupportingElement.getTopSurface(), element.getBottomSurface());
                    
                    // The following nasty 'if' clause determines if the potential
                    //   supporting surface is a better one than we currently have
                    //   based on whether we have one at all, or has more overlap
                    //   than the previous best choice, or is directly above the
                    //   current one.
                    if (bestOverlappingSurface === null || (
                            surfaceOverlap > this.getHorizontalOverlap(bestOverlappingSurface, element.getBottomSurface()) && 
                            !this.isDirectlyAbove(bestOverlappingSurface, potentialSupportingElement.getTopSurface())
                        ) || (
                            this.isDirectlyAbove(potentialSupportingElement.getTopSurface(), bestOverlappingSurface)
                        )) {
                        bestOverlappingSurface = potentialSupportingElement.getTopSurface();
                    }
                }
            }, this);

            // Make sure that the best supporting surface isn't at the bottom of
            //   a stack, which can happen in cases where the model element being
            //   tested isn't directly above the best surface's center.
            if (bestOverlappingSurface) {
                while (bestOverlappingSurface.elementOnSurface !== null ) {
                    bestOverlappingSurface = bestOverlappingSurface.elementOnSurface.getTopSurface();
                }
            }

            return bestOverlappingSurface;
        },

        /**
         * Get the amount of overlap in the x direction between two horizontal surfaces.
         */
        getHorizontalOverlap: function(s1, s2) {
            var lowestMax  = Math.min(s1.xMax, s2.xMax);
            var highestMin = Math.max(s1.xMin, s2.xMin);
            return Math.max(lowestMax - highestMin, 0);
        },
        
        /**
         * Returns true if surface s1's center is above surface s2.
         */
        isDirectlyAbove: function(s1, s2) {
            return s2.containsX(s1.getCenterX()) && s1.yPos > s2.yPos;
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
            return this.air;
        },

        getBlockList: function() {
            return this.blocks;
        },

        getBeaker: function() {
            return this.beaker;
        }

    }, Constants.IntroSimulation);

    return IntroSimulation;
});

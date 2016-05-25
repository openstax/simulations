define(function(require) {

    'use strict';

    var PIXI = require('pixi');

                   require('common/v3/pixi/draw-arrow');
    var PixiView = require('common/v3/pixi/view');
    var Colors   = require('common/colors/colors');
    
    var Constants = require('constants');

    var CONTAINMENT_VESSEL_COLOR       = Colors.parseHex(Constants.ContainmentVesselView.CONTAINMENT_VESSEL_COLOR);
    var CONTAINMENT_VESSEL_HOVER_COLOR = Colors.parseHex(Constants.ContainmentVesselView.CONTAINMENT_VESSEL_HOVER_COLOR);
    var ARROW_COLOR                    = Colors.parseHex(Constants.ContainmentVesselView.ARROW_COLOR);

    var renderDebugGraphics = false;

    /**
     * A view that represents the containment vessel
     */
    var ContainmentVesselView = PixiView.extend({

        events: {
            'touchstart      .containmentVesselGraphics': 'dragStart',
            'mousedown       .containmentVesselGraphics': 'dragStart',
            'touchmove       .containmentVesselGraphics': 'drag',
            'mousemove       .containmentVesselGraphics': 'drag',
            'touchend        .containmentVesselGraphics': 'dragEnd',
            'mouseup         .containmentVesselGraphics': 'dragEnd',
            'touchendoutside .containmentVesselGraphics': 'dragEnd',
            'mouseupoutside  .containmentVesselGraphics': 'dragEnd',

            'mouseover       .containmentVesselGraphics': 'hover',
            'mouseout        .containmentVesselGraphics': 'unhover'
        },

        /**
         * Initializes the new ContainmentVesselView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;

            this.initGraphics();

            this.listenTo(this.model, 'change:radius',   this.draw);
            this.listenTo(this.model, 'change:enabled',  this.updateVisibility);
            this.listenTo(this.model, 'change:exploded', this.explodedChanged);

            this.updateVisibility();
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.containmentVesselGraphicsMask = new PIXI.Graphics();

            this.containmentVesselGraphics = new PIXI.Graphics();
            this.containmentVesselGraphics.mask = this.containmentVesselGraphicsMask;
            this.containmentVesselGraphics.buttonMode = true;

            this.containmentVesselHoverGraphics = new PIXI.Graphics();
            this.containmentVesselHoverGraphics.mask = this.containmentVesselGraphicsMask;
            this.containmentVesselHoverGraphics.visible = false;

            this.arrowContainer1 = this.createArrow();
            this.arrowContainer2 = this.createArrow();
            this.arrowContainer3 = this.createArrow();
            this.arrowContainer4 = this.createArrow();
            this.arrowContainer1.rotation = -ContainmentVesselView.ARROW_ANGLE;
            this.arrowContainer2.rotation =  ContainmentVesselView.ARROW_ANGLE;
            this.arrowContainer3.rotation = -ContainmentVesselView.ARROW_ANGLE - Math.PI / 2;
            this.arrowContainer4.rotation =  ContainmentVesselView.ARROW_ANGLE + Math.PI / 2;

            this.defaultLayer = new PIXI.Container();
            this.defaultLayer.addChild(this.containmentVesselGraphics);
            this.defaultLayer.addChild(this.containmentVesselGraphicsMask);
            this.defaultLayer.addChild(this.containmentVesselHoverGraphics);
            this.defaultLayer.addChild(this.arrowContainer1);
            this.defaultLayer.addChild(this.arrowContainer2);
            this.defaultLayer.addChild(this.arrowContainer3);
            this.defaultLayer.addChild(this.arrowContainer4);

            this.explosionLayer = new PIXI.Container();
            this.explosionLayer.visible = false;

            this.debugGraphics = new PIXI.Graphics();

            this.displayObject.addChild(this.defaultLayer);
            this.displayObject.addChild(this.explosionLayer);
            this.displayObject.addChild(this.debugGraphics);

            this.updateMVT(this.mvt);
        },

        createArrow: function() {
            var graphics = new PIXI.Graphics();
            var hoverGraphics = new PIXI.Graphics();
            hoverGraphics.visible = false;

            this.drawArrow(graphics, ARROW_COLOR);
            this.drawArrow(hoverGraphics, CONTAINMENT_VESSEL_HOVER_COLOR);

            var arrowGraphicsContainer = new PIXI.Container();
            arrowGraphicsContainer.addChild(graphics);
            arrowGraphicsContainer.addChild(hoverGraphics);

            var container = new PIXI.Container();
            container.addChild(arrowGraphicsContainer);

            container.showHoverGraphics = function() {
                graphics.visible = false;
                hoverGraphics.visible = true;
            };

            container.hideHoverGraphics = function() {
                graphics.visible = true;
                hoverGraphics.visible = false;
            };

            container.setRadius = function(radius) {
                arrowGraphicsContainer.x = radius;
            };

            return container;
        },

        drawArrow: function(graphics, color) {
            var length     = ContainmentVesselView.ARROW_LENGTH;
            var headWidth  = ContainmentVesselView.ARROW_HEAD_WIDTH;
            var headLength = ContainmentVesselView.ARROW_HEAD_LENGTH;
            var tailWidth  = ContainmentVesselView.ARROW_TAIL_WIDTH;
            var tailLength = length - headLength;

            graphics.beginFill(color, 1);
            
            // Draw the arrow tail in a special way
            var margin = 2; // Margin
            var sectionHeight = Math.floor(tailLength * 0.3);
            var minSectionHeight = 2;
            var falloff = 3;

            for (var x = tailLength - sectionHeight; x >= 0; x -= sectionHeight + margin) {
                graphics.drawRect(x, -tailWidth / 2, sectionHeight, tailWidth);
                sectionHeight = Math.max(sectionHeight - falloff, minSectionHeight);
            }

            // Draw the head the normal way
            graphics.drawArrow(tailLength, 0, tailLength + headLength, 0, tailWidth, headWidth, headLength);

            graphics.endFill();
        },

        draw: function() {
            var radius = this.getRadius();
            var thickness = this.getThickness();

            this.drawVessel(this.containmentVesselGraphics, CONTAINMENT_VESSEL_COLOR);
            this.drawVessel(this.containmentVesselHoverGraphics, CONTAINMENT_VESSEL_HOVER_COLOR);

            this.containmentVesselGraphics.hitArea = this.getRingHitArea(radius, thickness);

            this.drawMask(this.containmentVesselGraphicsMask);

            var x = radius + thickness + 6;
            this.arrowContainer1.setRadius(x);
            this.arrowContainer2.setRadius(x);
            this.arrowContainer3.setRadius(x);
            this.arrowContainer4.setRadius(x);
        },

        drawVessel: function(graphics, color) {
            var radius = this.getRadius();
            var thickness = this.getThickness();
            var halfThickness = thickness / 2;

            graphics.clear();
            graphics.lineStyle(thickness, color, 1);
            graphics.drawCircle(0, 0, radius + halfThickness);
        },

        drawMask: function(graphics) {
            var radius = this.getRadius();
            var thickness = this.getThickness();
            var apertureHeight = this.getApertureHeight();
            var halfApertureHeight = apertureHeight / 2;

            graphics.clear();
            graphics.beginFill();
            graphics.drawRect(-radius - thickness, -radius - thickness, (radius + thickness) * 2, radius + thickness - halfApertureHeight);
            graphics.drawRect(-radius - thickness, halfApertureHeight,  (radius + thickness) * 2, radius + thickness - halfApertureHeight);
            graphics.drawRect(0, -halfApertureHeight, radius + thickness, apertureHeight);
            graphics.endFill();
        },

        getRadius: function() {
            return this.mvt.modelToViewDeltaX(this.model.get('radius'));
        },

        getThickness: function() {
            return ContainmentVesselView.CONTAINMENT_VESSEL_THICKNESS;
        },

        getApertureHeight: function() {
            return this.mvt.modelToViewDeltaX(this.model.getApertureHeight());
        },

        getRingHitArea: function(radius, thickness) {
            var innerRadius = radius;
            var outerRadius = radius + thickness;
            
            // We need to find the angle between those points on the circle's
            //   circumference that correspond to the top and bottom of the
            //   container's aperture, relative to the center of the container.
            //   Once we've found that angle, we can use it to determine how
            //   many segments we should leave out.
            var apertureHeight = this.mvt.modelToViewDeltaY(this.model.getApertureHeight());
            var halfApertureHeight = apertureHeight / 2;
            var theta = Math.asin(halfApertureHeight / innerRadius) * 2;
            var defaultNumSegments = ContainmentVesselView.CONTAINMENT_VESSEL_RING_SEGMENTS;
            var radiansPerSegment = (Math.PI * 2) / defaultNumSegments;
            var numSegmentsToLeaveOut = Math.ceil((theta / radiansPerSegment) / 2) * 2;
            var numSegments = defaultNumSegments - numSegmentsToLeaveOut;
            var rotation = Math.PI + (numSegmentsToLeaveOut * radiansPerSegment) / 2;

            var startingX = -Math.sqrt(outerRadius * outerRadius - halfApertureHeight * halfApertureHeight);
            var startingY = -halfApertureHeight;
            var endingX = -Math.sqrt(innerRadius * innerRadius - halfApertureHeight * halfApertureHeight);
            var endingY = -halfApertureHeight;
            
            var i;
            var points = [];

            var graphics;
            if (renderDebugGraphics) {
                graphics = this.debugGraphics;
                graphics.clear();
                graphics.lineStyle(1, 0x0000FF, 1);
                graphics.moveTo(endingX, endingY);
                graphics.lineTo(startingX, startingY);
            }

            // Add the more exact points of intersection with the aperture
            points.push(startingX);
            points.push(startingY);

            // Create the outer ring of points
            for (i = 0; i <= numSegments; i++) {
                points.push(Math.cos(radiansPerSegment * i + rotation) * outerRadius);
                points.push(Math.sin(radiansPerSegment * i + rotation) * outerRadius);
                if (renderDebugGraphics) {
                    graphics.lineTo(
                        Math.cos(radiansPerSegment * i + rotation) * outerRadius,
                        Math.sin(radiansPerSegment * i + rotation) * outerRadius
                    );
                }
            }

            // Add the more exact points of intersection with the aperture
            points.push(startingX);
            points.push(-startingY);
            points.push(endingX);
            points.push(-endingY);

            if (renderDebugGraphics) {
                graphics.lineTo(startingX, -startingY);
                graphics.lineTo(endingX, -endingY);
            }

            // Create the inner ring of points, turning around and going the other way
            for (i = numSegments; i >= 0; i--) {
                points.push(Math.cos(radiansPerSegment * i + rotation) * innerRadius);
                points.push(Math.sin(radiansPerSegment * i + rotation) * innerRadius);
                if (renderDebugGraphics) {
                    graphics.lineTo(
                        Math.cos(radiansPerSegment * i + rotation) * innerRadius,
                        Math.sin(radiansPerSegment * i + rotation) * innerRadius
                    );
                }
            }

            // Then back to the beginning
            points.push(Math.cos(0 + rotation) * outerRadius);
            points.push(Math.sin(0 + rotation) * outerRadius);
            points.push(endingX);
            points.push(endingY);
            if (renderDebugGraphics) {
                graphics.lineTo(endingX, endingY);
            }

            return new PIXI.Polygon(points);
        },

        initExplosion: function() {
            // Clear out what's already there if it had previously exploded
            this.explosionLayer.removeChildren();

            var radius = this.getRadius();
            var sliceRadius = radius * 2;
            var minTheta = Math.PI / 6;
            var maxTheta = Math.PI / 3;
            var rotationalOffset = Math.PI;
            var cumulativeRadians = 0;

            while (cumulativeRadians < Math.PI * 2) {
                var theta = (cumulativeRadians > Math.PI * 1.7) ?
                    (Math.PI * 2) - cumulativeRadians + 0.05 :
                    Math.random() * (maxTheta - minTheta) + minTheta;

                var apertureMask = new PIXI.Graphics();
                this.drawMask(apertureMask);

                var graphics = new PIXI.Graphics();
                this.drawVessel(graphics, CONTAINMENT_VESSEL_COLOR);
                graphics.mask = apertureMask;
                
                var sliceMask = new PIXI.Graphics();
                sliceMask.beginFill();
                sliceMask.moveTo(0, 0);
                sliceMask.lineTo(
                    Math.cos(cumulativeRadians + rotationalOffset) * sliceRadius, 
                    Math.sin(cumulativeRadians + rotationalOffset) * sliceRadius
                );
                sliceMask.lineTo(
                    Math.cos(cumulativeRadians + theta + rotationalOffset) * sliceRadius, 
                    Math.sin(cumulativeRadians + theta + rotationalOffset) * sliceRadius
                );

                var offsetContainer = new PIXI.Container();
                offsetContainer.addChild(graphics);
                offsetContainer.addChild(apertureMask);
                offsetContainer.addChild(sliceMask);
                offsetContainer.mask = sliceMask;
                offsetContainer.x = -Math.cos(cumulativeRadians + theta / 2 + rotationalOffset) * radius;
                offsetContainer.y = -Math.sin(cumulativeRadians + theta / 2 + rotationalOffset) * radius;

                var container = new PIXI.Container();
                container.addChild(offsetContainer);
                container.x = -offsetContainer.x;
                container.y = -offsetContainer.y;
                container.vx = ContainmentVesselView.FRAGMENT_VELOCITY_RANGE.random();
                container.vy = ContainmentVesselView.FRAGMENT_VELOCITY_RANGE.random();
                container.spinRate = Math.random() * ContainmentVesselView.MAX_FRAGMENT_SPIN_RATE;

                if (container.x < 0)
                    container.vx *= -1;

                if (container.y < 0)
                    container.vy *= -1;

                if (Math.random() < 0.5)
                    container.spinRate *= -1;

                this.explosionLayer.addChild(container);

                cumulativeRadians += theta;
            }
        },

        dragStart: function(event) {
            this.dragging = true;

            this.showHoverGraphics();
        },

        drag: function(event) {
            if (this.dragging) {
                var dx = event.data.global.x - this.displayObject.x;
                var dy = event.data.global.y - this.displayObject.y;
                var distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
                var modelRadius = this.mvt.viewToModelDeltaX(distanceFromCenter);
                this.model.set('radius', modelRadius);
            }
        },

        dragEnd: function(event) {
            this.dragging = false;

            if (!this.hovering)
                this.hideHoverGraphics();
        },

        hover: function() {
            this.hovering = true;
            this.showHoverGraphics();
        },

        unhover: function() {
            this.hovering = false;
            if (!this.dragging)
                this.hideHoverGraphics();
        },

        showHoverGraphics: function() {
            this.containmentVesselHoverGraphics.visible = true;
            this.arrowContainer1.showHoverGraphics();
            this.arrowContainer2.showHoverGraphics();
            this.arrowContainer3.showHoverGraphics();
            this.arrowContainer4.showHoverGraphics();
        },

        hideHoverGraphics: function() {
            this.containmentVesselHoverGraphics.visible = false;
            this.arrowContainer1.hideHoverGraphics();
            this.arrowContainer2.hideHoverGraphics();
            this.arrowContainer3.hideHoverGraphics();
            this.arrowContainer4.hideHoverGraphics();
        },

        /**
         * Updates the model-view-transform and anything that relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            // Update position
            this.displayObject.x = this.mvt.modelToViewX(0);
            this.displayObject.y = this.mvt.modelToViewY(0);

            this.draw();
        },

        update: function(time, deltaTime, paused) {
            if (this.cooldownTimer > 0) {
                this.cooldownTimer -= deltaTime;

                // Check to see if it has cooled down
                if (this.cooldownTimer <= 0) {
                    this.cooldownTimer = 0;
                    this.showUnpressedButtonTexture();
                }
            }

            if (!paused && this.explosionLayer.children.length)
                this.updateExplosion(time, deltaTime);
        },

        updateExplosion: function(time, deltaTime) {
            var pieces = this.explosionLayer.children;

            for (var i = 0; i < pieces.length; i++) {
                pieces[i].x += pieces[i].vx * deltaTime;
                pieces[i].y += pieces[i].vy * deltaTime;
                pieces[i].rotation += pieces[i].spinRate * deltaTime;
            }
        },

        updateVisibility: function() {
            if (this.model.get('enabled'))
                this.displayObject.visible = true;
            else
                this.displayObject.visible = false;
        },

        explodedChanged: function(containmentVessel, exploded) {
            if (exploded) {
                this.defaultLayer.visible = false;
                this.initExplosion();
                this.explosionLayer.visible = true;    
            }
            else {
                this.defaultLayer.visible = true;
                this.explosionLayer.visible = false;  
            }
        }

    }, Constants.ContainmentVesselView);


    return ContainmentVesselView;
});
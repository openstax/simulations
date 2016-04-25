define(function(require) {

    'use strict';

    var PIXI = require('pixi');

                   require('common/v3/pixi/draw-arrow');
    var PixiView = require('common/v3/pixi/view');
    var Colors   = require('common/colors/colors');
    
    var Assets = require('assets');
    var Constants = require('constants');

    var CONTAINMENT_VESSEL_COLOR       = Colors.parseHex(Constants.ContainmentVesselView.CONTAINMENT_VESSEL_COLOR);
    var CONTAINMENT_VESSEL_HOVER_COLOR = Colors.parseHex(Constants.ContainmentVesselView.CONTAINMENT_VESSEL_HOVER_COLOR);
    var ARROW_COLOR                    = Colors.parseHex(Constants.ContainmentVesselView.ARROW_COLOR);

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
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.containmentVesselGraphics = new PIXI.Graphics();
            this.containmentVesselGraphics.buttonMode = true;
            this.containmentVesselGraphics.mask = new PIXI.Graphics();

            this.containmentVesselHoverGraphics = new PIXI.Graphics();
            this.containmentVesselHoverGraphics.visible = false;

            this.arrowContainer1 = this.createArrow();
            this.arrowContainer2 = this.createArrow();
            this.arrowContainer3 = this.createArrow();
            this.arrowContainer4 = this.createArrow();
            this.arrowContainer1.rotation = -ContainmentVesselView.ARROW_ANGLE;
            this.arrowContainer2.rotation =  ContainmentVesselView.ARROW_ANGLE;
            this.arrowContainer3.rotation = -ContainmentVesselView.ARROW_ANGLE - Math.PI / 2;
            this.arrowContainer4.rotation =  ContainmentVesselView.ARROW_ANGLE + Math.PI / 2;

            this.displayObject.addChild(this.containmentVesselGraphics);
            this.displayObject.addChild(this.containmentVesselGraphics.mask);
            this.displayObject.addChild(this.containmentVesselHoverGraphics);
            this.displayObject.addChild(this.arrowContainer1);
            this.displayObject.addChild(this.arrowContainer2);
            this.displayObject.addChild(this.arrowContainer3);
            this.displayObject.addChild(this.arrowContainer4);

            this.debugGraphics = new PIXI.Graphics();
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
            }

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
            var radius = this.mvt.modelToViewDeltaX(this.model.get('radius'));
            var thickness = ContainmentVesselView.CONTAINMENT_VESSEL_THICKNESS;
            var halfThickness = thickness / 2;

            var graphics = this.containmentVesselGraphics;
            graphics.clear();
            graphics.lineStyle(thickness, CONTAINMENT_VESSEL_COLOR, 1);
            graphics.drawCircle(0, 0, radius);
            graphics.hitArea = this.getRingHitArea(radius, thickness);

            var hoverGraphics = this.containmentVesselHoverGraphics;
            hoverGraphics.clear();
            hoverGraphics.lineStyle(thickness, CONTAINMENT_VESSEL_HOVER_COLOR, 1);
            hoverGraphics.drawCircle(0, 0, radius);

            var mask = this.containmentVesselGraphics.mask;

            var x = radius + halfThickness + 6;
            this.arrowContainer1.setRadius(x);
            this.arrowContainer2.setRadius(x);
            this.arrowContainer3.setRadius(x);
            this.arrowContainer4.setRadius(x);
        },

        getRingHitArea: function(radius, thickness) {
            var halfThickness = thickness / 2;
            var innerRadius = radius - halfThickness;
            var outerRadius = radius + halfThickness;
            var twoPi = Math.PI * 2;
            var numSegments = ContainmentVesselView.CONTAINMENT_VESSEL_RING_SEGMENTS;
            var i;
            var points = [];

            // var graphics = this.debugGraphics;
            // graphics.clear();
            // graphics.lineStyle(1, 0xFFFF00, 1);
            // graphics.moveTo(
            //     Math.cos(0) * outerRadius,
            //     Math.sin(0) * outerRadius
            // );

            // Create the outer ring of points
            for (i = 0; i <= numSegments; i++) {
                points.push(Math.cos(twoPi * (i / numSegments)) * outerRadius);
                points.push(Math.sin(twoPi * (i / numSegments)) * outerRadius);
                // graphics.lineTo(
                //     Math.cos(twoPi * (i / numSegments)) * outerRadius,
                //     Math.sin(twoPi * (i / numSegments)) * outerRadius
                // );
            }
            // Create the inner ring of points, turning around and going the other way
            for (i = numSegments; i >= 0; i--) {
                points.push(Math.cos(twoPi * (i / numSegments)) * innerRadius);
                points.push(Math.sin(twoPi * (i / numSegments)) * innerRadius);
                // graphics.lineTo(
                //     Math.cos(twoPi * (i / numSegments)) * innerRadius,
                //     Math.sin(twoPi * (i / numSegments)) * innerRadius
                // );
            }

            // Then back to the beginning
            points.push(Math.cos(0) * outerRadius);
            points.push(Math.sin(0) * outerRadius);
            // graphics.lineTo(
            //     Math.cos(0) * outerRadius,
            //     Math.sin(0) * outerRadius
            // );

            return new PIXI.Polygon(points);
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

        update: function(time, deltaTime) {
            if (this.cooldownTimer > 0) {
                this.cooldownTimer -= deltaTime;

                // Check to see if it has cooled down
                if (this.cooldownTimer <= 0) {
                    this.cooldownTimer = 0;
                    this.showUnpressedButtonTexture();
                }
            }
        },

        explodedChanged: function(containmentVessel, exploded) {

        }

    }, Constants.ContainmentVesselView);


    return ContainmentVesselView;
});
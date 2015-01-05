define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var PixiView       = require('common/pixi/view');
    var Vector2        = require('common/math/vector2');
    var PiecewiseCurve = require('common/math/piecewise-curve');

    var Constants = require('constants');

    /**
     * A view that represents an element model
     */
    var LightRayView = PixiView.extend({

        /**
         *
         */
        initialize: function(options) {
            options = _.extend({
                start: new Vector2(),              // Start of the light ray
                end:   new Vector2(),              // End of the light ray
                color: '#fff',                     // Ray color
                lineWidth: LightRayView.LINE_WIDTH // Width of the ray in pixels
            }, options);

            this.start = options.start;
            this.end = options.end;
            this.color = options.color;
            this.lineWidth = options.lineWidth;
            this.padding = this.lineWidth / 2;

            this.lightAbsorbingShapes = [];

            // Line representing the ray for testing intersections
            this.ray = new PiecewiseCurve()
                .moveTo(this.start)
                .lineTo(this.end)
                .close();

            this.initBounds();
            this.initGraphics();

            this.updateLineSegments();
        },

        initBounds: function() {
            /* I can actually just use my PieceWise curve of the line to 
             *   calculate the bounds and origin of the bounding box that 
             *   I'll use for the canvas as well as for translating points 
             *   to be relative to the canvas.
             */
            this.bounds = this.ray.getBounds();
            this.origin = new Vector2(this.bounds.x - this.padding, this.bounds.y - this.padding);
        },

        initGraphics: function() {
            this.displayObject.x = this.origin.x;
            this.displayObject.y = this.origin.y;

            var canvas = document.createElement('canvas');
            canvas.width  = this.bounds.w + this.padding * 2;
            canvas.height = this.bounds.h + this.padding * 2;
            var ctx = canvas.getContext('2d');

            var canvasSprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(canvas));
            if (this.start.x > this.end.x)
                canvasSprite.anchor.x = 1;
            if (this.start.y > this.end.y)
                canvasSprite.anchor.y = 1;

            this.displayObject.addChild(canvasSprite);
            this.graphicsContext = ctx;
            this.canvasSprite = canvasSprite;
        },

        addLightAbsorbingShape: function(lightAbsorbingShape) {
            this.lightAbsorbingShapes.push(lightAbsorbingShape);
            this.listenTo(lightAbsorbingShape, 'change:lightAbsorptionCoefficient', this.updateLineSegments);
        },

        removeLightAbsorbingShape: function(lightAbsorbingShape) {
            this.stopListening(lightAbsorbingShape);
            this.lightAbsorbingShapes = _.without(this.lightAbsorbingShapes, lightAbsorbingShape);
            this.updateLineSegments();
        },

        updateLineSegments: function() {
            // The points that define the line segments that make up the ray as well as the fade coefficients
            var points = [];

            // Add the initial start and end points
            points.push({ point: this.start, fade: LightRayView.FADE_COEFFICIENT_IN_AIR });
            points.push({ point: this.end,   fade: 0 });

            // Add the entry and exit points for each shape
            var lightAbsorbingShape;
            for (var i = 0; i < this.lightAbsorbingShapes.length; i++) {
                lightAbsorbingShape = this.lightAbsorbingShapes[i];
                var entryPoint = this.calculateShapeEntryPoint(lightAbsorbingShape);
                if (entryPoint) {
                    points.push({ point: entryPoint, fade: lightAbsorbingShape.lightAbsorptionCoefficient });
                    var exitPoint = this.calculateShapeExitPoint(lightAbsorbingShape);
                    if (exitPoint) {
                        points.push({ point: exitPoint, fade: LightRayView.FADE_COEFFICIENT_IN_AIR });
                    }
                }
            }

            // Sort the list by distance from the origin
            var startPoint = this.start;
            points.sort(function(a, b) {
                return a.point.distance(startPoint) - b.point.distance(startPoint);
            });

            // Draw the segments that comprise the line
            this.clearGraphics();
            var opacity = 1;
            var start;
            var end;
            var fade;
            for (var j = 0; j < points.length - 1; j++) {
                start   = points[i].point;
                end     = points[i + 1].point;
                fade    = points[i].fade;
                opacity = this.drawLine(start, end, opacity, fade);
            }
        },

        calculateShapeEntryPoint: function(lightAbsorbingShape) {
            var shapeRect = lightAbsorbingShape.getBounds();
            var entryPoint = null;
            if (this.ray.intersects(shapeRect)) {
                var boundsEntryPoint = this.calculateRectangleEntryPoint(shapeRect);
                if (boundsEntryPoint === null)
                    return null;

                var boundsExitPoint = this.calculateRectangleExitPoint(shapeRect);
                var searchEndPoint = (boundsExitPoint === null) ? this.end : boundsExitPoint;

                // PhET: Search linearly for edge of the shape.  BIG HAIRY NOTE - This
                //   will not work in all cases.  It worked for the coarse shapes
                //   and rough bounds needed for this simulation.  Don't reuse if you
                //   need good general edge finding.
                // Patrick: and then I modified it to use scaled unit vectors instead of angles
                var directionVector = this.end.clone().sub(this.start);
                var testPoint = new Vector2();
                var incrementalDistance = boundsEntryPoint.distance(searchEndPoint) / LightRayView.SEARCH_ITERATIONS;
                for (var i = 0; i < LightRayView.SEARCH_ITERATIONS; i++) {
                    testPoint
                        .set(boundsEntryPoint)
                        .add(directionVector.normalize().scale(incrementalDistance * i));
                    if (lightAbsorbingShape.contains(testPoint)) {
                        entryPoint = testPoint;
                        break;
                    }
                }
            }
            return entryPoint;
        },

        calculateShapeExitPoint: function(lightAbsorbingShape) {

        },

        calculateRectangleEntryPoint: function(rect) {
            // var intersectingPoints
        },

        calculateRectangleExitPoint: function(rect) {

        },

        calculateRectangleIntersectingPoints: function(rect) {

        },

        toLocal: function(coordinate) {
            return coordinate.clone().sub(this.origin);
        },

        clearGraphics: function() {
            this.graphicsContext.clearRect(0, 0, this.canvasSprite.width, this.canvasSprite.height);
        },

        drawLine: function(start, end, startOpacity, fadeCoefficient) {
            // Convert to local coordinates
            start = this.toLocal(start);
            end   = this.toLocal(end);

            if (fadeCoefficient < 0)
                throw 'LightRayView: Cannot have a negative fade coefficient.';

            // Figure out what our gradient should be depending on the starting opacity and fade coefficient
            var gradient;
            var opacityAtEndPoint = startOpacity * Math.pow(Math.E, -fadeCoefficient * start.distance(end));
            if (opacityAtEndPoint === 0) {
                // Theirs had us creating a vector and rotating it to be the same angle as this, but I'm just going to scale a unit vector
                var directionVector = end.clone().sub(start).normalize();
                // I'm guessing I need to multiply my opacity (0-1) by 255 here because the original equation is based off of values from 0-255
                var zeroIntensityDistance = (Math.log(startOpacity * 255) - Math.log(0.4999)) / fadeCoefficient;
                var zeroIntensityPoint = start.clone().add(directionVector.scale(zeroIntensityDistance));

                gradient = this.graphicsContext.createLinearGradient(start.x, start.y, zeroIntensityPoint.x, zeroIntensityPoint.y);
            }
            else {
                gradient = this.graphicsContext.createLinearGradient(start.x, start.y, end.x, end.y);
            }
            
            gradient.addColorStop(startOpacity,      this.color);
            gradient.addColorStop(opacityAtEndPoint, this.color);
            
            // Draw the line
            this.graphicsContext.lineWidth = this.lineWidth;
            this.graphicsContext.strokeStyle = gradient;

            this.graphicsContext.moveTo(start.x, start.y);
            this.graphicsContext.lineTo(end.x,   end.y);

            this.graphicsContext.stroke();

            return opacityAtEndPoint;
        }

    }, Constants.LightRayView);

    return LightRayView;
});
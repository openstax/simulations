define(function(require) {

    'use strict';

    var _ = require('underscore');
    var PIXI = require('pixi');
    
    var PixiView = require('common/pixi/view');
    var Colors   = require('common/colors/colors');
    var Vector2  = require('common/math/vector2');

    /**
     * A view that represents an element model
     */
    var BeltView = PixiView.extend({

        /**
         *
         */
        initialize: function(options) {
            options = _.extend({
                lineWidth: 3,
                lineColor: '#000',
                lineAlpha: 1
            }, options);

            this.mvt = options.mvt;

            this.lineWidth = options.lineWidth;
            this.lineColor = Colors.parseHex(options.lineColor);
            this.lineAlpha = options.lineAlpha;

            this.initGraphics();

            this.listenTo(this.model, 'change:visible', this.updateVisibility);
        },

        initGraphics: function() {
            var solidContainer = new PIXI.DisplayObjectContainer();
            this.solid = new PIXI.Graphics();
            this.mask  = new PIXI.Graphics();

            solidContainer.mask = this.mask;
            solidContainer.addChild(this.solid);

            this.displayObject.addChild(solidContainer);
            this.displayObject.addChild(this.mask);

            this.draw();
        },

        /**
         * The algorithm used to calculate the values necessary to draw these
         *   lines came from this blog post by Andy G:
         *
         *   https://gieseanw.wordpress.com/2012/09/12/finding-external-tangent-points-for-two-circles/
         */
        draw: function() {
            var center1 = this.mvt.modelToView(this.model.get('wheel1Center')).clone();
            var center2 = this.mvt.modelToView(this.model.get('wheel2Center')).clone();

            var radius1 = this.mvt.modelToViewDeltaX(this.model.get('wheel1Radius'));
            var radius2 = this.mvt.modelToViewDeltaX(this.model.get('wheel2Radius'));

            /* This algorithm relies on radius1 being greater than
             *   radius2, so we need to flip it if it's not and
             *   remember if it's flipped so we can flip it back
             *   when it's time to draw it.
             */
            var flipped = radius1 < radius2;
            if (flipped) {
                var swap;
                swap = center2;
                center2 = center1;
                center1 = swap;

                swap = radius2;
                radius2 = radius1;
                radius1 = swap;
            }

            var d;     // Distance between the two centers (line D)
            var h;     // Length of tangent line, which is also the same as a leg of
                       //   the right triangle created by the line extending from the
                       //   center of circle 1 toward its tangent point for a distance
                       //   of (radius1 - radius2) and the line D and going back to
                       //   the center of circle 2.
            var y;     // The length of the line Y that goes from circle 1's tangent
                       //   point to the center of circle 2 to circle 2's tangent
                       //   point and back.
            var theta; // The angle from the line between the two centers to the
                       //   tangent point for circle 1.  The corresponding angle for
                       //   circle 2 would be theta's supplementary angle.

            d = center1.distance(center2);
            h = Math.sqrt(d * d + Math.pow(radius1 - radius2, 2)); // Pythagorean theorem
            y = Math.sqrt(h * h + radius2 * radius2) // More Pythagorean theorem
            theta = Math.acos((radius1 * radius1 + d * d - y * y) / (2 * radius1 * d)); // Law of cosines

            // Now that we have our numbers, flip it back
            if (flipped) {
                var swap;
                swap = center2;
                center2 = center1;
                center1 = swap;

                swap = radius2;
                radius2 = radius1;
                radius1 = swap;
            }

            // Now we need to use those numbers to derrive useful points and angles with which to draw

            // Get a vector representing the direction of center1 to center2
            var directionVector = new Vector2(center2).sub(center1);

            // Use the direction vector as a starting point and rotate it by theta to get
            //   a vector pointing to the tangent point, then normalize it and scale it so
            //   it's the length of radius1, and offset it by our center point, and that 
            //   will be our first tangent point.
            var c1TangentPointA = directionVector.clone().rotate(-theta).normalize().scale(radius1).add(center1);
            var c1TangentPointB = directionVector.clone().rotate( theta).normalize().scale(radius1).add(center1);

            var c1PaddedTangentPointA = directionVector.clone().rotate(-theta).normalize().scale(radius1 + this.lineWidth).add(center1);
            var c1PaddedTangentPointB = directionVector.clone().rotate( theta).normalize().scale(radius1 + this.lineWidth).add(center1);

            // And for the second circle, we could go the opposite way and then find the
            //   supplementary angle of theta or just do the exact same thing with center2.
            var c2TangentPointA = directionVector.clone().rotate(-theta).normalize().scale(radius2).add(center2);
            var c2TangentPointB = directionVector.clone().rotate( theta).normalize().scale(radius2).add(center2);

            var c2PaddedTangentPointA = directionVector.clone().rotate(-theta).normalize().scale(radius2 + this.lineWidth).add(center2);
            var c2PaddedTangentPointB = directionVector.clone().rotate( theta).normalize().scale(radius2 + this.lineWidth).add(center2);

            // Start drawing
            this.solid.clear();
            this.mask.clear();

            this.solid.beginFill(this.lineColor, this.lineAlpha);
            this.mask.beginFill(0xFFFFFF, 1);

            // Draw circles
            this.solid.drawCircle(center1.x, center1.y, radius1 + this.lineWidth);
            this.solid.drawCircle(center2.x, center2.y, radius2 + this.lineWidth);
            this.mask.drawCircle(center1.x, center1.y, radius1);
            this.mask.drawCircle(center2.x, center2.y, radius2);

            // Fill between the two circles
            this.solid.moveTo(c1PaddedTangentPointA.x, c1PaddedTangentPointA.y);
            this.solid.lineTo(c2PaddedTangentPointA.x, c2PaddedTangentPointA.y);
            this.solid.lineTo(c2PaddedTangentPointB.x, c2PaddedTangentPointB.y);
            this.solid.lineTo(c1PaddedTangentPointB.x, c1PaddedTangentPointB.y);
            this.solid.lineTo(c1PaddedTangentPointA.x, c1PaddedTangentPointA.y);

            this.mask.moveTo(c1TangentPointA.x, c1TangentPointA.y);
            this.mask.lineTo(c2TangentPointA.x, c2TangentPointA.y);
            this.mask.lineTo(c2TangentPointB.x, c2TangentPointB.y);
            this.mask.lineTo(c1TangentPointB.x, c1TangentPointB.y);
            this.mask.lineTo(c1TangentPointA.x, c1TangentPointA.y);

            this.solid.endFill();
            this.mask.endFill();
        },

        updateVisibility: function(model, visible) {
            this.displayObject.visible = visible;
        }

    });

    return BeltView;
});
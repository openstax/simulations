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
            this.graphics = new PIXI.Graphics();
            this.displayObject.addChild(this.graphics);

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

            var origin = new PIXI.Graphics();
            origin.beginFill(0x0000FF, 1);
            origin.drawCircle(center1.x, center1.y, 3);
            origin.endFill();
            this.displayObject.addChild(origin);

            origin = new PIXI.Graphics();
            origin.beginFill(0x0000FF, 1);
            origin.drawCircle(center2.x, center2.y, 3);
            origin.endFill();
            this.displayObject.addChild(origin);

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
            var thetaS;// Theta's supplementary angle

            d = center1.distance(center2);
            h = Math.sqrt(d * d + Math.pow(radius1 - radius2, 2)); // Pythagorean theorem
            y = Math.sqrt(h * h + radius2 * radius2) // More Pythagorean theorem
            theta = Math.acos((radius1 * radius1 + d * d - y * y) / (2 * radius1 * d)); // Law of cosines
            thetaS = Math.PI - theta;

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

            // Need to account for the width of the line in some cases
            var hlw = this.lineWidth / 2; // half line width
            

            // Use the direction vector as a starting point and rotate it by theta to get
            //   a vector pointing to the tangent point, then normalize it and scale it so
            //   it's the length of radius1, and offset it by our center point, and that 
            //   will be our first tangent point.
            var c1TangentPointA = directionVector.clone().rotate(-thetaS).normalize().scale(radius1 + hlw).add(center1);
            var c1TangentPointB = directionVector.clone().rotate( thetaS).normalize().scale(radius1 + hlw).add(center1);
           

            // And for the second circle, we could go the opposite way and then find the
            //   supplementary angle of theta or just do the exact same thing with center2.
            var c2TangentPointA = directionVector.clone().rotate(-thetaS).normalize().scale(radius2 + hlw).add(center2);
            var c2TangentPointB = directionVector.clone().rotate( thetaS).normalize().scale(radius2 + hlw).add(center2);

            // origin = new PIXI.Graphics();
            // origin.beginFill(0x00FFFF, 1);
            // origin.drawCircle(c1TangentPointA.x, c1TangentPointA.y, 3);
            // origin.endFill();
            // this.displayObject.addChild(origin);

            // origin = new PIXI.Graphics();
            // origin.beginFill(0x00FFFF, 1);
            // origin.drawCircle(c1TangentPointB.x, c1TangentPointB.y, 3);
            // origin.endFill();
            // this.displayObject.addChild(origin);

            // origin = new PIXI.Graphics();
            // origin.beginFill(0x00FFFF, 1);
            // origin.drawCircle(c2TangentPointA.x, c2TangentPointA.y, 3);
            // origin.endFill();
            // this.displayObject.addChild(origin);

            // origin = new PIXI.Graphics();
            // origin.beginFill(0x00FFFF, 1);
            // origin.drawCircle(c2TangentPointB.x, c2TangentPointB.y, 3);
            // origin.endFill();
            // this.displayObject.addChild(origin);

            // Angle between line connecting centers and the x-axis.
            var directionVectorAngle = -Math.atan2(directionVector.y, directionVector.x); 

            // There are two arcs that wrap the edges of the two circles, so I need to 
            //   know the start and end angle for each relative to 0, which in this
            //   case would be the 3 o'clock position (positive x-axis).
            
            var arc1StartAngle = thetaS - directionVectorAngle;
            var arc1EndAngle = arc1StartAngle + Math.PI * 2 - (thetaS * 2);
            var arc2StartAngle = theta - directionVectorAngle + Math.PI * 2 - (theta * 2);
            var arc2EndAngle = thetaS - directionVectorAngle;

            // Start drawing
            this.graphics.clear();
            this.graphics.lineStyle(this.lineWidth, this.lineColor, this.lineAlpha);

            // Draw belt shape
            this.graphics.moveTo(c1TangentPointB.x, c1TangentPointB.y);
            this.graphics.arc(center1.x, center1.y, radius1 + hlw, arc1StartAngle, arc1EndAngle, false); 
            this.graphics.lineTo(c2TangentPointA.x, c2TangentPointA.y);
            this.graphics.arc(center2.x, center2.y, radius2 + hlw, arc2StartAngle, arc2EndAngle, false); 
            this.graphics.lineTo(c1TangentPointB.x, c1TangentPointB.y);
            this.graphics.arc(center1.x, center1.y, radius1 + hlw, arc1StartAngle + Math.PI / 32, arc1EndAngle, false); 
        },

        updateVisibility: function(model, visible) {
            this.displayObject.visible = visible;
        }

    });

    return BeltView;
});
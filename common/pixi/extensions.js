define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PiecewiseCurve = require('../math/piecewise-curve');
    var Colors = require('../colors/colors');


    var doNothing = function() {};
    var beginPath = function(graphics) {
        graphics.beginPath();
    };
    var closePath = function(graphics) {
        graphics.closePath();
    };
    var strokeAndFill = function(graphics, stroke, fill) {
        if (fill)
            graphics.fill();
        if (stroke)
            graphics.stroke();
    };

    /**
     * Draws a piecewise curve onto a Context2D, filling and stroking if asked
     */
    PIXI.drawPiecewiseCurve = function(ctx, curve, xShift, yShift, fill, stroke) {
        drawPiecewiseCurve(ctx, curve, xShift, yShift, fill, stroke, beginPath, strokeAndFill, closePath);
    };

    PIXI.Graphics.prototype.drawPiecewiseCurve = function(curve, xShift, yShift) {
        if (xShift === undefined)
            xShift = 0;
        if (yShift === undefined)
            yShift = 0;
        drawPiecewiseCurve(this, curve, xShift, yShift, false, false, doNothing, doNothing, doNothing);
    };

    var drawPiecewiseCurve = function(graphics, curve, xShift, yShift, fill, stroke, beginPath, strokeAndFill, closePath) {
        var x, y;
        var cp1x, cp1y;
        var cp2x, cp2y;
        var pathStarted = false;
        var pos = 0;
        while (pos < curve.index) {
            switch (curve.types[pos]) {
                case PiecewiseCurve.SEG_MOVETO:
                    if (pathStarted) { 
                        // Draw and close old path
                        strokeAndFill(graphics, stroke, fill);
                        closePath(graphics);
                    }
                    x = curve.xPoints[pos]   + xShift;
                    y = curve.yPoints[pos++] + yShift;
                    pathStarted = true;

                    beginPath(graphics);
                    graphics.moveTo(x, y);
                    break;
                case PiecewiseCurve.SEG_CLOSE:
                    pos++;
                    pathStarted = false;

                    closePath(graphics);
                    strokeAndFill(graphics, stroke, fill);
                    break;
                case PiecewiseCurve.SEG_LINETO:
                    x = curve.xPoints[pos]   + xShift;
                    y = curve.yPoints[pos++] + yShift;

                    graphics.lineTo(x, y);
                    break;
                case PiecewiseCurve.SEG_QUADTO:
                    cp1x = curve.xPoints[pos]   + xShift;
                    cp1y = curve.yPoints[pos++] + yShift;
                    x    = curve.xPoints[pos]   + xShift;
                    y    = curve.yPoints[pos++] + yShift;

                    graphics.quadraticCurveTo(cp1x, cp1y, x, y);
                    break;
                case PiecewiseCurve.SEG_CUBICTO:
                    cp1x = curve.xPoints[pos]   + xShift;
                    cp1y = curve.yPoints[pos++] + yShift;
                    cp2x = curve.xPoints[pos]   + xShift;
                    cp2y = curve.yPoints[pos++] + yShift;
                    x    = curve.xPoints[pos]   + xShift;
                    y    = curve.yPoints[pos++] + yShift;

                    graphics.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
                    break;
            }
        }

        if (pathStarted) {
            // It was opened but never closed, so draw it
            strokeAndFill(graphics, stroke, fill);
        }
    };


    /**
     * Creates a textured Sprite and masks it according to the polygon
     *   created by the specified masking points. Returns a containing
     *   DisplayObjectContainer that holds the sprite and the mask.
     */
    PIXI.createTexturedPolygonFromPoints = function(maskingPoints, texture) {
        /*
         * The masking points are not necessarily within the bounds of 
         *   the texture, so we need to calculate the bounding box for
         *   the masking points, scale the texture to fit those bounds,
         *   create a masking shape with the points, and then shift 
         *   the sprite that holds the texture to the origin of the 
         *   bounding box of the masking points to place it in its 
         *   rightful location.
         */

        // Calculate the bounding box for the masking points
        var curve = PiecewiseCurve.fromPoints(maskingPoints);
        var bounds = curve.getBounds();

        // Ratio for scaling the texture to the size of the bounds
        var xScale = bounds.w / texture.width;
        var yScale = bounds.h / texture.height;

        // Create the mask shape
        var mask = new PIXI.Graphics();
        mask.lineStyle(0);
        mask.beginFill(0x000000, 1);
        

        // Draw the masking points shifted
        mask.moveTo(maskingPoints[0].x, maskingPoints[0].y);
        for (var i = 1; i < maskingPoints.length; i++)
            mask.lineTo(maskingPoints[i].x, maskingPoints[i].y);

        // Create a sprite with the texture, scaled to the size of the bounds
        var sprite = new PIXI.Sprite(texture);
        sprite.scale.x = xScale;
        sprite.scale.y = yScale;

        // Apply the mask
        sprite.mask = mask;

        // Shift the sprite back to where the masking points are supposed to be
        sprite.x = bounds.x;
        sprite.y = bounds.y;

        // Put them both in a wrapping DisplayObjectContainer
        var wrapper = new PIXI.DisplayObjectContainer();
        wrapper.addChild(sprite);
        wrapper.addChild(mask);

        return wrapper;
    };


    /**
     * Creates a Sprite that has a polygon created by connecting the 
     *   specified points filled in with the specified color.
     */
    PIXI.createColoredPolygonFromPoints = function(points, color, alpha) {
        var style = {
            fillStyle: color,
            fillAlpha: alpha
        };

        var curve = PiecewiseCurve.fromPoints(points);

        return PIXI.Sprite.fromPiecewiseCurve(curve, style);
    };


    /**
     * Creates a sprite from a PiecewiseCurve object and styling
     *   information.  Determines the bounds of the curve, makes
     *   a canvas that will fit the curve, shifts the points so
     *   they are positioned inside the canvas, paints the curve
     *   onto the canvas with the styling info specified, makes
     *   a texture from the canvas, applies it to a sprite, and
     *   finally shifts the sprite's anchor to undo the shift
     *   performed on the points and returns the sprite.
     */
    PIXI.Sprite.fromPiecewiseCurve = function(curve, style) {
        if (curve.size() === 0)
            return new PIXI.DisplayObject();

        style = _.extend({
            lineWidth: 1,
            lineJoin: 'miter',
            fillAlpha: 1
        }, style);

        // Determine the bounds for all the points
        var bounds = curve.getBounds();

        // Determine if we need to shift the points to fit within the bounds
        var xShift = 0 - bounds.x;
        var yShift = 0 - bounds.y;

        xShift += style.lineWidth;
        yShift += style.lineWidth;

        // Draw it on a canvas
        var canvas = document.createElement('canvas');
        canvas.width  = bounds.w + (2 * style.lineWidth);
        canvas.height = bounds.h + (2 * style.lineWidth);

        var ctx = canvas.getContext('2d');

        var stroke = false;
        if (style.strokeStyle !== undefined) {
            ctx.lineWidth   = style.lineWidth;
            ctx.strokeStyle = style.strokeStyle;
            ctx.lineJoin    = style.lineJoin;
            stroke = true;
        }

        var fill = false;
        if (typeof style.fillStyle == 'function') {
            style.fillStyle(ctx, canvas.width, canvas.height);
            ctx.globalAlpha = style.fillAlpha;
            fill = true;
        }
        else if (style.fillStyle !== undefined) {
            ctx.fillStyle   = style.fillStyle;
            ctx.globalAlpha = style.fillAlpha;
            fill = true;
        }
        
        PIXI.drawPiecewiseCurve(ctx, curve, xShift, yShift, fill, stroke);

        // Create the sprite and shift the anchor proportionally to the shift
        var sprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(canvas));
        sprite.anchor.x = xShift / sprite.width;
        sprite.anchor.y = yShift / sprite.height;

        return sprite;
    };

    
    /**
     * Creates a PiecewiseCurve from an array of point arrays and
     *   calls PIXI.Sprite.fromPiecewiseCurve to return a sprite.
     */
    PIXI.Sprite.fromPointArrays = function(pointArrays, style) {
        if (pointArrays.length === 0)
            return new PIXI.DisplayObject();

        if (!_.isArray(pointArrays[0]))
            pointArrays = [ pointArrays ];

        var curve = PiecewiseCurve.fromPointArrays(pointArrays);
        return PIXI.Sprite.fromPiecewiseCurve(curve, style);
    };


    /**
     * Recursive function that should calculate the position of
     *   the display object relative to the stage by applying all
     *   transforms through the hierarchy.
     */
    PIXI.DisplayObject.prototype.getGlobalPosition = function() {
        if (this.parent instanceof PIXI.Stage)
            return this.position;
        else
            return this.toGlobal(this.parent.getGlobalPosition());
    };

    /**
     * Creates a texture of a circle with a radial gradient.  The
     *   first radius (r1) is the radius of the solid part of the
     *   particle.  (If the desired effect is a particle whose 
     *   color fades from the center linearly until it becomes
     *   transparent at the outer edge, r1 should be 0.)  The
     *   second radius (r2) is the outer extend of the gradient--
     *   the point at which the color will be transparent.
     */
    PIXI.Texture.generateRoundParticleTexture = function(r1, r2, color) {
        var rgba = Colors.toRgba(color, true);

        var color1 = 'rgba(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ',1)';
        var color2 = 'rgba(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ',0)';

        return PIXI.Texture.generateCircleTexture(r2, r1, r2, color1, color2);
    };

    /**
     * Generates a texture of a circle with a radial gradient and
     *   optionally an outline.  The first radius (radius) is the
     *   radius of the circle texture and the radius at which the
     *   optional outline is painted. The first color fills the
     *   circle solidly from the center to the gradient's inner
     *   radius (r1) and then blends into the second color until
     *   it reaches the gradient's outer radius (r2), after which
     *   the second color will be solid until the edge of the
     *   circle is reached (radius). The parameters r1 and r2 are
     *   optional.  If they are not specified, the texture will
     *   be simply a solid circle of one color.
     *
     * @params radius, r1, r2, color1, color2, outlineWidth, outlineColor
     * @params radius, color, outlineWidth, outlineColor
     */
    PIXI.Texture.generateCircleTexture = function(radius, r1, r2, color1, color2, outlineWidth, outlineColor) {
        if (radius <= 0)
            throw 'Outer radius cannot be zero or a negative value.';

        if (_.isString(r1)) {
            // They have specified [radius, color, outlineWidth, outlineColor]
            color1 = r1;
            outlineWidth = r2;
            outlineColor = color1;
            r1 = undefined;
            r2 = undefined;
        }

        if (outlineWidth === undefined)
            outlineWidth = 0;

        // We need to offset everything by half of the outline width
        //   because we need to make the canvas big enough to paint
        //   the outline.
        var how = outlineWidth / 2; // half outline width

        // Draw on a canvas and then use it as a texture for our particles
        var canvas = document.createElement('canvas');
        canvas.width  = radius * 2 + outlineWidth;
        canvas.height = radius * 2 + outlineWidth;

        var ctx = canvas.getContext('2d');

        if (r1 !== undefined && r2 !== undefined) {
            var gradient = ctx.createRadialGradient(radius + how, radius + how, r1, radius + how, radius + how, r2);
            gradient.addColorStop(0, color1);
            gradient.addColorStop(1, color2);

            ctx.fillStyle = gradient;    
        }
        else {
            ctx.fillStyle = color1;
        }
        
        ctx.beginPath();
        ctx.arc(radius + how, radius + how, radius, 0, 2 * Math.PI, false);
        ctx.fill();

        if (outlineWidth) {
            if (outlineColor === undefined)
                outlineColor = '#000';

            ctx.strokeStyle = outlineColor;
            ctx.lineWidth = outlineWidth;

            
            ctx.stroke();
        }

        return new PIXI.Texture.fromCanvas(canvas);
    };


    return PIXI;
});
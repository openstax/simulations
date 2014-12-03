define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PiecewiseCurve = require('../math/piecewise-curve');

    /**
     * Draws a piecewise curve onto a graphics context, filling if asked
     */
    PIXI.drawPiecewiseCurve = function(ctx, curve, xShift, yShift, fill, stroke) {
        var strokeAndFill = function() {
            if (fill)
                ctx.fill();
            if (stroke)
                ctx.stroke();
        };

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
                        strokeAndFill();
                        ctx.closePath();
                    }
                    x = curve.xPoints[pos]   + xShift;
                    y = curve.yPoints[pos++] + yShift;
                    pathStarted = true;

                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    break;
                case PiecewiseCurve.SEG_CLOSE:
                    pos++;
                    pathStarted = false;

                    ctx.closePath();
                    strokeAndFill();
                    break;
                case PiecewiseCurve.SEG_LINETO:
                    x = curve.xPoints[pos]   + xShift;
                    y = curve.yPoints[pos++] + yShift;

                    ctx.lineTo(x, y);
                    break;
                case PiecewiseCurve.SEG_QUADTO:
                    cp1x = curve.xPoints[pos]   + xShift;
                    cp1y = curve.yPoints[pos++] + yShift;
                    x    = curve.xPoints[pos]   + xShift;
                    y    = curve.yPoints[pos++] + yShift;

                    ctx.quadraticCurveTo(cp1x, cp1y, x, y);
                    break;
                case PiecewiseCurve.SEG_CUBICTO:
                    cp1x = curve.xPoints[pos]   + xShift;
                    cp1y = curve.yPoints[pos++] + yShift;
                    cp2x = curve.xPoints[pos]   + xShift;
                    cp2y = curve.yPoints[pos++] + yShift;
                    x    = curve.xPoints[pos]   + xShift;
                    y    = curve.yPoints[pos++] + yShift;

                    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
                    break;
            }
        }

        if (pathStarted) {
            // It was opened but never closed, so draw it
            strokeAndFill();
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


    return PIXI;
});
define(function(require) {

    'use strict';

    var PIXI = require('pixi');

                         require('common/v3/pixi/extensions');
    var PiecewiseCurve = require('common/math/piecewise-curve');

    /**
     * 
     */
    PIXI.createDropShadow = function(rectangle, width, blur, color, alpha) {
        if (alpha === undefined)
            alpha = 0.25;
        if (color === undefined)
            color = 'rgba(0,0,0,1)';
        if (blur === undefined)
            blur = 11;
        if (width === undefined)
            width = 11;

        var r = rectangle;

        // Draw the shadow
        var outline = new PiecewiseCurve()
            .moveTo(r.x,       r.y)
            .lineTo(r.x + r.w, r.y)
            .lineTo(r.x + r.w, r.y + r.h)
            .lineTo(r.x,       r.y + r.h)
            .close();

        var drawStyle = {
            lineWidth: width,
            strokeStyle: 'rgba(0,0,0,0)',
            shadowBlur: blur,
            fillStyle: color
        };

        var shadow = PIXI.Sprite.fromPiecewiseCurve(outline, drawStyle);
        shadow.alpha = alpha;

        var padding = Math.max(width, blur) + 2;
        var mask = new PIXI.Graphics();
        mask.beginFill();
        mask.drawRect(r.x - padding, r.y - padding, r.w + padding * 2, padding); // Top
        mask.drawRect(r.x - padding, r.y,           padding,           r.h);     // Left
        mask.drawRect(r.x + r.w,     r.y,           padding,           r.h);     // Right
        mask.drawRect(r.x - padding, r.y + r.h,     r.w + padding * 2, padding); // Bottom
        mask.endFill();

        shadow.mask = mask;

        var container = new PIXI.Container();
        container.addChild(shadow);
        container.addChild(mask);

        return container;
    };

    return PIXI;
});
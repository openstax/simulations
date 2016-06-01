define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var Vector2 = require('common/math/vector2');

    var _angles = [];
    var _point = new Vector2();

    /**
     * Works the same as the drawCircle function but draws the circle with a dashed
     *   line. Each number in the dashStyle array corresponds to either a solid or
     *   blank length.
     */
    PIXI.Graphics.prototype.dashCircle = function(x, y, radius, dashStyle) {
        if (dashStyle === undefined) {
            if (!this._dashStyle)
                this._dashStyle = [ 10, 10 ];
            dashStyle = this._dashStyle;
        }

        if (dashStyle.length % 2 !== 0) {
            console.warn('Dash style array must include an even number of entries. Padding with a space.');
            dashStyle.push(4);
        }

        for (var j = 0; j < dashStyle.length; j++) {
            // Solve for angle with three sides of a triangle
            var length = dashStyle[j];
            _angles[j] = Math.acos((2 * radius * radius - length * length) / (2 * radius * radius));
        }

        var radiansDrawn = 0;
        var radiansToDraw;
        var twoPi = 2 * Math.PI;
        var lastX = x + radius;
        var lastY = y;
        var i = 0;
        this.moveTo(lastX, lastY);
        
        while (radiansDrawn < twoPi) {
            // Determine the angle that corresponds to the distance we're
            //   drawing on the circumference
            radiansToDraw = _angles[i % dashStyle.length];
            if (radiansToDraw + radiansDrawn > twoPi)
                radiansToDraw = twoPi - radiansDrawn;

            // Find the new point
            _point.set(radius, 0);
            _point.rotate(radiansDrawn + radiansToDraw);
            _point.add(x, y);

            this[i % dashStyle.length === 0 ? 'lineTo' : 'moveTo'](_point.x, _point.y);
            lastX = _point.x;
            lastY = _point.y;

            radiansDrawn += radiansToDraw;
            i++;
        }

        this[i % dashStyle.length === 0 ? 'lineTo' : 'moveTo'](x + radius, y);
    };

    return PIXI;
});
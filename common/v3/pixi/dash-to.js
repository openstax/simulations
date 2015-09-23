define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var Vector2 = require('common/math/vector2');

    /**
     * Works the same as the lineTo function but draws a dashed line. Each
     *   number in the dashStyle array corresponds to either a solid or
     *   blank length.
     * 
     * Used this as a starting point: http://stackoverflow.com/a/15968095
     */
    PIXI.Graphics.prototype.dashTo = function(x, y, dashStyle) {
        var pathPoints = this.currentPath.shape.points;
        var x0 = pathPoints[pathPoints.length - 2];
        var y0 = pathPoints[pathPoints.length - 1];

        if (dashStyle === undefined) {
            if (!this._dashStyle)
                this._dashStyle = [ 10, 10 ];
            dashStyle = this._dashStyle;
        }

        if (dashStyle.length % 2 !== 0) {
            console.warn('Dash style array must include an even number of entries. Padding with a space.');
            dashStyle.push(4);
        }

        var dX = x - x0;
        var dY = y - y0;
        var lineLength = Math.sqrt(dX * dX + dY * dY);
        var unitX = dX / lineLength;
        var unitY = dY / lineLength;

        var lengthDrawn = 0;
        var i = 0;
        while (lengthDrawn < lineLength) {
            x0 += unitX * dashStyle[i % dashStyle.length];
            y0 += unitY * dashStyle[i % dashStyle.length];
            this[i % dashStyle.length === 0 ? 'lineTo' : 'moveTo'](x0, y0);
            lengthDrawn += dashStyle[i % dashStyle.length];
            i++;
        }
        this[i % dashStyle.length === 0 ? 'lineTo' : 'moveTo'](x, y);
    };

    return PIXI;
});
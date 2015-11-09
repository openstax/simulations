define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    /**
     * 
     */
    var QuadBezierSpline = function(startPoint, controlPoint, endPoint) {
        this.x1 = startPoint.x;
        this.y1 = startPoint.y;
        this.cx = controlPoint.x;
        this.cy = controlPoint.y;
        this.x2 = endPoint.x;
        this.y2 = endPoint.y;

        this._point = new Vector2();
    };

    /**
     * Instance functions/properties
     */
    _.extend(QuadBezierSpline.prototype, {

        /**
         * Uses the de Castelijau algorithm to determines the point that is some
         *   fraction t of the way along the curve from the start point to the end
         *   point. (t=1 is at the start point, and t=0 is at the end point.)
         */
        evaluate: function(t) {
            var x = (this.x1 * t * t) + (this.cx * 2 * t * (1 - t)) + (this.x2 * (1 - t) * (1 - t));
            var y = (this.y1 * t * t) + (this.cy * 2 * t * (1 - t)) + (this.y2 * (1 - t) * (1 - t));
            return this._point.set(x, y);
        }

    });

    return QuadBezierSpline;
});

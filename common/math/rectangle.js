define(function (require) {

    'use strict';

    /**
     * Source ported from phet.common.phetcommon.math.Function.
     */
    var Rectangle = require('../node_modules/rectangle-node-shimmed/index');

    // Flip top and bottom calculations
    var top    = Rectangle.prototype.top;
    var bottom = Rectangle.prototype.bottom;

    Rectangle.prototype.top    = bottom;
    Rectangle.prototype.bottom = top;

    /**
     * Returns a rectangle that is the intersection of this
     *   rectangle (this) and another rectangle (that).
     *
     * Algorithm borrowed from java.awt.geom.Rectangle2D.intersect
     */
    Rectangle.prototype.intersection = function(that) {
        if (this._intersectionRect === undefined)
            this._intersectionRect = new Rectangle();

        var x1 = Math.max(this.left(),   that.left());
        var y1 = Math.max(this.bottom(), that.bottom());
        var x2 = Math.min(this.right(),  that.right());
        var y2 = Math.min(this.top(),    that.top());

        return this._intersectionRect.set(x1, y1, x2 - x1, y2 - y1);
    };

    return Rectangle;

});
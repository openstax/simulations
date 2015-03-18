define(function (require) {

    'use strict';

    var Rectangle = require('../node_modules/rectangle-node-shimmed/index');
    var Vector2   = require('vector2-node');
    var lineIntersect = require('./line-intersection');

    /**
     * New constructor that adds cached objects
     */
    var originalConstructor = Rectangle;
    var originalPrototype = Rectangle.prototype;
    Rectangle = function(x, y, w, h) {
        originalConstructor.apply(this, [x, y, w, h]);

        this._centerVector = new Vector2();
    };
    Rectangle.prototype = originalPrototype;

    /**
     * Flipping top and bottom calculations
     */
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

    /**
     * Returns an array of points along the perimeter of the
     *   rectangle through which the specified line passes.
     */
    Rectangle.prototype.lineIntersectionPoints = function(x0, y0, x1, y1) {
        if (x0 instanceof Vector2) {
            if (y0 instanceof Vector2) {
                y1 = y0.y;
                x1 = y0.x;
                y0 = x0.y;
                x0 = x0.x;
            }
            else
                throw 'Rectangle.lineIntersectionPoints: Cannot mix and match object and flattened parameters.';
        }

        // Lines that make up the edges of the rectangle
        var ln = [
            [ this.left(),  this.bottom(), this.left(),  this.top()    ],
            [ this.left(),  this.top(),    this.right(), this.top()    ],
            [ this.right(), this.top(),    this.right(), this.bottom() ],
            [ this.right(), this.bottom(), this.left(),  this.bottom() ]
        ];

        var intersections = [];
        for (var i = 0; i < ln.length; i++) {
            var intersection = lineIntersect.lineIntersection(x0, y0, x1, y1, ln[i][0], ln[i][1], ln[i][2], ln[i][3]);
            if (intersection instanceof Vector2)
                intersections.push(intersection.clone());
        }
        
        return intersections;
    };

    /**
     * Exactly the same as the original, except that I had to 
     *   change references to top and bottom
     */
    Rectangle.prototype.contains = function(x, y) {
        if (x instanceof Rectangle)
            return this.contains(x.position()) && this.contains(x.position().add(x.size()));
        if (x instanceof Vector2)
            return this.left() <= x.x && x.x <= this.right() &&
                    this.bottom() <= x.y && x.y <= this.top();
        return this.left() <= x && x <= this.right() &&
                this.bottom() <= y && y <= this.top();
    };

    /**
     * Just to make it conform and have the same methods as 
     *   PiecewiseCurve so they can be used somewhat inter-
     *   changeably. 
     */
    Rectangle.prototype.getBounds = function() {
        return this;
    };

    /**
     * This function is the same as the original except that 
     *   it uses a chached center vector instead of creating 
     *   a new one each time and throwing it away.
     */
    Rectangle.prototype.center = function(x, y) {
        if (x instanceof Vector2)
            return this.position(x.x - this.w / 2,  x.y - this.h / 2);
        else if (x !== undefined)
            return this.position(x - this.w / 2, this.y = y - this.h / 2);
        return this._centerVector.set(this.x + this.w / 2, this.y + this.h / 2);
    };

    /**
     * Finds out if the rectangle overlaps with a circle.
     *   Algorithm from this Stack Overflow response:
     *   http://stackoverflow.com/a/402010/4085004
     */
    Rectangle.prototype.overlapsCircle = function(x, y, radius) {
        var distanceX = Math.abs(x - this.x);
        var distanceY = Math.abs(y - this.y);

        if (distanceX > (this.w / 2 + radius)) return false;
        if (distanceY > (this.h / 2 + radius)) return false;

        if (distanceX <= (this.w / 2)) return true;
        if (distanceY <= (this.h / 2)) return true;

        cornerDistanceSquared = 
            Math.pow(distanceX - this.w / 2, 2) +
            Math.pow(distanceY - this.h / 2, 2);

        return (cornerDistanceSquared <= (radius * radius));
    };

    /**
     * For easy debugging
     */
    Rectangle.prototype.toString = function(precision) {
        if (precision === undefined)
            precision = 4;
        return '(' + this.x.toFixed(precision) + ', ' + this.y.toFixed(precision) + ') '
                   + this.w.toFixed(precision) + 'x' + this.h.toFixed(precision);
    };

    return Rectangle;

});
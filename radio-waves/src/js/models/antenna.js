define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    /**
     * An antenna model
     */
    var Antenna = function(end1, end2) {
        this.end1 = new Vector2(end1);
        this.end2 = new Vector2(end2);

        this.maxX = Math.max(end1.x, end2.x);
        this.maxY = Math.max(end1.y, end2.y);
        this.minX = Math.min(end1.x, end2.x);
        this.minY = Math.min(end1.y, end2.y);

        this.r = Math.sqrt((Math.pow(end1.x - end2.x, 2) + Math.pow(end1.y - end2.y, 2)));
        this.theta = Math.atan((end1.y - end2.y) / (end1.x - end2.x));
        if (end1.x === end2.x) {
            this.theta = Math.PI / 2;
            this.m = Number.POSITIVE_INFINITY;
            this.b = Number.NaN;
        }
        else {
            this.m = (end1.y - end2.y) / (end1.x - end2.x);
            this.b = end1.y - (end1.x * this.m);
        }
    };

    /**
     * Instance functions/properties
     */
    _.extend(Antenna.prototype, {

        constrainPosition: function(pos) {
            if (pos.x > this.maxX)
                pos.set(this.maxX, this.getYForX(this.maxX, pos.y));
            if (pos.x < this.minX)
                pos.set(this.minX, this.getYForX(this.minX, pos.y));
            if (pos.y > this.maxY)
                pos.set(this.getXForY(this.maxY, pos.x), this.maxY);
            if (pos.y < this.minY)
                pos.set(this.getXForY(this.minY, pos.x), this.minY);
            pos.set(pos.x, this.getYForX(pos.x, pos.y));
            return pos;
        },

        getYForX: function(x, y) {
            if (this.m === Number.POSITIVE_INFINITY)
                return y;
            else
                return this.m * x + this.b;
        },

        getXForY: function(y, x) {
            if (this.m === 0 || this.m === Number.POSITIVE_INFINITY)
                return x;
            else
                return (y - this.b) / this.m;
        },

        getEnd1: function() {
            return this.end1;
        },

        getEnd2: function() {
            return this.end2;
        },

        getMaxX: function() {
            return this.maxX;
        },

        getMinX: function() {
            return this.minX;
        },

        getMaxY: function() {
            return this.maxY;
        },

        getMinY: function() {
            return this.minY;
        },

        getM: function() {
            return this.m;
        }

    });

    return Antenna;
});

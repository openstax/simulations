define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    /**
     * 
     */
    var WireSegment = function(start, finish, scalarStart) {
        this.start = new Vector2(start);
        this.finish = new Vector2(finish);
        this.length = new Vector2(finish).sub(start).length();

        this.scalarStart = scalarStart;
        this.scalarFinish = scalarStart + length;

        this._vec = new Vector2();
    };

    /**
     * Instance functions/properties
     */
    _.extend(WireSegment.prototype, {

        getStart: function() {
            return this.start;
        },

        getFinishScalar: function() {
            return this.scalarFinish;
        },

        toString: function() {
            return 'Start=' + this.start + ', finish=' + this.finish + ', length=' + this.length + ', scalarStart=' + this.scalarStart + ', scalarFinish=' + this.scalarFinish;
        },

        getFinish: function() {
            return this.finish;
        },

        contains: function(dist) {
            return dist >= this.scalarStart && dist <= this.scalarFinish;
        },

        getPosition: function(dist) {
            var rel = dist - this.scalarStart;
            var dx = this._vec
                .set(this.finish)
                .sub(this.start)
                .normalize()
                .scale(rel)
                .add(this.start);
            return dx;
        },

        getLength: function() {
            return this.length;
        }

    });

    return WireSegment;
});

define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var WireSegment = require('models/wire-segment');

    /**
     * 
     */
    var WirePatch = function() {
        this.segments = [];
    };

    /**
     * Instance functions/properties
     */
    _.extend(WirePatch.prototype, {

        getLength: function() {
            return this.lastSegment().getFinishScalar();
        },

        getPosition: function(dist) {
            var length = this.getLength();

            while (dist > length)
                dist -= length;
            
            while (dist < 0)
                dist += length;
            
            for (var i = 0; i < this.segments.length; i++) {
                if (this.segments[i].contains(dist))
                    return this.segments[i].getPosition(dist);
            }

            return null;
        },

        lastSegment: function() {
            return this.segments[this.segments.length - 1];
        },

        addSegment: function(wireSegment) {
            this.segments.push(wireSegment);
            return this;
        },

        /**
         * Attach to the previous wire.
         */
        appendSegmentAt: function(x, y) {
            if (this.segments.length === 0)
                throw 'No wires specified.';
            
            if (x instanceof Vector2) {
                y = x.y;
                x = x.x;
            }

            var start = this.lastSegment().getFinish();
            var end = new Vector2(x, y);
            var dist = this.totalDistance();

            this.addSegment(new WireSegment(start, end, dist));
            return this;
        },

        /**
         * Start the system with a segment between two points
         */
        startSegmentBetween: function(a, b) {
            this.createFirstSegment(a, new Vector2(b).sub(a));
            return this;
        },

        /**
         * Start the system.
         */
        createFirstSegment: function(x, y, dx, dy) {
            if (this.segments.length !== 0)
                throw 'Already started.';

            if (x instanceof Vector2) {
                dy = y.y;
                dx = y.x;
                y = x.y;
                x = x.x;
            }
            
            var start = new Vector2(x, y);
            var end = new Vector2(dx, dy).add(start);

            this.addSegment( new WireSegment(start, end, 0));
        },

        totalDistance: function() {
            var x = 0;
            for (var i = 0; i < this.segments.length; i++)
                x += this.segments[i].getLength();
            return x;
        }

    });

    return WirePatch;
});

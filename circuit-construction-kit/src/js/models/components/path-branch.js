define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var Branch = require('models/branch');

    /**
     * A branch made up of smaller, linear segments
     */
    var PathBranch = Branch.extend({

        initialize: function(attributes, options) {
            Branch.prototype.initialize.apply(this, [attributes, options]);

            this.segments = [];

            // Cached objects
            this._vec = new Vector2();
        },

        getPosition: function(x) {
            var segStartsAt = 0;
            for (var i = 0; i < this.segments.length; i++) {
                var seg = this.segments[i];
                var segStopsAt = segStartsAt + seg.getLength();
                if (x <= segStopsAt) {
                    var distAlongSegment = x - segStartsAt;
                    var vec = this._vec
                        .set(seg.end)
                        .sub(seg.start)
                        .normalize()
                        .scale(distAlongSegment)
                        .add(seg.start);
                    return vec;
                }
                segStartsAt += seg.getLength();
            }
            return null;
        },

        getLength: function() {
            var length = 0;
            for (var i = 0; i < this.segments.length; i++)
                length += this.segments[i].getLength();
            
            if (isNaN(length))
                throw 'Length is NaN';
            
            return length;
        },

        reset: function(start, next) {
            this.segments = [];
            this.segments.push(new Segment(new Vector2(start), new Vector2(next)));
        },

        addPoint: function(position) {
            this.segments.push(new Segment(new Vector2(this.lastPoint()), new Vector2(position)));
        },

        lastPoint: function() {
            return this.segments[this.segments.length - 1].end;
        }

    });

    /**
     * An object that represents an individual segment of the path
     */
    var Segment = function(start, end) {
        if (isNaN(start.x) || isNaN(start.y))
            throw 'Start was NaN: ' + start;
        if (isNaN(end.x) || isNaN(end.y))
            throw 'end was NaN: ' + end;

        this.start = start;
        this.end = end;
    };

    Segment.prototype.getLength = function() {
        var dist = this.start.distance(this.end);
        if (isNaN(dist))
            throw 'Length was NaN.';
        return dist;
    };


    return PathBranch;
});
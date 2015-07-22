define(function (require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var Vector2 = require('common/math/vector2');

    var WireSegment = require('models/wire-segment');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * A wire is a collection of connected wire segments. It contains a creator object
     *   that creates the wire shape.  The shape is used to display the wire, and to
     *   check continuity when measuring voltage.
     *
	 * Note that strict connectivity of the wire segments is not required. In fact,
	 *   you'll notice that segment endpoints are often adjusted to accommodate the
	 *   creation of wire shapes that look convincing in the view.
     */
    var Wire = Backbone.Model.extend({

        defaults: {
            thickness: 0
        },

        initialize: function(attributes, options) {
        	var segments = options.segments || [];

            this.segments = new Backbone.Collection(segments, { model: WireSegment });
        },

        addSegment: function(segment) {
        	this.segments.add(segment);
        },

        intersects: function() {
            throw 'Wire.intersects is deprecated. Please use Wire.touches instead.';
        },

        touches: function(point, radius) {
            for (var i = 0; i < this.segments.length; i++) {
                if (this.segments.at(i).touches(point, radius))
                    return true;
            }
            return false;
        },

        /**
         * Returns the average y for all segment endpoints.
         */
        getAverageY: function() {
            var ySum = 0;
            this.segments.each(function(segment) {
                ySum += segment.get('startY');
                ySum += segment.get('endY');
            });
            var averageY = ySum / (this.segments.length * 2);
            return averageY;
        },

        /**
         * Returns the maximum y for all segment endpoints.
         */
        getMaxY: function() {
            var maxY = Number.NEGATIVE_INFINITY;
            this.segments.each(function(segment) {
                maxY = Math.max(maxY, segment.get('startY'));
                maxY = Math.max(maxY, segment.get('endY'));
            });
            return maxY;
        },

        /**
         * Returns the minimum y for all segment endpoints.
         */
        getMinY: function() {
            var minY = Number.POSITIVE_INFINITY;
            this.segments.each(function(segment) {
                minY = Math.min(minY, segment.get('startY'));
                minY = Math.min(minY, segment.get('endY'));
            });
            return minY;
        },

        /**
         * Returns the maximum x for all segment endpoints.
         */
        getMaxX: function() {
            var maxX = Number.NEGATIVE_INFINITY;
            this.segments.each(function(segment) {
                maxX = Math.max(maxX, segment.get('startX'));
                maxX = Math.max(maxX, segment.get('endX'));
            });
            return maxX;
        },

        /**
         * Returns the minimum y for all segment endpoints.
         */
        getMinX: function() {
            var minX = Number.POSITIVE_INFINITY;
            this.segments.each(function(segment) {
                minX = Math.min(minX, segment.get('startX'));
                minX = Math.min(minX, segment.get('endX'));
            });
            return minX;
        },

        /**
         * Returns the center x between the maximum x and minimum x.
         */
        getCenterX: function() {
            var minX = this.getMinX();
            var maxX = this.getMaxX();
            return minX + (maxX - minX) / 2;
        }

    });


    return Wire;
});
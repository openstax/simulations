define(function (require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var Vector2 = require('common/math/vector2');

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
        }

    });


    return Wire;
});
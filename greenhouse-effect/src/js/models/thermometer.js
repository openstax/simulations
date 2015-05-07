define(function (require) {

    'use strict';

    var PositionableObject = require('common/models/positionable-object');

    /**
     * Represents the thermometer object.  Note that the original
     *   model used the same algorithm that the Earth does for
     *   basing the temperature off of an average of previous
     *   temperatures, but it used a history length of 1, which
     *   meant that it was just a directy copy of that temp that
     *   the earth model computed, so I ripped all that code out.
     */
    var Thermometer = PositionableObject.extend({

        defaults: _.extend({}, PositionableObject.prototype.defaults, {
            temperature: 0
        }),

        initialize: function(attributes, options) {
            this.body = options.body;

            this.listenTo(body, 'change:temperature', this.bodyTemperatureChanged);
        },

        bodyTemperatureChanged: function(body, temperature) {
            this.set('temperature', temperature);
        }

    });

    return Thermometer;
});

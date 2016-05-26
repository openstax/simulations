define(function (require) {

    'use strict';

    var _ = require('underscore');

    var VanillaPositionableObject = require('common/models/positionable-object');

    /**
     * MovingObject is an object that has mutable position, orientation and speed.
     */
    var MovingObject = VanillaPositionableObject.extend({

        defaults: _.extend({}, VanillaPositionableObject.prototype.defaults, {
            // Distance moved per deltaTime
            speed: 0,
            // Orientation in radians
            orientation: 0
        }),

        getOrientation: function() {
            return this.get('orientation');
        }

    });

    return MovingObject;
});
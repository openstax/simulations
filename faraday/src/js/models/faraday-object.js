define(function (require) {

    'use strict';

    var _ = require('underscore');

    var PositionableObject = require('common/models/positionable-object');

    var FaradayObject = PositionableObject.extend({

        defaults: _.extend({}, PositionableObject.prototype.defaults, {
            direction: 0, // The rotation of the object in radians
            enabled: true
        })

    });

    return FaradayObject;
});

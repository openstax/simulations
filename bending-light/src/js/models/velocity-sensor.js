define(function (require) {

    'use strict';

    var PositionableObject = require('common/models/positionable-object');

    /**
     * 
     */
    var VelocitySensor = PositionableObject.extend({
        
        defaults: _.extend({}, PositionableObject.prototype.defaults, {
            velocity: null,
            enabled: false
        })

    });

    return VelocitySensor;
});

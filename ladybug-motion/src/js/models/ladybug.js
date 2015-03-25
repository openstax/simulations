define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    var MotionObject = require('common/models/motion-object');

    var Constants = require('constants');

    var Ladybug = MotionObject.extend({

        defaults: _.extend({}, MotionObject.prototype.defaults, {
            width:  Constants.Ladybug.DEFAULT_WIDTH,
            length: Constants.Ladybug.DEFAULT_LENGTH,
            angle: 0
        }),

        reset: function() {
            this.setPosition(0, 0);
            this.setVelocity(0, 0);
            this.setAcceleration(0, 0);
        }

    }, Constants.Ladybug);

    return Ladybug;
});

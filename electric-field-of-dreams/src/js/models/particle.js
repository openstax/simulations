define(function (require) {

    'use strict';

    var _ = require('underscore');

    var MotionObject = require('common/models/motion-object');

    var Particle = MotionObject.extend({

        defaults: _.extend({}, MotionObject.prototype.defaults, {
            charge: 1,
            mass: 1
        }),

        initialize: function(attributes, options) {
            MotionObject.prototype.initialize.apply(this, arguments);

        }

    });

    return Particle;
});

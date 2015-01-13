define(function (require) {

    'use strict';

    var Backbone = require('backbone');
    var Vector2 = require('common/math/vector2');

    var Belt = Backbone.Model.extend({
        defaults: {
            wheel1Radius: 1,
            wheel1Center: new Vector2(),
            wheel2Radius: 1,
            wheel2Center: new Vector2()

            visible: false
        }
    });

    return Belt;
});

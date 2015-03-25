define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    var MotionObject = require('common/models/motion-object');
    var Rectangle    = require('common/math/rectangle');

    var Constants = require('constants');

    var Ladybug = MotionObject.extend({

        defaults: _.extend({}, MotionObject.prototype.defaults, {
            width:  Constants.Ladybug.DEFAULT_WIDTH,
            length: Constants.Ladybug.DEFAULT_LENGTH,
            angle: 0
        }),

        initialize: function(attributes, options) {
            MotionObject.prototype.initialize.apply(this, [attributes, options]);

            // For internal use to avoid creating and destroying objects
            this._bounds = new Rectangle();
        },

        reset: function() {
            this.setPosition(0, 0);
            this.setVelocity(0, 0);
            this.setAcceleration(0, 0);
        },

        getBounds: function() {
            return this._bounds.set(
                this.get('position').x - this.get('width')  / 2,
                this.get('position').y - this.get('length') / 2,
                this.get('width'),
                this.get('length')
            );
        }

    }, Constants.Ladybug);

    return Ladybug;
});

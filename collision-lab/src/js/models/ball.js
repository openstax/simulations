define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    var MotionObject = require('common/models/motion-object');
    var Rectangle    = require('common/math/rectangle');

    var Constants = require('constants');

    var Ball = MotionObject.extend({

        defaults: _.extend({}, MotionObject.prototype.defaults, {
            mass: Constants.Ball.DEFAULT_MASS,
            radius: 0,
            momentumX: 0,
            momentumY: 0,
            
            color: '#000',
            number: 0
        }),

        initialize: function(attributes, options) {
            MotionObject.prototype.initialize.apply(this, [attributes, options]);

            this.on('change:mass', this.updateRadius);
            this.on('change:mass change:velocity', this.updateMomentum);

            this.updateRadius();
            this.updateMomentum();
        },

        reset: function() {
            this.setPosition(0, 0);
            this.setVelocity(0, 0);
            this.setAcceleration(0, 0);
            this.set('mass', Constants.Ball.DEFAULT_MASS);
        },

        updateRadius: function() {
            this.set('radius', 0.15 * Math.pow(this.get('mass'), 1 / 3));
        },

        updateMomentum: function() {
            this.set('momentumX', this.get('mass') * this.get('velocity').x);
            this.set('momentumY', this.get('mass') * this.get('velocity').y);
        }

    }, Constants.Ball);

    return Ball;
});

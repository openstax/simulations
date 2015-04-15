define(function (require) {

    'use strict';

    var Backbone = require('backbone');
    var buzz     = require('buzz');

    var MotionObject = require('common/models/motion-object');
    var Rectangle    = require('common/math/rectangle');

    var Constants = require('constants');

    var Ball = MotionObject.extend({

        defaults: _.extend({}, MotionObject.prototype.defaults, {
            mass: Constants.Ball.DEFAULT_MASS,
            radius: 0,
            momentumX: 0,
            momentumY: 0,

            initX: 0,
            initY: 0,
            initVX: 0,
            initVY: 0,
            
            color: '#000',
            number: 0
        }),

        initialize: function(attributes, options) {
            MotionObject.prototype.initialize.apply(this, [attributes, options]);

            this.lastX = this.get('position').x;
            this.lastY = this.get('position').y;

            this.bigBounceSound = new buzz.sound('audio/bounce', {
                formats: ['ogg', 'mp3', 'wav']
            });
            this.smallBounceSound = new buzz.sound('audio/bounce-small', {
                formats: ['ogg', 'mp3', 'wav']
            });

            if (options.mute) {
                this.bigBounceSound.mute();
                this.smallBounceSound.mute();
            }

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
        },

        setX: function() {
            this.lastX = this.get('position').x;
            MotionObject.prototype.setX.apply(this, arguments);
        },

        setY: function(y) {
            this.lastY = this.get('position').y;
            MotionObject.prototype.setY.apply(this, arguments);
        },

        translate: function(x, y) {
            this.lastX = this.get('position').x;
            this.lastY = this.get('position').y;
            MotionObject.prototype.translate.apply(this, arguments);
        },

        setPosition: function(x, y) {
            this.lastX = this.get('position').x;
            this.lastY = this.get('position').y;
            MotionObject.prototype.setPosition.apply(this, arguments);
        },

        getLastX: function() {
            return this.lastX;
        },

        getLastY: function() {
            return this.lastY;
        },

        setLastPositionToCurrent: function() {
            this.lastX = this.get('position').x;
            this.lastY = this.get('position').y;
        },

        collideWithWall: function() {
            this.smallBounceSound.stop().play();
        },

        collideWithBall: function() {
            this.bigBounceSound.stop().play();
        }

    }, Constants.Ball);

    return Ball;
});

define(function (require) {

    'use strict';

    var Backbone = require('backbone');
    var buzz     = require('buzz');

    var MotionObject = require('common/models/motion-object');
    var Rectangle    = require('common/math/rectangle');
    var Vector2      = require('common/math/vector2');

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
                formats: ['ogg', 'mp3', 'wav'],
                volume: 50
            });
            this.smallBounceSound = new buzz.sound('audio/bounce-small', {
                formats: ['ogg', 'mp3', 'wav'],
                volume: 60
            });

            if (options.mute) {
                this.bigBounceSound.mute();
                this.smallBounceSound.mute();
            }

            // Save initial position and velocity
            this.set({
                initX: this.get('position').x,
                initY: this.get('position').y,
                initVX: this.get('velocity').x,
                initVY: this.get('velocity').y
            });

            this.on('change:mass', this.updateRadius);
            this.on('change:mass change:velocity', this.updateMomentum);

            this.updateRadius();
            this.updateMomentum();
        },

        reset: function() {
            this.setPosition(this.get('initX'),  this.get('initY'));
            this.setVelocity(this.get('initVX'), this.get('initVY'));
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

        setY: function() {
            this.lastY = this.get('position').y;
            MotionObject.prototype.setY.apply(this, arguments);
        },

        translate: function() {
            this.lastX = this.get('position').x;
            this.lastY = this.get('position').y;
            MotionObject.prototype.translate.apply(this, arguments);
        },

        setPosition: function() {
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

        setInitX: function(x) {
            this.set('initX', x);
        },

        setInitY: function(y) {
            this.set('initY', y);
        },

        setInitPosition: function(x, y) {
            if (x instanceof Vector2) {
                this.set('initX', x.x);
                this.set('initY', x.y);
            }
            else {
                this.set('initX', x);
                this.set('initY', y);
            }
        },

        setInitVX: function(vx) {
            this.set('initVX', vx);
        },

        setInitVY: function(vy) {
            this.set('initVY', vy);
        },

        setInitVelocity: function(vx, vy) {
            if (vx instanceof Vector2) {
                this.set('initVX', vx.x);
                this.set('initVY', vx.y);
            }
            else {
                this.set('initVX', vx);
                this.set('initVY', vy);
            }
        },

        collideWithWall: function() {
            this.smallBounceSound.stop().play();
        },

        collideWithBall: function() {
            this.bigBounceSound.stop().play();
        },

        getKineticEnergy: function() {
            var speed = this.get('velocity').length();
            return 0.5 * this.get('mass') * speed * speed;
        }

    }, Constants.Ball);

    return Ball;
});

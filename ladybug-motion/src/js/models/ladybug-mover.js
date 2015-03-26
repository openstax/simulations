define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var Constants = require('constants');

    /**
     * 
     *
     * Modeled after edu.colorado.phet.ladybugmotion2d.model.LadybugMotionModel
     */
    var LadybugMover = function(simulation) {
        this.simulation = simulation;
        this.motionType = LadybugMover.MOTION_TYPE_MANUAL;
    };

    /**
     * Instance functions/properties
     */
    _.extend(LadybugMover.prototype, {

        setMotionType: function(motionType) {
            if (this.motionType !== motionType) {
                this.motionType = motionType;
                this.motionType.init(this.simulation);
            }
        },

        update: function(deltaTime) {
            this.motionType.update(deltaTime, this.simulation);
        },

        reset: function() {
            this.setMotionType(LadybugMover.MOTION_TYPE_MANUAL);
        },

        isInManualMode: function() {
            return this.motionType === LadybugMover.MOTION_TYPE_MANUAL;
        }

    });

    /**
     * Static functions/properties
     */
     _.extend(LadybugMover, Constants.LadybugMover);

    LadybugMover.MOTION_TYPE_MANUAL = {

        init: function(simulation) {
            simulation.initManual();
        },

        update: function() {}

    };

    LadybugMover.MOTION_TYPE_LINEAR = {

        speed: 0.3 * 30 * 0.7 * 0.5,

        init: function(simulation) {
            var velocity = Vector2
                .fromAngle(simulation.ladybug.get('angle'))
                .scale(this.speed);

            simulation.ladybug.setVelocity(velocity);
        },

        update: function(deltaTime, simulation) {
            var ladybug = simulation.ladybug;

            var velocity = Vector2
                .fromAngle(ladybug.get('velocity').angle())
                .scale(this.speed);

            ladybug.setVelocity(velocity);
            ladybug.updatePositionFromVelocity(deltaTime);

            var x  = ladybug.get('position').x;
            var y  = ladybug.get('position').y;
            var vx = ladybug.get('velocity').x;
            var vy = ladybug.get('velocity').y;
            var changed = false;
            var bounds = simulation.getBounds();

            // Stay within bounds
            if (x > bounds.right() && vx > 0) {
                vx = -Math.abs(vx);
                x = bounds.right();
            }
            if (x < bounds.left() && vx < 0) {
                vx = Math.abs(vx);
                x = bounds.left();
            }
            if (y > bounds.top() && vy > 0) {
                vy = -Math.abs(vy);
                y = bounds.top();
            }
            if (y < bounds.bottom() && vy < 0) {
                vy = Math.abs(vy);
                y = bounds.bottom();
            }

            ladybug.setPosition(x, y);
            ladybug.setVelocity(vx, vy);
            ladybug.setAcceleration(simulation.estimateAcceleration());
            ladybug.set('angle', ladybug.get('velocity').angle());
            simulation.setSamplePoint(ladybug.get('position'));
        }

    };

    LadybugMover.MOTION_TYPE_CIRCULAR = {

        _pos: new Vector2(),
        _vel: new Vector2(),
        _acc: new Vector2(),

        init: function(simulation) {
            simulation.clearSampleHistory();
            simulation.resetSamplingMotionModel();
        },

        update: function(deltaTime, simulation) {
            var ladybug = simulation.ladybug;
            var distanceFromCenter = ladybug.get('position').length();
            var distanceFromRing = Math.abs(distanceFromCenter - LadybugMover.CIRCLE_RADIUS);

            var dx = LadybugMover.CIRCLE_RADIUS - distanceFromCenter;
            var speed = LadybugMover.CIRCLE_SPEED;
            var velocity;

            if (distanceFromRing > speed + 1E-6) {
                // We need to move toward the ring
                var velocity = this._vel
                    .set(1, 0)
                    .rotate(ladybug.get('position').angle())
                    .scale(this.speed)
                    .scale((dx < 0) ? -1 : 1);

                simulation.penDown = true;
                simulation.setSamplePoint(
                    ladybug.get('position').x + velocity.x * deltaTime,
                    ladybug.get('position').y + velocity.y * deltaTime
                );
                simulation.updatePositionMode(deltaTime);
            }
            else {
                // We are on the ring
                var angle = ladybug.get('position').angle();
                var r = distanceFromCenter;

                // Approximate a delta theta
                var deltaTheta = Math.PI / 64 * 1.3 * deltaTime * 30 * 0.7 * 2 * 0.85 * 0.5;
                var n = Math.floor(Math.PI * 2 / deltaTheta); // n * deltaTheta = 2 * PI
                var newAngle = angle + (2 * PI) / n;

                var position = this._pos
                    .set(1, 0)
                    .rotate(newAngle)
                    .scale(r);
                ladybug.setPosition(position);

                var velocity = this._vel
                    .set(1, 0)
                    .rotate(newAngle + Math.PI / 2)
                    .scale((newAngle - angle) / (deltaTime * r));
                ladybug.setVelocity(velocity);
                ladybug.set('angle', velocity.angle());

                var acceleration = this._acc
                    .set(1, 0)
                    .rotate(newAngle + Math.PI)
                    .scale(Math.pow(velocity.length(), 2) / r);
                ladybug.setAcceleration(acceleration);

                simulation.setSamplePoint(ladybug.get('position'));
            }
        }

    };

    LadybugMover.MOTION_TYPE_ELLIPTICAL = {

        /**
         * This is an internal "time" that really has nothing to do with
         *   actual simulation time. It's just used to determine where
         *   we are on the elliptical path relative to when we began.
         */
        time: 0,

        init: function() {},

        update: function(deltaTime, simulation) {
            var ladybug = simulation.ladybug;

            var a = LadybugMover.ELLIPSE_A;
            var b = LadybugMover.ELLIPSE_B;

            var n = 79 * deltaTime / 0.015 * 0.7 * 2;
            this.time += 2 * Math.PI / Math.floor(n);
            var t = this.time;

            ladybug.setPosition(     a * Math.cos(t),  b * Math.sin(t));
            ladybug.setVelocity(    -a * Math.sin(t),  b * Math.cos(t));
            ladybug.setAcceleration(-a * Math.cos(t), -b * Math.sin(t));

            ladybug.set('angle', ladybug.get('velocity').angle());
        }

    };


    LadybugMover.MOTION_TYPES = {
        'Manual':     LadybugMover.MOTION_TYPE_MANUAL,
        'Linear':     LadybugMover.MOTION_TYPE_LINEAR,
        'Circular':   LadybugMover.MOTION_TYPE_CIRCULAR,
        'Elliptical': LadybugMover.MOTION_TYPE_ELLIPTICAL
    };

    


    return LadybugMover;
});

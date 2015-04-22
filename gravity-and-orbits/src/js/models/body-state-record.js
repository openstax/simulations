define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    /**
     * An object that holds a body model's state at a
     *   given point in time. It is intended for these
     *   objects to get recycled.
     */
    var BodyStateRecord = function() {
        this.time = 0;

        this.position     = new Vector2();
        this.velocity     = new Vector2();
        this.acceleration = new Vector2();

        this.mass = 0;
    };

    /**
     * Instance functions/properties
     */
    _.extend(BodyStateRecord.prototype, {

        recordState: function(time, body) {
            this.time = time;

            this.position.set(body.get('position'));
            this.velocity.set(body.get('velocity'));
            this.acceleration.set(body.get('acceleration'));

            this.mass = body.get('mass');
        },

        applyState: function(body) {
            body.setPosition(this.position);
            body.setVelocity(this.velocity);
            body.setAcceleration(this.acceleration);
            body.updateForce();

            body.set('mass', this.mass);
        },

        getTime: function() {
            return this.time;
        }

    });


    return BodyStateRecord;
});

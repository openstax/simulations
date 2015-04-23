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
        this.exploded = false;
    };

    /**
     * Instance functions/properties
     */
    _.extend(BodyStateRecord.prototype, {

        /**
         * For when we don't care about time
         */
        saveState: function(body) {
            this.recordState(0, body);
        },

        /**
         * Records the data from a given body
         */
        recordState: function(time, body) {
            this.time = time;

            this.position.set(body.get('position'));
            this.velocity.set(body.get('velocity'));
            this.acceleration.set(body.get('acceleration'));

            this.mass = body.get('mass');
            this.exploded = body.get('exploded');
        },

        /**
         * Applies the data stored in this state to the given body.
         */
        applyState: function(body) {
            body.setPosition(this.position);
            body.setVelocity(this.velocity);
            body.setAcceleration(this.acceleration);
            body.updateForce();

            body.set('mass', this.mass);
            body.set('exploded', this.exploded);
        },

        /**
         * Returns the time at which this state was recorded in seconds.
         */
        getTime: function() {
            return this.time;
        }

    });


    return BodyStateRecord;
});

define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    /**
     * An object that holds a ladybug model's state at a
     *   given point in time.  It is intended for these
     *   objects to get recycled.
     */
    var LadybugStateRecord = function() {
        this.time = 0;

        this.position     = new Vector2();
        this.velocity     = new Vector2();
        this.acceleration = new Vector2();

        this.angle = 0;
    };

    /**
     * Instance functions/properties
     */
    _.extend(LadybugStateRecord.prototype, {

        recordState: function(time, ladybug) {
            this.time = time;

            this.position.set(ladybug.get('position'));
            this.velocity.set(ladybug.get('velocity'));
            this.acceleration.set(ladybug.get('acceleration'));

            this.angle = ladybug.get('angle');
        },

        applyState: function(ladybug) {
            ladybug.setPosition(this.position);
            ladybug.setVelocity(this.velocity);
            ladybug.setAcceleration(this.acceleration);

            ladybug.set('angle', this.angle);
        },

        getTime: function() {
            return this.time;
        }

    });


    return LadybugStateRecord;
});

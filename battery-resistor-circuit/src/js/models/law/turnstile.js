define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var Law = require('models/law');

    /**
     * 
     */
    var Turnstile = function(center, angleVelocityScale) {
        this.center = new Vector2(center);
        this.angleVelocityScale = angleVelocityScale;
        this.angle = 0;
        this.angularSpeed = 0.31;
    };

    /**
     * Instance functions/properties
     */
    _.extend(Turnstile.prototype, Law.prototype, {
        
        update: function(deltaTime, system) {
            this.angle = this.angularSpeed * deltaTime + this.angle;
        },

        currentChanged: function(a) {
            this.angularSpeed = a * this.angleVelocityScale;
        }

    });

    return Turnstile;
});

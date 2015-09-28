define(function (require) {

    'use strict';

    var _ = require('underscore');

    var WireParticle = require('models/wire-particle');

    /**
     * 
     */
    var Electron = function(attributes) {
        WireParticle.apply(this, arguments);

        this.collisionEvent = attributes.collisionEvent;
    };

    /**
     * Instance functions/properties
     */
    _.extend(Electron.prototype, WireParticle.prototype, {

        forgetCollision: function() {
            this.lastCollisionObject = null;
            this.lastCollisionTime = NaN;
            this.collided = false;
        },

        getLastCollision: function() {
            if (!this.collisionEvent)
                return null;
            
            if (this.collisionEvent.currentTime() - this.lastCollisionTime > 20)
                this.collided = true;
            
            return this.lastCollisionObject;
        },

        setLastCollision: function(object, time) {
            this.lastCollisionObject = object;
            this.lastCollisionTime = time;
        },

        setCollided: function(collided) {
            this.collided = collided;
        },

        hasCollided: function() {
            return this.collided;
        }

    });

    return Electron;
});

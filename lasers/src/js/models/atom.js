define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var PropertiesBasedAtom = require('common/quantum/models/properties-based-atom');

    var Constants = require('constants');

    /**
     * A spherical body with mass and momentum
     */
    var LaserAtom = PropertiesBasedAtom.extend({

        defaults: _.extend({}, PropertiesBasedAtom.prototype.defaults, {
            canCollideInGroundState: true
        }),

        collideWithPhoton: function(photon) {
            var canCollide = false;

            if (!this.getCurrentState().equals(this.getGroundState()))
                canCollide = true;
            else
                canCollide = this.get('canCollideInGroundState');

            if (canCollide)
                PropertiesBasedAtom.prototype.collideWithPhoton.apply(this, arguments);
        },

        currentStateChanged: function(atom, currentState) {
            PropertiesBasedAtom.prototype.currentStateChanged.apply(this, arguments);

            if (currentState.equals(this.getGroundState())) {
                this.set('canCollideInGroundState', false);
                this.lifetimeTimer = Constants.MINIMUM_GROUND_STATE_LIFETIME;
            }
        },

        update: function(time, deltaTime) {
            this.lifetimeTimer -= deltaTime;
            if (this.lifetimeTimer <= 0 && !this.get('canCollideInGroundState'))
                this.set('canCollideInGroundState', true);
        }

    });

    return LaserAtom;
});
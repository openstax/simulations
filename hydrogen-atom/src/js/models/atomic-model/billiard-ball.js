define(function (require) {

    'use strict';

    var _ = require('underscore');

    var AbstractAtomicModel = require('hydrogen-atom/models/atomic-model');
    
    var Constants = require('constants');

    /**
     * BilliardBallModel models the hydrogen atom as a billiard ball.
     * 
     * Physical representation:
     *   The ball is spherical, with its local origin at its center.
     * 
     * Collision behavior:
     *   When photons and alpha particles collide with the ball,
     *   they bounce off as if the ball were a rigid body.
     * 
     * Absorption behavior:
     *   Does not absorb photons or alpha particles.
     * 
     * Emission behavior:
     *   Does not emit photons or alpha particles.
     */
    var BilliardBallModel = AbstractAtomicModel.extend({

        defaults: _.extend({}, AbstractAtomicModel.prototype.defaults, {
            radius: Constants.BilliardBallModel.DEFAULT_RADIUS
        }),

        initialize: function(attributes, options) {
            AbstractAtomicModel.prototype.initialize.apply(this, [attributes, options]);

            
        },

        /**
         * Moves a photon.
         * In the default implementation, the atom has no influence on the photon's movement.
         */
        movePhoton: function(photon, deltaTime) {
            var position = photon.getPosition();
            if (!photon.isCollided()) {
                if (this.get('position').distanceSq(position) <= this.get('radius') * this.get('radius')) {
                    var sign = (position.x > this.getX()) ? 1 : -1;
                    var deflection = sign * BilliardBallModel.DEFLECTION_ANGLE_RANGE.random();
                    var orientation = photon.get('orientation') + deflection;
                    photon.set('orientation', orientation);
                    photon.set('collided', true);
                }
            }

            AbstractAtomicModel.prototype.movePhoton.apply(this, arguments);
        },

        /**
         * Moves an alpha particle.
         * In the default implementation, the atom has no influence on the alpha particle's movement.
         */
        moveAlphaParticle: function(alphaParticle, deltaTime) {
            var position = alphaParticle.getPosition();
            if (this.get('position').distanceSq(position) <= this.get('radius') * this.get('radius')) {
                var sign = (position.x > this.getX()) ? 1 : -1;
                var deflection = sign * BilliardBallModel.DEFLECTION_ANGLE_RANGE.random();
                var orientation = alphaParticle.get('orientation') + deflection;
                alphaParticle.set('orientation', orientation);
            }
            
            AbstractAtomicModel.prototype.moveAlphaParticle.apply(this, arguments);
        },

    }, Constants.BilliardBallModel);

    return BilliardBallModel;
});
define(function (require) {

    'use strict';

    var _ = require('underscore');

    var PositionableObject = require('common/models/positionable-object');
    
    var Constants = require('constants');

    /**
     * AbstractAtomicModel is the base class for all hydrogen atom models.
     */
    var AbstractAtomicModel = PositionableObject.extend({

        defaults: _.extend({}, PositionableObject.prototype.defaults, {
            
        }),

        initialize: function(attributes, options) {
            PositionableObject.prototype.initialize.apply(this, [attributes, options]);

            
        },

        /**
         * Moves a photon.
         * In the default implementation, the atom has no influence on the photon's movement.
         */
        movePhoton: function(photon, deltaTime) {
            var speed = photon.getSpeed();
            var distance = speed * deltaTime;
            var direction = photon.getOrientation();
            var dx = Math.cos(direction) * distance;
            var dy = Math.sin(direction) * distance;
            var x = photon.getX() + dx;
            var y = photon.getY() + dy;
            photon.setPosition(x, y);
        },

        /**
         * Moves an alpha particle.
         * In the default implementation, the atom has no influence on the alpha particle's movement.
         */
        moveAlphaParticle: function(alphaParticle, deltaTime) {
            var speed = alphaParticle.getSpeed();
            var distance = speed * deltaTime;
            var direction = alphaParticle.getOrientation();
            var dx = Math.cos(direction) * distance;
            var dy = Math.sin(direction) * distance;
            var x = alphaParticle.getX() + dx;
            var y = alphaParticle.getY() + dy;
            alphaParticle.setPosition(x, y);
        },

        update: function(time, deltaTime) {},

        firePhotonAbsorbed: function(photon) {
            this.trigger('photon-absorbed', photon);
        },

        firePhotonEmitted: function(photon) {
            this.trigger('photon-emitted', photon);
        },

        /**
         * Gets the transition wavelengths for a specified state.
         * The default implementation returns null.
         * The notion of "transition wavelength" does not apply to all
         *   hydrogen atom models, but it is convenient to have it here.
         */
        getTransitionWavelengths: function(state) {
            return null;
        }

    }, _.extend({}, Constants.AbstractAtomicModel, {

        /**
         * Gets the ground state.
         * The notion of "ground state" does not apply to all
         *   hydrogen atom models, but it is convenient to have it here.
         */
        getGroundState: function() {
            return AbstractAtomicModel.GROUND_STATE;
        },

        /**
         * Gets the number of electron states that the model supports.
         * The default is zero, since some models have no notion of "state".
         * @return int
         */
        getNumberOfStates: function() {
            return 0;
        },
        
        /**
         * Determines if two points collide.
         * Any distance between the points that is <= threshold
         *   is considered a collision.
         */
        pointsCollide: function(p1, p2, threshold) {
            return (p1.distance(p2) <= threshold);
        }

    }));

    return AbstractAtomicModel;
});
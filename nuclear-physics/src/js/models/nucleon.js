define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var SubatomicParticle = require('models/subatomic-particle');

    var Constants = require('constants');

    /**
     * A nucleon, which is either a neutron or a proton
     */
    var Nucleon = SubatomicParticle.extend({

        defaults: _.extend({}, SubatomicParticle.prototype.defaults, {
            // Type of nucleon
            type: undefined,

            // Boolean that controls whether this particle should exhibit quantum
            //   tunneling behavior.
            tunnelingEnabled: false
        }),

        init: function() {
            SubatomicParticle.prototype.init.apply(this, arguments);
            
            this.jitterOffset = new Vector2();
        },

        onCreate: function(attributes, options) {
            SubatomicParticle.prototype.onCreate.apply(this, arguments);

            // Current jitter offset, used to create a vibrating motion effect.
            this.jitterOffset.set(0, 0);
        },

        /**
         * This method simulates the quantum tunneling behavior, which means that
         *   it causes the particle to move to some new random location within the
         *   confines of the supplied parameters.
         * 
         * @param minDistance - Minimum distance from origin (0,0).  This is generally 0.
         * @param nucleusRadius - Radius of the nucleus where this particle resides.
         * @param tunnelRadius - Radius at which this particle could tunnel out of nucleus.
         */
        tunnel: function(center, minDistance, nucleusRadius, tunnelRadius) {
            if (this.get('tunnelingEnabled')) {
                var newPosition = Nucleon.tunnel(center, minDistance, nucleusRadius, tunnelRadius);
                
                // Save the new position.
                this.setPosition(newPosition);
            }
        },
        
        jitter: function() {
            if (this.jitterOffset.x == 0 && this.jitterOffset.y == 0) {
                // Move away from the base position by a small amount.
                var angle = Math.random() * 2 * Math.PI;
                this.jitterOffset.set(Math.cos(angle) * Nucleon.JITTER_DISTANCE, Math.sin(angle) * Nucleon.JITTER_DISTANCE);
                this.setPosition(this.get('position').x + this.jitterOffset.x, this.get('position').y + this.jitterOffset.y);
            }
            else {
                // Move back to the base position.
                this.setPosition(this.get('position').x - this.jitterOffset.x, this.get('position').y - this.jitterOffset.y);
                this.jitterOffset.set(0, 0);
            }
        }

    }, _.extend({

        /**
         * This method simulates the quantum tunneling behavior, which means that
         *   it causes the particle to move to some new random location within the
         *   confines of the supplied parameters.
         * 
         * @param minDistance - Minimum distance from origin (0,0).  This is generally 0.
         * @param nucleusRadius - Radius of the nucleus where this particle resides.
         * @param tunnelRadius - Radius at which this particle could tunnel out of nucleus.
         */
        tunnel: function(center, minDistance, nucleusRadius, tunnelRadius) {
            if (!this._tunnelPosition)
                this._tunnelPosition = new Vector2();

            // Create a probability distribution that will cause the particles to
            //   be fairly evenly spread around the core of the nucleus and appear
            //   occasionally at the outer reaches.
            var multiplier = Math.random();
            if (multiplier > 0.8) {
                // Cause the distribution to tail off in the outer regions of the
                // nucleus.
                multiplier = Math.random() * Math.random();
            }
            
            var newRadius = minDistance + (multiplier * (nucleusRadius - minDistance));
            
            // Calculate the new angle, in radians, from the origin.
            var newAngle = Math.random() * 2 * Math.PI;
            
            // Convert from polar to Cartesian coordinates.
            var xPos = Math.cos(newAngle) * newRadius;
            var yPos = Math.sin(newAngle) * newRadius;
            
            // Save the new position.
            this._tunnelPosition.set(xPos + center.x, yPos + center.y);

            return this._tunnelPosition;
        }

    }, Constants.Nucleon));

    return Nucleon;
});
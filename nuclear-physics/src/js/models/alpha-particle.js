define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var SubatomicParticle = require('models/subatomic-particle');

    var Constants = require('constants');

    /**
     * A nucleon, which is either a neutron or a proton
     */
    var AlphaParticle = SubatomicParticle.extend({

        onCreate: function(attributes, options) {
            SubatomicParticle.prototype.onCreate.apply(this, arguments);

            this.setVelocity(
                AlphaParticle.MAX_AUTO_TRANSLATE_AMT * ((Math.random() * 2.0) - 1.0), 
                AlphaParticle.MAX_AUTO_TRANSLATE_AMT * ((Math.random() * 2.0) - 1.0)
            );

            // State of this particle with respect to tunneling out.
            this.tunnelingState = AlphaParticle.IN_NUCLEUS;
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
            var maxDistance = nucleusRadius;
            
            if (Math.random() > 0.98)
            {
                // Every once in a while use the tunnel radius as the max distance
                //   to which this particle might tunnel.  This creates the effect
                //   of having particles occasionally appear as though they are
                //   almost tunneling out.
                maxDistance = tunnelRadius;    
            }
            
            // Create a probability distribution that will cause the particles to
            //   be fairly evenly spread around the core of the nucleus and appear
            //   occasionally at the outer reaches.
            
            var multiplier = Math.random();
            if (multiplier > 0.8)
            {
                // Cause the distribution to tail off in the outer regions of the
                //   nucleus.
                multiplier = Math.random() * Math.random();
            }
            
            var newRadius = minDistance + (multiplier * (maxDistance - minDistance));
            
            // Calculate the new angle, in radians, from the origin.
            var newAngle = Math.random() * 2 * Math.PI;
            
            // Convert from polar to Cartesian coordinates.
            var xPos = Math.cos(newAngle) * newRadius;
            var yPos = Math.sin(newAngle) * newRadius;
            
            // Save the new position.
            this.setPosition(xPos + center.x, yPos + center.y);
        },

        /**
         * This method forces the particle to tunnel out of the nucleus.
         * 
         * @param center - Center point from which tunnel out should occur.
         * @param radius - Radius at which it should tunnel out too.
         */
        tunnelOut: function(center, radius) {
            // Make sure we are in the expected state.
            if (this.tunnelingState !== AlphaParticle.IN_NUCLEUS) {
                console.error('Tunneling state should be IN_NUCLEUS to perform tunnelOut');
                return;
            }
            
            // Choose the angle at which to tunnel out.  To assure that it is
            //   clear to the user, we only tunnel out at the sides of the
            //   nucleus, otherwise the particle tends to disappear too quickly.
            var newAngle;
            
            if (Math.random() < 0.5) {
                // Go out on the right side.
                newAngle = Math.PI / 3 + (Math.random() * Math.PI / 3);
            }
            else {
                // Go out on left side.
                newAngle = Math.PI + (Math.PI / 3) + (Math.random() * Math.PI / 3);
            }
            
            var xPos = Math.sin(newAngle) * radius;
            var yPos = Math.cos(newAngle) * radius;
            
            // Save the new position.
            this.setPosition(xPos + center.x, yPos + center.y);
            
            // Set our initial values for translating out of the nucleus.
            var xVel = 0.75 * Math.sin(newAngle);
            var yVel = 0.75 * Math.cos(newAngle);
            this.setVelocity(xVel, yVel);
            this.setAcceleration(0.3 * xVel, 0.3 * yVel);
            
            // Change our tunneling state.
            this.tunnelingState = AlphaParticle.TUNNELING_OUT_OF_NUCLEUS;
        },
        
        /**
         * This method tells the particle to take its next step in moving away
         *   from the nucleus, and is only applicable when the particle is in
         *   the process of tunneling out of the nucleus.
         */
        moveOut: function() {
            if (this.tunnelingState != AlphaParticle.TUNNELING_OUT_OF_NUCLEUS)
                return;
            
            if (this.get('position').distance(0, 0) > AlphaParticle.MAX_TUNNELING_DISTANCE) {
                // This is far enough away that we don't need to bother moving it any more.
                this.tunnelingState = AlphaParticle.TUNNELED_OUT_OF_NUCLEUS;
                return;
            }
            
            // Move based on current pos/vel/acc settings.
            this.update();
        },
        
        /**
         * This method returns to the nucleus a particle that is in the process
         *   of tunneling or that has fully tunneled away.
         */
        resetTunneling: function() {
            if (this.tunnelingState == AlphaParticle.IN_NUCLEUS) {
                // We are currently in the nucleus, so no changes are required.
                return;
            }
            
            // Return our position to the origin.
            this.setPosition(0, 0);
            
            // Reset the tunneling state.
            this.tunnelingState = AlphaParticle.IN_NUCLEUS;
        }

    }, Constants.AlphaParticle);

    return AlphaParticle;
});
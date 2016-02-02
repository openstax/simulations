define(function (require) {

    'use strict';

    var _ = require('underscore');

    var MotionObject = require('common/models/motion-object');

    /**
     * Base class for all subatomic particles
     */
    var SubatomicParticle = MotionObject.extend({

        /**
         * Tunnel to another location.
         * 
         * @param center - Location from which to tunnel.
         * @param minDistance - Minimum tunneling distance, often zero.
         * @param maxDistance1 - The usual value used for the max tunneling distance.
         * @param maxDistance2 - A value that is more rarely used and is usually
         *   equal to or bigger than the other max distance.  Originally added to
         *   allow alpha particles to sometimes tunnel to the area between the edge
         *   of the nucleus to the tunneling radius.
         */
        tunnel: function(center, minDistance, maxDistance1, maxDistance2) {
            // Does nothing in base class.
        },
        
        /**
         * Jitter a little, meaning move a small amount from the current position
         *   then back.
         */
        jitter: function() {
            // Does nothing in the base class.
        },

        /**
         * Moves this particle based on its current velocity and acceleration.
         */
        updatePositionAndVelocity: function() {
            // Update the position.
            this.setPosition(this.get('position').add(this.get('velocity')));
            
            // Update the velocity.
            this.setVelocity(this.get('velocity').add(this.get('acceleration')));
        }

    });

    return SubatomicParticle;
});
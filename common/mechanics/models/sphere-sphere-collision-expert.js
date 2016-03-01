define(function (require) {

    'use strict';

    var SphericalBody = require('./spherical-body');

    var Vector2    = require('common/math/vector2');
    var Reflection = require('common/math/reflection');

    // Cached objects
    var _loa           = new Vector2();
    var _contactPoint  = new Vector2();
    var _vRel          = new Vector2();
    var _n             = new Vector2();
    var _tangendVector = new Vector2();
    var _linePtA       = new Vector2();
    var _linePtB       = new Vector2();
    var _vA            = new Vector2();
    var _vB            = new Vector2();

    /**
     * Detects and handles collisions between two bodies if one is a photon and one is an atom
     */
    var SphereSphereCollisionExpert = {

        detectAndDoCollision: function(bodyA, bodyB) {
            if (bodyA instanceof SphericalBody && 
                bodyB instanceof SphericalBody && 
                this.spheresTouch(bodyA, bodyB) && 
                this.tweakCheck(bodyA, bodyB)
            ) {
                // Do the collision
                this.collide(bodyA, bodyB);
                
                return true;
            }

            return false;
        },

        /**
         * Returns whether or not two spheres are touching.
         */
        spheresTouch: function(sphereA, sphereB) {
            if (sphereA.get('position').distanceSq(sphereB.get('position')) <= Math.pow(sphereA.get('radius') + sphereB.get('radius'), 2))
                return true;
            else
                return false;
        },

        /**
         * This check returns false if the two bodies were in contact during the previous
         *   time step. Using this check to prevent a collision in such cases makes the
         *   performance of the collision system much more natural looking.
         */
        tweakCheck: function(sphereA, sphereB) {
            var previousDistanceSq = sphereA.getPreviousPosition().distanceSq(sphereB.getPreviousPosition());
            return previousDistanceSq > Math.pow(sphereA.get('radius') + sphereB.get('radius'), 2);
        },

        /**
         * Calculates and returns the line of action
         */
        getLoa: function(particle1, particle2) {
            _loa
                .set(particle1.get('position'))
                .sub(particle2.get('position'));
            return _loa;
        },

        collide: function(sphereA, sphereB) {
            var dist = sphereA.get('position').distance(sphereB.get('position'));
            var ratio = sphereA.get('radius') / dist;
            var contactPt = _contactPoint.set(
                sphereA.getX() + (sphereB.getX() - sphereA.getX()) * ratio,
                sphereA.getY() + (sphereB.getY() - sphereA.getY()) * ratio
            );
            var loa = this.getLoa(sphereA, sphereB);

            this.doCollision(sphereA, sphereB, loa, contactPt);
        },

        doCollision: function(sphereA, sphereB, loa, contactPt ) {
            // Get the total energy of the two objects, so we can conserve it
            var totalEnergy0 = sphereA.getKineticEnergy() + sphereB.getKineticEnergy();

            // Get the unit vector along the line of action
            _n.set(loa);
            _n.normalize();

            // If the relative velocity shows the points moving apart, then there is no collision.
            // This is a key check to solve otherwise sticky collision problems
            _vRel.set(sphereA.get('velocity'));
            _vRel.sub(sphereB.get('velocity'));

            // Compute correct position of the bodies following the collision
            _tangendVector.set(loa.y, -loa.x);

            // Determine the proper positions of the bodies following the collision
            var previousDistance = sphereB.getPreviousPosition().distance(sphereA.getPreviousPosition());
            var offsetB = previousDistance < sphereA.get('radius') ?
                -sphereB.get('radius') : 
                 sphereB.get('radius');
            var offsetXB = _n.x * offsetB;
            var offsetYB = _n.y * offsetB;
            _linePtB
                .set(contactPt)
                .sub(offsetXB, offsetYB);
            var positionB = Reflection.reflectPointAcrossLine(
                sphereB.get('position'), 
                _linePtB, 
                Math.atan2(_tangentVector.y, _tangentVector.x)
            );
            sphereB.setPosition(positionB);

            // todo: The determination of the sign of the offset is wrong. It should be based on which side of the contact
            // tangent the CM was on in its previous position
            var prevPosA = sphereA.getPreviousPosition();
            var prevDistA = prevPosA.distance(contactPt);
            var sA = sphereA.get('radius') / prevDistA;
            _linePtA.set(
                contactPt.x - (contactPt.x - prevPosA.x) * sA,
                contactPt.y - (contactPt.y - prevPosA.y) * sA
            );
            var offsetA = -sphereA.get('radius');
            var offsetXA = _n.x * offsetA;
            var offsetYA = _n.y * offsetA;
            var positionA = Reflection.reflectPointAcrossLine(
                sphereA.get('position'), 
                _linePtA,
                Math.atan2(_tangentVector.y, _tangentVector.x)
            );
            sphereA.setPosition(positionA);

            // Compute the relative velocities of the contact points
            var vr = _vRel.dot(n);

            // Assume the coefficient of restitution is 1
            var e = 1;

            // Compute the impulse, j
            var numerator = -vr * (1 + e);
            var denominator = (1 / sphereA.get('mass') + 1 / sphereB.get('mass'));
            var j = numerator / denominator;

            // Compute the new linear and angular velocities, based on the impulse
            _vA.set(_n).scale( j / sphereA.get('mass'));
            _vB.set(_n).scale(-j / sphereB.get('mass'));
            sphereA.addVelocity(_vA);
            sphereB.addVelocity(_vB);
        }

    };


    return SphereSphereCollisionExpert;
});
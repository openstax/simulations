define(function (require) {

    'use strict';

    var SphericalBody = require('./spherical-body');
    var BoxlikeBody   = require('./boxlike-body');

    var Vector2    = require('common/math/vector2');
    var Reflection = require('common/math/reflection');

    /**
     * Detects and handles collisions between two bodies if one is a photon and one is an atom
     */
    var SphereBoxCollisionExpert = {

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

        applies: function(bodyA, bodyB) {
            return (
                (bodyA instanceof SphericalBody && bodyB instanceof BoxlikeBody) || 
                (bodyA instanceof BoxlikeBody && bodyB instanceof SphericalBody)
            );
        },

        /**
         * Returns whether or not the box and sphere are touching
         */
        inContact: function(bodyA, bodyB) {
            var result = false;
            var box;
            var sphere;

            // Check that the arguments are valid
            if (bodyA instanceof BoxlikeBody) {
                box = bodyA;
                if (bodyB instanceof SphericalBody
                    sphere = bodyB;
                else
                    throw 'Bad arguments given in SphereBoxCollisionExpert';
            }
            else if (bodyB instanceof BoxlikeBody) {
                box = bodyB;
                if (bodyA instanceof SphericalBody)
                    sphere = bodyA;
                else
                    throw 'Bad arguments given in SphereBoxCollisionExpert';
            }
            else
                throw 'Bad arguments given in SphereBoxCollisionExpert';

            // Hitting left wall?
            var dx = sphere.getX() - sphere.get('radius') - box.getMinX();
            if (dx <= 0)
                result = true;

            // Hitting right wall?
            dx = sphere.getX() + sphere.get('radius') - box.getMaxX();
            if (dx >= 0 && sphere.get('velocity').x > 0)
                result = true;

            // Hitting bottom wall?
            var dy = sphere.getY() - sphere.get('radius') - box.getMinY();
            if (dy <= 0 && sphere.get('velocity').y < 0)
                result = true;

            // Hitting top wall?
            dy = sphere.getY() + sphere.get('radius') - box.getMaxY();
            if (dy >= 0 && sphere.get('velocity').y > 0)
                result = true;
            
            return result;
        }

    };


    return SphereBoxCollisionExpert;
});
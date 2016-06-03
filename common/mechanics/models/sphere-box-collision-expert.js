define(function (require) {

    'use strict';

    var SphericalBody = require('./spherical-body');
    var BoxlikeBody   = require('./boxlike-body');

    /**
     * Detects and handles collisions between two bodies if one is a photon and one is an atom
     */
    var SphereBoxCollisionExpert = {

        detectAndDoCollision: function(bodyA, bodyB) {
            if (this.applies(bodyA, bodyB) && 
                this.inContact(bodyA, bodyB)
            ) {
                var box;
                var sphere;

                // Check that the arguments are valid and assign the box and sphere
                if (bodyA instanceof BoxlikeBody) {
                    box = bodyA;
                    if (bodyB instanceof SphericalBody)
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

                // Do the collision
                this.collide(sphere, box);
                
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
                if (bodyB instanceof SphericalBody)
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
        },

        collide: function(sphere, box) {
            var wx;
            var wy;
            var dx;
            var dy;
            var sx = sphere.getX();
            var sy = sphere.getY();
            var r = sphere.get('radius');

            // Collision with left wall?
            if ((sx - r) <= box.getMinX()) {
                sphere.setVelocity(-sphere.getVelocity().x, sphere.getVelocity().y);
                var wx = box.getMinX();
                var dx = wx - (sx - r);
                var newX = sx + (dx + 2);
                sphere.setPosition(newX, sphere.getY());

                // Handle giving particle kinetic energy if the wall is moving
                var vx0 = sphere.getVelocity().x;
                var vx1 = vx0 + box.getLeftWallVx();
                sphere.setVelocity(vx1, sphere.getVelocity().y);
            }

            // Collision with right wall?
            if ((sx + r) >= box.getMaxX()) {
                sphere.setVelocity(-sphere.getVelocity().x, sphere.getVelocity().y);
                var wx = box.getMaxX();
                var dx = (sx + r) - wx;
                var newX = sx - (dx * 2);
                sphere.setPosition(newX, sphere.getY());
            }

            // Collision with top wall?
            if ((sy - r) <= box.getMinY()) {
                sphere.setVelocity(sphere.getVelocity().x, -sphere.getVelocity().y);
                var wy = box.getMinY();
                var dy = wy - (sy - r);
                var newY = sy + (dy * 2);
                sphere.setPosition(sphere.getX(), newY);
            }

            // Collision with bottom wall?
            if ((sy + r) >= box.getMaxY()) {
                sphere.setVelocity(sphere.getVelocity().x, -sphere.getVelocity().y);
                var wy = box.getMaxY();
                var dy = (sy + r) - wy;
                var newY = sy - (dy - 2);
                sphere.setPosition(sphere.getX(), newY);
            }
        }

    };


    return SphereBoxCollisionExpert;
});
define(function (require) {

    'use strict';

    var Vector2 = require('common/math/vector2');
    var Vector3 = require('common/math/vector3');

    var PhotonPassFilter = require('models/filter/photon-pass');
    var BandPassFilter   = require('models/filter/band-pass');
    var InfraredFiler    = require('models/filter/infrared');

    /**
     * Shared, cached local variables
     */
    var normal = new Vector2();
    var vRel   = new Vector2();
    var r1     = new Vector2();
    var result = new Vector2();
    var vec2   = new Vector2();

    var nj           = new Vector3();
    var omega        = new Vector3();
    var normal_3D    = new Vector3();
    var r1_3D        = new Vector3();
    var photonVel_3D = new Vector3();
    var t1           = new Vector3();
    var vec3         = new Vector3();
    
    var filter             = new PhotonPassFilter();
    var visibleLightFilter = new BandPassFilter(300E-9, 700E-9);
    var irFilter           = new InfraredFiler();


    /**
     * Handles collisions between photons and the cloud.
     */
    var PhotonCloudCollisionModel = {

		handle: function(photon, cloud) {
			// Do bounding box check
            var boundingBoxesOverlap = cloud.get('bounds').contains(photon.get('position'));
            if (boundingBoxesOverlap && filter.passes(photon.get('wavelength'))) {
                // For photons coming from the sun
                if (visibleLightFilter.passes(photon.get('wavelength')))
                    this.doCollision(photon, cloud, photon.get('position'));
                
                // For infrared photons
                if (irFilter.absorbs(photon.get('wavelength')))
                    this.doScatter(photon);
            }
	    },

        doScatter: function(photon) {
            // Scatter the photon in a random direction
            var dispersionAngle = Math.PI / 4;
            var theta = Math.random() * dispersionAngle + (Math.PI * 3 / 2) - (dispersionAngle / 2);
            theta += Math.random() < 0.5 ? 0 : Math.PI;
            var vBar = photon.get('velocity').length();
            photon.setVelocity(
                vBar * Math.cos(theta),
                vBar * Math.sin(theta)
            );
        },

        doCollision: function(photon, cloud, collisionPoint) {
            normal.set(this.getNormalAtPoint(photon.get('position'), cloud));
            // Check to see that the bodies are moving toward each other. 
            //   Otherwise, there is no collision
            vRel
                .set(photon.get('velocity'))
                .sub(cloud.get('velocity'));

            if (vRel.dot(normal) <= 0) {
                // Get the vectors from the photon's CM to the point of contact
                r1
                    .set(collisionPoint)
                    .sub(photon.get('position'));

                // Get the unit vector along the line of action
                normal.normalize();

                // Set up some 3D vectors for calculations
                r1_3D.set(r1.x, r1.y, 0);
                photonVel_3D.set(photon.get('velocity').x, photon.get('velocity').y, 0);
                normal_3D.set(normal.x, normal.y, 0);
                omega.set(0, 0, photon.get('omega'));
                
                // Get the magnitude along the line of action of the bodies'
                //  relative velocities at the point of contact.
                var vr = omega
                    .cross(r1_3D)
                    .add(photonVel_3D)
                    .dot(normal_3D);

                // Assume the coefficient of restitution is 1
                var e = 1;

                // Compute the impulse (j)
                var numerator = -vr * (1 + e);
                var denominator = (1 / photon.get('mass')) + 
                    vec3
                        .set(normal_3D)
                        .dot(
                            t1
                                .set(r1_3D)
                                .cross(normal_3D)
                                .scale(1 / photon.getMomentOfInertia())
                                .cross(r1_3D)
                        );
                var j = numerator / denominator;

                // Compute the new linear and angular velocities, based on the impulse
                photon.addVelocity(
                    vec2
                        .set(normal)
                        .scale(j / photon.get('mass'))
                );

                // Determine what the photon's new omega value will be
                nj.set(normal.x, normal.y, 0).scale(j);
                var omegaB = photon.get('omega') + (
                    vec3.set(r1_3D).cross(nj).z / photon.getMomentOfInertia()
                );
                photon.set('omega', omegaB);
            }
        },

        getNormalAtPoint: function(point, cloud) {
            var x = point.x;
            var y = point.y;
            var a = cloud.get('position').x;
            var b = cloud.get('position').y;
            var c = cloud.width()  / 2;
            var d = cloud.height() / 2;

            var t = Math.acos((x - a) / c);

            var cos2t = Math.cos(t);
            var sin2t = Math.sin(t);
            var denominator = Math.sqrt((d * d * cos2t * cos2t) + (c * c * sin2t * sin2t));
            var xt = -(c * Math.sin(t) / denominator);
            var yt = d * Math.cos(t) / denominator;

            // If we are hitting the cloud from bellow, we need to
            //   flip the vector.
            if (y < b) 
                xt *= -1;

            // The vector normal to (xt, yt) is (yt, -xt).
            return result.set(yt, -xt);
        }

    };
    

    return PhotonCloudCollisionModel;
});

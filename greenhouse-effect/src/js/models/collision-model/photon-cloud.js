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
    var loa    = new Vector2();
    var n      = new Vector2();
    var vRel   = new Vector2();
    var r1     = new Vector2();
    var result = new Vector2();

    var nj = new Vector3();
    
    var filter = new PhotonPassFilter();
    var visibleLightFilter = new BandPassFilter(300E-9, 700E-9);
    var irFilter = new InfraredFiler();


    /**
     * Handles collisions between photons and the cloud.
     */
    var PhotonCloudCollisionModel = {

		handle: function(photon, cloud) {
			// Do bounding box check
            var boundingBoxesOverlap = cloud.get('bounds').contains(photon.get('position'));
            if (boundingBoxesOverlap && filter.passes(photon.get('wavelength'))) {
                if (visibleLightFilter.passes(photon.get('wavelength'))) {
                    loa.set(this.getNormalAtPoint(photon.get('position'), cloud));
                    this.doCollision(photon, cloud, loa, photon.get('location'));
                }
                
                if (irFilter.absorbs(photon.get('wavelength')))
                    this.doScatter(photon);
            }
	    },

        doScatter: function(photon) {

        },

        doCollision: function(bodyA, bodyB, loa, collisionPoint) {

        },

        getNormalAtPoint: function(point, cloud) {
            var x = p.x;
            var y = p.y;
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

            return result.set(xt, yt);
        }

    };
    

    return PhotonCloudCollisionModel;
});

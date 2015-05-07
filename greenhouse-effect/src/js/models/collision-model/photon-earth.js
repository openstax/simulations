define(function (require) {

    'use strict';

    var Vector2 = require('common/math/vector2');

    var Earth = require('models/earth');

    /**
     * Shared, cached local variables
     */
    var loa = new Vector2();

    /**
     * Handles collisions between photons and the earth.
     */
    var PhotonEarthCollisionModel = {

		handle: function(photon, earth) {
			var separation = Math.abs(photon.get('position').distance(earth.get('position')));
			if (separation <= Earth.RADIUS) {
				loa.set(
					photon.get('position').x - earth.get('position').x,
					photon.get('position').y - earth.get('position').y
				);
				earth.absorbPhoton(photon);
			}

			if (earth.getReflectivity(photon) >= Math.random())
				photon.setVelocity(photon.get('velocity').x, -photon.get('velocity').y);
	    }

    };
    

    return PhotonEarthCollisionModel;
});

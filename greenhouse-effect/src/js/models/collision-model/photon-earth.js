define(function (require) {

    'use strict';

    var Vector2 = require('common/math/vector2');

    var Earth = require('models/earth');

    /**
     * Handles collisions between photons and the earth.
     */
    var PhotonEarthCollisionModel = {

		handle: function(photon, earth) {
			var separation = Math.abs(photon.get('position').distance(earth.get('position')));
			if (separation <= Earth.RADIUS)
				earth.absorbPhoton(photon);

			if (earth.getReflectivity(photon) >= Math.random())
				photon.setVelocity(photon.get('velocity').x, -photon.get('velocity').y);
	    }

    };
    

    return PhotonEarthCollisionModel;
});

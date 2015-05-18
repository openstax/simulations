define(function (require) {

    'use strict';

    var Vector2          = require('common/math/vector2');
    var LineIntersection = require('common/math/line-intersection');

    var InfraredFilter = require('models/filter/infrared');
    var Photon = require('models/photon');

    /**
     * Shared, cached local variables
     */
    var infraredFilter = new InfraredFilter();
    var p0 = new Vector2();
    var p1 = new Vector2();

    /**
     * Handles collisions between photons and the earth.
     */
    var PhotonGlassPaneCollisionModel = {

		handle: function(photon, glassPane, deltaTime) {
			if (infraredFilter.absorbs(photon.get('wavelength'))) {
                p0.set(
                    photon.get('position').x - photon.get('velocity').x * deltaTime,
                    photon.get('position').y - photon.get('velocity').y * deltaTime
                );

                p1.set(photon.get('position'));

                var photonCrossedGlassPaneCenterline = LineIntersection.linesIntersect(
                    // First line
                    glassPane.get('bounds').x,
                    glassPane.get('bounds').y + glassPane.get('bounds').h / 2,
                    glassPane.get('bounds').x + glassPane.get('bounds').w,
                    glassPane.get('bounds').y + glassPane.get('bounds').h / 2,

                    // Second line
                    p0.x, 
                    p0.y, 
                    p1.x, 
                    p1.y
                );

                // if (photonCrossedGlassPaneCenterline)
                //     console.log(
                //         // Second line
                //         p0.x, 
                //         p0.y, 
                //         p1.x, 
                //         p1.y
                //     )

                if (photonCrossedGlassPaneCenterline)
                    this.doScatter(photon, glassPane);
            }
	    },

        doScatter: function(photon, glassPane) {
            var newPhoton = new Photon({
                wavelength: photon.get('wavelength'),
                source: glassPane
            });

            // Scatter the photon in a random direction
            var dispersionAngle = Math.PI / 2;
            var theta = Math.random() * dispersionAngle + (Math.PI * 3 / 2) - (dispersionAngle / 2);
            theta += Math.random() < 0.5 ? 0 : Math.PI;
            var vBar = photon.get('velocity').length();
            newPhoton.setVelocity(
                vBar * Math.cos(theta),
                vBar * Math.sin(theta)
            );

            var y = glassPane.get('bounds').y;
            if (theta % (2 * Math.PI) < Math.PI)
                y = glassPane.get('bounds').top();
            else
                y = glassPane.get('bounds').bottom();

            var x = Math.random() * glassPane.width() + glassPane.get('bounds').x;

            newPhoton.setPosition(x, y);

            photon.setVelocity(0, 0);

            glassPane.absorbPhoton(photon);
            glassPane.emitPhoton(newPhoton);
            //console.log('scatter')
        }

    };
    

    return PhotonGlassPaneCollisionModel;
});

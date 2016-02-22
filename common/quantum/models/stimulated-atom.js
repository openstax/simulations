define(function (require) {

    'use strict';

    var Rectangle = require('common/math/rectangle');

    var Photon = require('./photon');

    /**
     * Extends photon to add static functions to produce photons due to stimulated emission.
     */
    var StimulatedPhoton = Photon.extend({}, {

        separation: 9,

        // The bounds within which a stimulated photon must be created. This keeps them
        //   inside the laser cavity
        stimulationBounds: new Rectangle(),

        setStimulationBounds: function(stimulationBounds) {
            StimulatedPhoton.stimulationBounds = stimulationBounds;
        },

        getSeparation: function() {
            return StimulatedPhoton.separation;
        },

        setSeparation: function(separation) {
            StimulatedPhoton.separation = separation;
        },

        createStimulated: function(stimulatingPhoton, location, atom) {
            var newPhoton = new Photon({
                wavelength: stimulatingPhoton.get('wavelength'), 
                position: location,
                velocity: stimulatingPhoton.get('velocity')
            );

            var idx = 1;
            var yOffset = StimulatedPhoton.separation;
            var sign = idx % 2 === 0 ? 1 : -1;
            var dy = yOffset *  sign * (stimulatingPhoton.get('velocity').x / stimulatingPhoton.get('velocity').length());
            var dx = yOffset * -sign * (stimulatingPhoton.get('velocity').y / stimulatingPhoton.get('velocity').length());
            var newY = stimulatingPhoton.getY() + dy;
            var newX = stimulatingPhoton.getX() + dx;

            // Keep the photon inside the cavity.
            var minY = stimulationBounds.bottom() + Photon.RADIUS;
            var maxY = stimulationBounds.top();
            if (newY < minY || newY > maxY) {
                newY = atom.getY();
                newX = atom.getX() - Photon.RADIUS;
            }

            newPhoton.setPosition(newX, newY);

            return newPhoton;
        }

        
    });

    return StimulatedPhoton;
});
define(function (require) {

    'use strict';

    var Rectangle = require('common/math/rectangle');

    var VanillaPhoton = require('./photon-vanilla');

    /**
     * Extends photon to add static functions to produce photons due to stimulated emission.
     */
    var StimulatedVanillaPhoton = VanillaPhoton.extend({}, {

        separation: 9,

        // The bounds within which a stimulated photon must be created. This keeps them
        //   inside the laser cavity
        stimulationBounds: new Rectangle(),

        setStimulationBounds: function(stimulationBounds) {
            StimulatedVanillaPhoton.stimulationBounds = stimulationBounds;
        },

        getSeparation: function() {
            return StimulatedVanillaPhoton.separation;
        },

        setSeparation: function(separation) {
            StimulatedVanillaPhoton.separation = separation;
        },

        createStimulated: function(stimulatingPhoton, location, atom) {
            var newPhoton = VanillaPhoton.create({
                wavelength: stimulatingPhoton.get('wavelength'), 
                position: location,
                velocity: stimulatingPhoton.get('velocity')
            });

            var idx = 1;
            var yOffset = StimulatedVanillaPhoton.separation;
            var sign = idx % 2 === 0 ? 1 : -1;
            var dy = yOffset *  sign * (stimulatingPhoton.get('velocity').x / stimulatingPhoton.get('velocity').length());
            var dx = yOffset * -sign * (stimulatingPhoton.get('velocity').y / stimulatingPhoton.get('velocity').length());
            var newY = stimulatingPhoton.getY() + dy;
            var newX = stimulatingPhoton.getX() + dx;

            // Keep the photon inside the cavity.
            var minY = StimulatedVanillaPhoton.stimulationBounds.bottom() + VanillaPhoton.RADIUS;
            var maxY = StimulatedVanillaPhoton.stimulationBounds.top();
            if (newY < minY || newY > maxY) {
                newY = atom.getY();
                newX = atom.getX() - VanillaPhoton.RADIUS;
            }

            newPhoton.setPosition(newX, newY);

            return newPhoton;
        }

        
    });

    return StimulatedVanillaPhoton;
});
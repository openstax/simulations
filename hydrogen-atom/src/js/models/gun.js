define(function (require) {

    'use strict';

    var _ = require('underscore');

    var PositionableObject = require('common/models/positionable-object');
    
    var Constants = require('constants');

    /**
     * Gun is the model of a gun that can fire either photons or alpha particles.
     * It is located at a point in space with a specific orientation and it 
     * has a nozzle with a specific width.
     * The gun's local origin is at the center of its nozzle.
     * When firing photons, it shoots a beam of light that wavelength and intensity.
     * When firing alpha particles, it shoots alpha particles with some intensity.
     */
    var Gun = PositionableObject.extend({

        defaults: _.extend({}, PositionableObject.prototype.defaults, {
            orientation: 0, // In radians
            private boolean _enabled; // is the gun on or off?
            private GunMode _mode; // is the gun firing photons or alpha particles?
            private double _nozzleWidth; // width of the beam
            private LightType _lightType; // type of light (white or monochromatic)
            private double _lightIntensity; // intensity of the light, 0.0-1.0
            private double _wavelength; // wavelength of the light
            private double _minWavelength, _maxWavelength; // range of wavelength
            private double _alphaParticlesIntensity; // intensity of the alpha particles, 0.0-1.0
        }),

        initialize: function(attributes, options) {
            PositionableObject.prototype.initialize.apply(this, [attributes, options]);

            
        }

    });

    return Gun;
});
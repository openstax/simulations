define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Law = require('models/law');

    /**
     * 
     */
    var ParticleLaw = function(propagator) {};

    /**
     * Instance functions/properties
     */
    _.extend(ParticleLaw.prototype, Law.prototype, {

        update: function(deltaTime, system) {
            for (var i = 0; i < system.particles.length; i++) {
                var particle = system.particles[i];
                if (particle.get('propagator'))
                    particle.get('propagator').propagate(deltaTime, particle);
            }
        }

    });

    return ParticleLaw;
});

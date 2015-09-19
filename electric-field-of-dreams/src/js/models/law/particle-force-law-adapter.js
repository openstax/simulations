define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var Law = require('models/law');

    /**
     * 
     */
    var ParticleForceLawAdapter = function(particles, forceLaw) {
        this.particles = particles;
        this.forceLaw = forceLaw;

        this._totalForce = new Vector2();
    };

    /**
     * Instance functions/properties
     */
    _.extend(ParticleForceLawAdapter.prototype, Law.prototype, {

        update: function(deltaTime, system) {
            var totalForce = this._totalForce;
            var particles = this.particles;

            for (var i = 0; i < particles.length; i++) {
                totalForce.set(0, 0);
                for (var j = 0; j < particles.length; j++) {
                    totalForce.add(this.forceLaw.getForce(particles[j], particles[i]));
                }

                var mass = particles[i].get('pass');
                var forceOverMass = totalForce.scale(1 / mass);
                var oldAcc = particles[i].get('acceleration');
                var newAcc = oldAcc.add(forceOverMass);

                particles[i].setAcceleration(newAcc);
            }
        }

    });

    return ParticleForceLawAdapter;
});

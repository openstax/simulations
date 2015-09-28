define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Force = require('models/force');

    /**
     * 
     */
    var CoulombForce = function(params, system) {
        this.system = system;
        this.params = params;
    };

    /**
     * Instance functions/properties
     */
    _.extend(CoulombForce.prototype, Force.prototype, {

        getForce: function(wireParticle) {
            var sum = 0;
            var particles = this.system.particles;
            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];
                if (p !== wireParticle && p.wirePatch == wireParticle.wirePatch)
                    sum += this.params.getForce(p.position, p.charge, wireParticle.position, wireParticle.charge);
            }
            return sum;
        }

    });

    return CoulombForce;
});

define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Force = require('models/force');

    /**
     * Force from the beginning of 'a' onto the end of 'b'.
     */
    var AdjacentPatchCoulombForceBeginningToEnd = function(params, system, a, b) {
        this.a = a; // WirePatch a
        this.b = b; // WirePatch b
        this.system = system;
        this.params = params;
    };

    /**
     * Instance functions/properties
     */
    _.extend(AdjacentPatchCoulombForceBeginningToEnd.prototype, Force.prototype, {

        getForce: function(wireParticle) {
            var sum = 0;
            var particles = this.system.particles;
            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];
                if (p !== wireParticle && p.wirePatch === this.a && wireParticle.wirePatch === this.b) {
                    sum += this.params.getForce(
                        p.position + this.b.getLength(), 
                        p.charge, 
                        wireParticle.position, 
                        wireParticle.charge
                    );
                }
            }
            return sum;
        }

    });

    return AdjacentPatchCoulombForceBeginningToEnd;
});

define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Force = require('models/force');

    /**
     * Force from the end of 'a' onto the beginning of 'b'.
     */
    var AdjacentPatchCoulombForceEndToBeginning = function(params, system, a, b) {
        this.a = a; // WirePatch a
        this.b = b; // WirePatch b
        this.system = system;
        this.params = params;
    };

    /**
     * Instance functions/properties
     */
    _.extend(AdjacentPatchCoulombForceEndToBeginning.prototype, Force.prototype, {

        getForce: function(wireParticle) {
            var sum = 0;
            var particles = this.system.particles;
            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];
                if (p !== wireParticle) {
                    if (p.wirePatch === this.a && wireParticle.wirePatch === this.b) {
                        sum += params.getForce(
                            p.position, 
                            p.charge, 
                            wireParticle.position + this.a.getLength(), 
                            wireParticle.charge
                        );
                    }
                    else {
                        console.error('different patches');
                    }
                }
            }
            return sum;
        }

    });

    return AdjacentPatchCoulombForceEndToBeginning;
});

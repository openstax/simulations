define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Law = require('models/law');

    /**
     * This class isn't actually necessary, but it explains within the system how
     *   a Propagator object can be placed in the laws array in the system...
     */
    var WireSystem = function(propagator) {
        this.particles = [];
    };

    /**
     * Instance functions/properties
     */
    _.extend(WireSystem.prototype, Law.prototype, {

        update: function(deltaTime, system) {
            for (var i = 0; i < this.particles.length; i++) {
                this.particles[i].propagate(deltaTime);
            }
        }

    });

    return WireSystem;
});

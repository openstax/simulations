define(function (require) {

    'use strict';

    var _ = require('underscore');

    /**
     * Resets particle collisions when voltage changes signs.
     */
    var ResetScatterability = function(wireSystem) {
        this.wireSystem = wireSystem;
        this.pos = false;
    };

    /**
     * Instance functions/properties
     */
    _.extend(ResetScatterability.prototype, {

        doChange: function() {
            for (var i = 0; i < this.wireSystem.particles.length; i++)
                this.wireSystem.particles[i].forgetCollision();
        },

        voltageChanged: function(voltage) {
            if (voltage < 0 && this.pos) {
                this.pos = false;
                this.doChange();
            }
            else if (voltage > 0 && !this.pos) {
                this.pos = true;
                this.doChange();
            }
        }

    });

    return ResetScatterability;
});

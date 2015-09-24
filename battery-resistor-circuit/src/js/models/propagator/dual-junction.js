define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Propagator = require('models/propagator');

    /**
     * This matches the high end of a and the low end of b.
     */
    var DualJunctionPropagator = function(a, b) {
        this.a = a;
        this.b = b;
    };

    /**
     * Instance functions/properties
     */
    _.extend(DualJunctionPropagator.prototype, Propagator.prototype, {

        propagate: function(deltaTime, particle) {
            if (p.wirePatch == this.a && p.position >= this.a.getLength()) {
                p.wirePatch = this.b;
                p.position = 1; // Original PhET note: This should maybe be b.getScalarStart().
            }
            else if (p.wirePatch == this.b && p.position <= 0) {
                p.wirePatch = this.a;
                p.position = this.a.getLength() - 4;
            }
        }

    });

    return DualJunctionPropagator;
});

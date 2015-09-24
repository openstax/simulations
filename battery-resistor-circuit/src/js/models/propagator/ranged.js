define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Propagator = require('models/propagator');

    /**
     * This matches the high end of a and the low end of b.
     */
    var RangedPropagator = function() {
        this.rangedProps = [];
        this.inverseRangedProps = [];
    };

    /**
     * Instance functions/properties
     */
    _.extend(RangedPropagator.prototype, Propagator.prototype, {

        propagate: function(deltaTime, particle) {
            var i;
            var rangedProp;

            for (i = 0; i < this.rangedProps.length; i++) {
                rangedProp = this.rangedProps[i];
                if (rangedProp.wireRegion.contains(particle))
                    rangedProp.propagator.propagate(deltaTime, particle);
            }

            for (i = 0; i < this.inverseRangedProps.length; i++) {
                rangedProp = this.inverseRangedProps[i];
                if (rangedProp.wireRegion.contains(particle))
                    rangedProp.propagator.propagate(deltaTime, particle);
            }
        },


        addInverse: function(out, prop) {
            this.inverseRangedProps.push({
                wireRegion: out, 
                propagator: prop
            });
        },

        addPropagator: function(range, prop) {
            this.rangedProps.push({
                wireRegion: range, 
                propagator: prop
            });
        }

    });

    return RangedPropagator;
});

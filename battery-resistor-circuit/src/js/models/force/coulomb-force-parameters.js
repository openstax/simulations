define(function (require) {

    'use strict';

    var _ = require('underscore');

    var CoulombForceParameters = function(k, power, minDist) {
        this.k = k;
        this.power = power;
        this.maxDist = Number.POSITIVE_INFINITY;
        this.minDist = (minDist !== undefined) ? minDist : 0;
    };

    /**
     * Instance functions/properties
     */
    _.extend(CoulombForceParameters.prototype, {

        getForce: function(sourceX, sourceQ, testX, testQ) {
            var dx = sourceX - testX;
            var r = Math.abs(dx);

            if (r < this.minDist)
                r = this.minDist;
            else if (r > this.maxDist)
                r = this.maxDist;
            
            var term = this.k * Math.pow(r, this.power) * sourceQ * testQ;
            if (dx > 0)
                term *= -1;

            return term;
        },

        setMinDistance: function(distance) {
            this.minDist = distance;
        }

    });

    return CoulombForceParameters;
});

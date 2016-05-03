define(function (require) {

    'use strict';

    var _ = require('underscore');

    var ReflectionStrategy = require('./reflection-strategy');

    /**
     * A ReflectionStrategy that reflects to the left. That is, it reflects
     *   photons that are traveling to the right.
     */
    var LeftReflectionStrategy = function(cutoffLow, cutoffHigh) {
        ReflectionStrategy.apply(this, arguments);
    };

    _.extend(LeftReflectionStrategy.prototype, ReflectionStrategy.prototype, {

        reflects: function(photon) {
            return (photon.getVelocity().x > 0);
        }

    });


    return LeftReflectionStrategy;
});
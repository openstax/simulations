define(function (require) {

    'use strict';

    var _ = require('underscore');

    var MotionObject = require('common/models/motion-object');

    /**
     * This is a particle that can move independently in 2D space.  It is
     *   different from a WireParticle in that it isn't constrained to 
     *   the path of a wire and moves in two dimensions instead of one.
     *
     * Note that this is a departure in naming from the original.  I made
     *   it "free particle" instead of just "particle" because this
     *   particle and the wire particle don't share a common ancestor.
     *   That made things confusing when coding the interactions between
     *   "particles" and "wire particles" because they have different
     *   interfaces and don't work in the same dimensions, but the names
     *   would lead one to think that a WireParticle is just a kind of
     *   Particle.
     */
    var FreeParticle = MotionObject.extend({

        defaults: _.extend({}, MotionObject.prototype.defaults, {
            charge: 1,
            mass: 1
        }),

        initialize: function(attributes, options) {
            MotionObject.prototype.initialize.apply(this, arguments);
        }

    });

    return FreeParticle;
});

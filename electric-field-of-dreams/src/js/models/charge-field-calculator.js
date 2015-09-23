define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    /**
     * This was called ChargeFieldSource in the original, but I've renamed it because
     *   the name misled me to believe it was something that actually affected the
     *   electric field, when in fact it was only used to calculate the field at a
     *   given point.
     */
    var ChargeFieldCalculator = function(particles, k, max) {
        this.particles = particles;
        this.k = k;
        this.max = max;

        this._field = new Vector2();
        this._particleField = new Vector2();
    };

    /**
     * Instance functions/properties
     */
    _.extend(ChargeFieldCalculator.prototype, {

        getFieldAt: function(x, y) {
            var field = this._field.set(0, 0);
            
            for (var i = 0; i < this.particles.length; i++) {
                var particle = this.particles.at(i);

                field.add(this.getParticleFieldAt(particle, x, y));
            }
            
            return field;
        },

        getParticleFieldAt: function(particle, x, y) {
            var q = particle.get('charge');
            var r = this._particleField
                .set(x, y)
                .sub(particle.get('position'));

            var dist = r.length();
            if (dist === 0)
                return r.set(0, 0);

            var scale = Math.pow(dist, -3) * this.k * q;
            r.scale(scale);

            var mag = r.length();
            if (mag > this.max) {
                var rescale = this.max / mag;
                r.scale(rescale);
            }

            return r;
        }

    });

    return ChargeFieldCalculator;
});

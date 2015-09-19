define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var Law = require('models/law');

    /**
     * 
     */
    var CoulombsLaw = function(k, range, minDist) {
        this.k = k;
        this.range = (range !== undefined) ? range : 1.7976931348623157e+308;
        this.minDist = (minDist !== undefined) ? minDist : 0;

        this._force = new Vector2();
        this._direction = new Vector2();
    };

    /**
     * Instance functions/properties
     */
    _.extend(CoulombsLaw.prototype, Law.prototype, {

        getForce: function(particle, particle1) {
            var dist = particle.get('position').distance(particle1.get('position'));
            if (dist < this.minDist)
                dist = this.minDist;

            if (dist > this.range)
                return this._force.set(0, 0);

            var distCubed = Math.pow(dist, 3);
            // Just have to vent here: The original version used d, d1, d2 to name Doubles
            //   instead of using actual descriptive names for variables.  At least they
            //   named the class as Coulomb's Law so I knew what was going on.
            var forceMagnitude = (-this.k * particle.get('charge') * particle1.get('charge')) / distCubed;

            var direction = this._direction
                .set(particle.get('position'))
                .sub(particle1.get('position'));

            if (!isFinite(forceMagnitude) || isNaN(forceMagnitude) || isNaN(direction.x) || isNaN(direction.y))
                return this._force.set(0, 0);

            return direction.scale(forceMagnitude);
        }

    });

    return CoulombsLaw;
});

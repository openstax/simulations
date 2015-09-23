define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var Law = require('models/law');

    /**
     * 
     */
    var ElectricForceLaw = function() {
        this.field = new Vector2();

        this._field = new Vector2();
        this._acc   = new Vector2();
    };

    /**
     * Instance functions/properties
     */
    _.extend(ElectricForceLaw.prototype, Law.prototype, {

        update: function(deltaTime, system) {
            for (var i = 0; i < system.particles.length; i++) {
                var particle = system.particles.at(i);
                var force = this._field.set(this.field).scale(particle.get('charge')); // f = qE
                // f = ma
                var mass = particle.get('mass');
                var forceOverMass = force.scale(1 / mass);
                var oldAcc = this._acc.set(particle.get('acceleration'));
                var newAcc = oldAcc.add(forceOverMass);

                particle.setAcceleration(newAcc);
            }
        }

    });

    return ElectricForceLaw;
});

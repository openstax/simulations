define(function (require) {

    'use strict';

    var _ = require('underscore');

    var PhysicsUtil = require('common/quantum/models/physics-util');


    var InitialElectronSpeedStrategy = function() {};

    _.extend(InitialElectronSpeedStrategy.prototype, {

        determineNewElectronSpeed: function(energy) {}

    });


    /**
     * Returns an initial speed based soley on the energy the electron has. Always returns
     *   the same speed for a given energy.
     */
    var Uniform = function(scaleFactor) {
        InitialElectronSpeedStrategy.apply(this, arguments);

        this.scaleFactor = scaleFactor;
    };

    _.extend(Uniform.prototype, InitialElectronSpeedStrategy.prototype, {

        determineNewElectronSpeed: function(energy) {
            var speed = Math.sqrt(2 * energy / PhysicsUtil.ELECTRON_MASS) * this.scaleFactor;
            return speed;
        }

    });

    /**
     * Returns an initial speed that is randomly distributed between the speed the electron
     *   would have if its kinetic energy were equal to a specified energy, and a specified
     *   minimum speed.
     */
    var Randomized = function(scaleFactor, minSpeed) {
        Uniform.apply(this, [scaleFactor]);

        this.minSpeed = minSpeed;
    };

    _.extend(Randomized.prototype, Uniform.prototype, {

        determineNewElectronSpeed: function(energy) {
            var maxSpeed = Uniform.prototype.determineNewElectronSpeed.apply(this, arguments);

            // Speed is randomly distributed between the max speed and a minimum speed.
            var speed = maxSpeed * Math.random();
            speed = Math.max(speed, this.minSpeed);
            return speed;
        }

    });


    InitialElectronSpeedStrategy.Uniform = Uniform;
    InitialElectronSpeedStrategy.Randomized = Randomized;


    return InitialElectronSpeedStrategy;
});
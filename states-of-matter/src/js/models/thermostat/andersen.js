
define(function(require) {

    'use strict';

    var _ = require('underscore');
    var gaussRandom = require('gauss-random');

    var Thermostat = require('../thermostat');

    /**
     * This class implements what is known as an Andersen Thermostat for adjusting
     *   the kinetic energy in a set of molecules toward a desired setpoint.
     */
    var AndersenThermostat = function(moleculeDataSet, minTemperature) {
        Thermostat.apply(this, [moleculeDataSet, minTemperature]);
    };

    _.extend(AndersenThermostat.prototype, Thermostat.prototype, {

        adjustTemperature: function() {
            var gammaX = 0.9999;
            var gammaY = gammaX;
            var temperature = this.targetTemperature;

            if (temperature <= this.minModelTemperature) {
                // Use a values that will cause the molecules to stop
                //   moving if we are below the minimum temperature, since
                //   we want to create the appearance of absolute zero.
                gammaX = 0.992;
                gammaY = 0.999; // Scale a little differently in Y direction so particles don't
                                //   stop falling when absolute zero is reached.
                temperature = 0;
            }

            var massInverse = 1 / this.moleculeDataSet.moleculeMass;
            var inertiaInverse = 1 / this.moleculeDataSet.moleculeRotationalInertia;
            var velocityScalingFactor = Math.sqrt(temperature * massInverse    * (1 - Math.pow(gammaX, 2)));
            var rotationScalingFactor = Math.sqrt(temperature * inertiaInverse * (1 - Math.pow(gammaX, 2)));

            for (var i = 0; i < this.moleculeDataSet.getNumberOfMolecules(); i++) {
                var xVel = this.moleculeVelocities[i].x * gammaX + gaussRandom() * velocityScalingFactor;
                var yVel = this.moleculeVelocities[i].y * gammaY + gaussRandom() * velocityScalingFactor;
                this.moleculeVelocities[i].set(xVel, yVel);
                //console.log('before(' + i + '): ' + this.moleculeRotationRates[i]);
                //console.log(gammaX, rotationScalingFactor);
                this.moleculeRotationRates[i] = gammaX * this.moleculeRotationRates[i] + gaussRandom() * rotationScalingFactor;
                //console.log('after(' + i + '): ' + this.moleculeRotationRates[i]);
            }
        },

        setTargetTemperature: function(temperature) {
            this.targetTemperature = temperature;
        }

    });

    return AndersenThermostat;
});
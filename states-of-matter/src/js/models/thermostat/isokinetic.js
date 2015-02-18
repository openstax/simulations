
define(function(require) {

    'use strict';

    var _ = require('underscore');
    var gaussRandom = require('gauss-random');

    var Thermostat = require('../thermostat');

    /**
     * This class implements what is known as an Andersen Thermostat for adjusting
     *   the kinetic energy in a set of molecules toward a desired setpoint.
     */
    var IsokineticThermostat = function(moleculeDataSet, minTemperature) {
        Thermostat.apply(this, [moleculeDataSet, minTemperature]);
    };

    _.extend(IsokineticThermostat.prototype, Thermostat.prototype, {

        adjustTemperature: function(temperature) {
            if (temperature !== undefined)
                this._adjustTemperature(temperature);
            else
                this._adjustTemperatureFromMeasured();
        },

        _adjustTemperatureFromMeasured: function() {
            var measuredTemperature;
            var numberOfMolecules = this.moleculeDataSet.getNumberOfMolecules();
            if (this.moleculeDataSet.atomsPerMolecule > 1) {
                // Include rotational inertia in the calculation.
                var centersOfMassKineticEnergy = 0;
                var rotationalKineticEnergy = 0;
                for (var i = 0; i < numberOfMolecules; i++ ) {
                    centersOfMassKineticEnergy += 0.5 * this.moleculeDataSet.moleculeMass * (
                        Math.pow(this.moleculeVelocities[i].x, 2) + Math.pow(this.moleculeVelocities[i].y, 2)
                    );
                    rotationalKineticEnergy += 0.5 * this.moleculeDataSet.moleculeRotationalInertia * Math.pow(this.moleculeRotationRates[i], 2);
                }
                measuredTemperature = (centersOfMassKineticEnergy + rotationalKineticEnergy) / numberOfMolecules / 1.5;
            }
            else {
                var centersOfMassKineticEnergy = 0;
                for (var i = 0; i < this.moleculeDataSet.getNumberOfMolecules(); i++ ) {
                    // For single-atom molecules, exclude rotational inertia from the calculation.
                    centersOfMassKineticEnergy += 0.5 * this.moleculeDataSet.moleculeMass * (
                        Math.pow(this.moleculeVelocities[i].x, 2) + Math.pow(this.moleculeVelocities[i].y, 2)
                    );
                }
                measuredTemperature = centersOfMassKineticEnergy / numberOfMolecules;
            }

            // Adjust the temperature.
            this._adjustTemperature(measuredTemperature);
        },

        _adjustTemperature: function(measuredTemperature) {
            // Calculate the scaling factor that will be used to adjust the
            //   temperature.
            var temperatureScaleFactor;
            if (this.targetTemperature <= this.minModelTemperature)
                temperatureScaleFactor = 0;
            else
                temperatureScaleFactor = Math.sqrt(this.targetTemperature / measuredTemperature);

            // Adjust the temperature by scaling the velocity of each molecule
            //   by the appropriate amount.
            var numberOfMolecules = this.moleculeDataSet.getNumberOfMolecules();
            for (var i = 0; i < numberOfMolecules; i++) {
                this.moleculeVelocities[i].set(
                    this.moleculeVelocities[i].x * temperatureScaleFactor,
                    this.moleculeVelocities[i].y * temperatureScaleFactor
                );
                this.moleculeRotationRates[i] *= temperatureScaleFactor; // Doesn't hurt anything in the monatomic case.
            }
        },

        setTargetTemperature: function(temperature) {
            this.targetTemperature = temperature;
        }

    });

    return IsokineticThermostat;
});
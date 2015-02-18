define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Constants = require('constants');

    /**
     * Used to adjust the temperature of a system.
     */
    var Thermostat = function(moleculeDataSet, minTemperature) {
        this.moleculeDataSet = moleculeDataSet;
        this.targetTemperature = Constants.SOMSimulation.INITIAL_TEMPERATURE;
        this.minModelTemperature = minTemperature;

        // Set up references to the various arrays within the data set so that
        //   the calculations can be performed as fast as is possible.
        this.moleculeVelocities    = moleculeDataSet.moleculeVelocities;
        this.moleculeRotationRates = moleculeDataSet.moleculeRotationRates;
    };

    /**
     * Instance functions/properties
     */
    _.extend(Thermostat.prototype, {

        setTargetTemperature: function(temperature) {},

        adjustTemperature: function() {}

    });


    return Thermostat;
});

define(function (require) {

    'use strict';

    var DischargeLampElementProperties = require('discharge-lamps/models/element-properties');
    var DefaultEnergyEmissionStrategy  = require('discharge-lamps/models/default-energy-emission-strategy');

    var MetalEnergyAbsorptionStrategy = require('models/metal-energy-absorption-strategy');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Calcium
     */
    var Calcium = DischargeLampElementProperties.extend({

        defaults: _.extend({}, DischargeLampElementProperties.prototype.defaults, {
            name: Constants.Calcium.NAME,
            energyAbsorptionStrategy: new MetalEnergyAbsorptionStrategy(Constants.Calcium.WORK_FUNCTION),
            energyEmissionStrategy: new DefaultEnergyEmissionStrategy(),
            workFunction: Constants.Calcium.WORK_FUNCTION,
            energyLevels: Constants.Calcium.ENERGY_LEVELS
        })

    }, Constants.Calcium);


    return Calcium;

});

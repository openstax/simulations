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
            name: Calcium.NAME,
            energyAbsorptionStrategy: new MetalEnergyAbsorptionStrategy(Calcium.WORK_FUNCTION),
            energyEmissionStrategy: new DefaultEnergyEmissionStrategy(),
            workFunction: Calcium.WORK_FUNCTION,
            energyLevels: Calcium.ENERGY_LEVELS
        })

    }, Constants.Calcium);


    return Calcium;

});

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
     * Copper
     */
    var Copper = DischargeLampElementProperties.extend({

        defaults: _.extend({}, DischargeLampElementProperties.prototype.defaults, {
            name: Copper.NAME,
            energyAbsorptionStrategy: new MetalEnergyAbsorptionStrategy(Copper.WORK_FUNCTION),
            energyEmissionStrategy: new DefaultEnergyEmissionStrategy(),
            workFunction: Copper.WORK_FUNCTION,
            energyLevels: Copper.ENERGY_LEVELS
        })

    }, Constants.Copper);

    return Copper;

});

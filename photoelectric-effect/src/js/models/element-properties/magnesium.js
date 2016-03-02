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
     * Magnesium
     */
    var Magnesium = DischargeLampElementProperties.extend({

        defaults: _.extend({}, DischargeLampElementProperties.prototype.defaults, {
            name: Constants.Magnesium.NAME,
            energyAbsorptionStrategy: new MetalEnergyAbsorptionStrategy(Constants.Magnesium.WORK_FUNCTION),
            energyEmissionStrategy: new DefaultEnergyEmissionStrategy(),
            workFunction: Constants.Magnesium.WORK_FUNCTION,
            energyLevels: Constants.Magnesium.ENERGY_LEVELS
        })

    }, Constants.Magnesium);

    return Magnesium;

});

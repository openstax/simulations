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
     * Platinum
     */
    var Platinum = DischargeLampElementProperties.extend({

        defaults: _.extend({}, DischargeLampElementProperties.prototype.defaults, {
            name: Platinum.NAME,
            energyAbsorptionStrategy: new MetalEnergyAbsorptionStrategy(Platinum.WORK_FUNCTION),
            energyEmissionStrategy: new DefaultEnergyEmissionStrategy(),
            workFunction: Platinum.WORK_FUNCTION,
            energyLevels: Platinum.ENERGY_LEVELS
        })

    }, Constants.Platinum);

    return Platinum;

});

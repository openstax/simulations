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
     * Zinc
     */
    var Zinc = DischargeLampElementProperties.extend({

        defaults: _.extend({}, DischargeLampElementProperties.prototype.defaults, {
            name: Zinc.NAME,
            energyAbsorptionStrategy: new MetalEnergyAbsorptionStrategy(Zinc.WORK_FUNCTION),
            energyEmissionStrategy: new DefaultEnergyEmissionStrategy(),
            workFunction: Zinc.WORK_FUNCTION,
            energyLevels: Zinc.ENERGY_LEVELS
        })

    }, Constants.Zinc);

    return Zinc;

});

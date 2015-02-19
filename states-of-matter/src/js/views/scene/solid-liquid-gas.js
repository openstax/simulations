define(function (require) {

    'use strict';

    var _ = require('underscore');

    var SOMSceneView = require('views/scene');

    var Constants = require('constants');


    var SolidLiquidGasSceneView = SOMSceneView.extend({

    	heaterCoolerPosition: Constants.SolidLiquidGasSceneView.HEATER_COOLER_POSITION,
    	particleTankPosition: Constants.SolidLiquidGasSceneView.TANK_POSITION,

        initialize: function(options) {
            SOMSceneView.prototype.initialize.apply(this, [options]);
        },

    }, Constants.SolidLiquidGasSceneView);

    return SolidLiquidGasSceneView;
});

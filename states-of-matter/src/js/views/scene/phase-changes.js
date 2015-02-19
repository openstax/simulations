define(function (require) {

    'use strict';

    var _ = require('underscore');

    var SOMSceneView      = require('views/scene');
    var PressureGaugeView = require('views/pressure-gauge');
    var HoseView          = require('views/hose');
    var PumpView          = require('views/pump');

    var Constants = require('constants');


    var PhaseChangesSceneView = SOMSceneView.extend({

        heaterCoolerPosition: Constants.PhaseChangesSceneView.HEATER_COOLER_POSITION,
        particleTankPosition: Constants.PhaseChangesSceneView.TANK_POSITION,
        particleTankInteractive: true,

        initialize: function(options) {
            SOMSceneView.prototype.initialize.apply(this, [options]);
        },

        initGraphics: function() {
            SOMSceneView.prototype.initGraphics.apply(this);

            this.initPressureGaugeView();
            this.initPumpView();
            this.initHoseView();
        },

        initPressureGaugeView: function() {
            this.pressureGaugeView = new PressureGaugeView({
                simulation: this.simulation
            });
            this.pressureGaugeView.connect(this.particleTankView.getLeftConnectorPosition());

            this.stage.addChild(this.pressureGaugeView.displayObject);
        },

        initPumpView: function() {
            this.pumpView = new PumpView({
                simulation: this.simulation
            });
            this.pumpView.displayObject.x = Math.floor(this.width  * PhaseChangesSceneView.PUMP_POSITION.x);
            this.pumpView.displayObject.y = Math.floor(this.height * PhaseChangesSceneView.PUMP_POSITION.y);

            this.stage.addChild(this.pumpView.displayObject);
        },

        initHoseView: function() {
            this.hoseView = new HoseView();
            this.hoseView.connect1(this.particleTankView.getRightConnectorPosition());
            this.hoseView.connect2(this.pumpView.getLeftConnectorPosition());

            this.stage.addChild(this.hoseView.displayObject);
        },

    }, Constants.PhaseChangesSceneView);

    return PhaseChangesSceneView;
});

define(function (require) {

    'use strict';

    var AppView = require('common/app/app');

    var SOMSceneView      = require('views/scene');
    var PressureGaugeView = require('views/pressure-gauge');
    var HoseView          = require('views/hose');
    var PumpView          = require('views/pump');

    var Constants = require('constants');


    var PhaseChangesSceneView = SOMSceneView.extend({

        heaterCoolerPosition: AppView.windowIsShort() ? 
            Constants.PhaseChangesSceneView.SHORT_SCREEN_HEATER_COOLER_POSITION : 
            Constants.PhaseChangesSceneView.HEATER_COOLER_POSITION,
            
        particleTankPosition: AppView.windowIsShort() ? 
            Constants.PhaseChangesSceneView.SHORT_SCREEN_TANK_POSITION :
            Constants.PhaseChangesSceneView.TANK_POSITION,

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

            var pumpPosition = AppView.windowIsShort() ? 
                PhaseChangesSceneView.SHORT_SCREEN_PUMP_POSITION : 
                PhaseChangesSceneView.PUMP_POSITION;

            this.pumpView.displayObject.x = Math.floor(this.width  * pumpPosition.x);
            this.pumpView.displayObject.y = Math.floor(this.height * pumpPosition.y);

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

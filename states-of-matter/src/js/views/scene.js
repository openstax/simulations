define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView = require('common/pixi/view/scene');

    var ParticleTankView  = require('views/particle-tank');
    var PressureGaugeView = require('views/pressure-gauge');
    var HoseView          = require('views/hose');
    var PumpView          = require('views/pump');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var SOMSceneView = PixiSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, arguments);
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            var tankY = Math.floor(this.height * 0.8);
            this.initParticleTankView(tankY);
            this.initPressureGaugeView();
            this.initPumpView(tankY);
            this.initHoseView();
        },

        initParticleTankView: function(y) {
            this.particleTankView = new ParticleTankView({
                simulation: this.simulation
            });
            this.particleTankView.displayObject.y = y;
            this.particleTankView.displayObject.x = Math.floor(this.width * 0.25);
            this.stage.addChild(this.particleTankView.displayObject);
        },

        initPressureGaugeView: function() {
            this.pressureGaugeView = new PressureGaugeView({
                simulation: this.simulation
            });
            this.pressureGaugeView.connect(this.particleTankView.getLeftConnectorPosition());

            this.stage.addChild(this.pressureGaugeView.displayObject);
        },

        initPumpView: function(y) {
            this.pumpView = new PumpView({
                simulation: this.simulation
            });
            this.pumpView.displayObject.y = y;
            this.pumpView.displayObject.x = Math.floor(this.width * 0.65);

            this.stage.addChild(this.pumpView.displayObject);
        },

        initHoseView: function() {
            this.hoseView = new HoseView();
            this.hoseView.connect1(this.particleTankView.getRightConnectorPosition());
            this.hoseView.connect2(this.pumpView.getLeftConnectorPosition());

            this.stage.addChild(this.hoseView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

    });

    return SOMSceneView;
});

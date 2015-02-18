define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView = require('common/pixi/view/scene');

    var ParticleTankView  = require('views/particle-tank');
    var PressureGaugeView = require('views/pressure-gauge');

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
        },

        initParticleTankView: function(y) {
            this.particleTankView = new ParticleTankView({
                simulation: this.simulation
            });
            this.particleTankView.displayObject.y = y;
            this.particleTankView.displayObject.x = Math.floor(this.width * 0.3);
            this.stage.addChild(this.particleTankView.displayObject);
        },

        initPressureGaugeView: function() {
            this.pressureGaugeView = new PressureGaugeView({
                simulation: this.simulation
            });

            var connectorPosition = this.particleTankView.getLeftConnectorPosition();
            this.pressureGaugeView.displayObject.x = connectorPosition.x;
            this.pressureGaugeView.displayObject.y = connectorPosition.y;

            this.stage.addChild(this.pressureGaugeView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

    });

    return SOMSceneView;
});

define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView      = require('common/v3/pixi/view/scene');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var TurnstileView = require('views/turnstile');
    var WirePatchView = require('views/wire-patch');
    var BatteryView   = require('views/battery');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var BRCSceneView = PixiSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, arguments);
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.bottomLayer   = new PIXI.Container();
            this.middleLayer   = new PIXI.Container();
            this.electronLayer = new PIXI.Container();
            this.topLayer      = new PIXI.Container();

            this.stage.addChild(this.bottomLayer);
            this.stage.addChild(this.middleLayer);
            this.stage.addChild(this.electronLayer);
            this.stage.addChild(this.topLayer);

            this.initMVT();
            this.initWires();
            this.initBatteryView();
            this.initTurnstileView();
        },

        initMVT: function() {
            // Map the simulation bounds...
            var simWidth  = Constants.SIM_WIDTH;
            var simHeight = Constants.SIM_HEIGHT;

            // ...to the usable screen space that we have
            var controlsWidth = 220;
            var margin = 20;
            var rightMargin = 0 + controlsWidth + margin;
            var usableWidth = this.width - rightMargin;
            var usableHeight = this.height - 62;

            var simRatio = simWidth / simHeight;
            var screenRatio = usableWidth / usableHeight;
            
            var scale = (screenRatio > simRatio) ? usableHeight / simHeight : usableWidth / simWidth;
            
            this.viewOriginX = 0;
            this.viewOriginY = 0;

            this.mvt = ModelViewTransform.createSinglePointScaleMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                scale
            );
        },

        initWires: function() {
            this.leftWirePatchView = new WirePatchView({
                model: this.simulation.leftPatch,
                mvt: this.mvt
            });

            this.rightWirePatchView = new WirePatchView({
                model: this.simulation.rightPatch,
                mvt: this.mvt
            });

            this.bottomLayer.addChild(this.leftWirePatchView.displayObject);
            this.bottomLayer.addChild(this.rightWirePatchView.displayObject);
        },

        initBatteryView: function() {
            this.batteryView = new BatteryView({
                mvt: this.mvt,
                simulation: this.simulation
            });

            this.topLayer.addChild(this.batteryView.solidLayer);
            this.middleLayer.addChild(this.batteryView.cutawayLayer);
        },

        initTurnstileView: function() {
            this.turnstileView = new TurnstileView({
                mvt: this.mvt,
                model: this.simulation.turnstile
            });

            this.topLayer.addChild(this.turnstileView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            if (this.simulation.updated()) {
                this.turnstileView.update();
            }
        },

        showSolidBattery: function() {
            this.batteryView.showSolid();
        },

        showCutawayBattery: function() {
            this.batteryView.showCutaway();
        }

    });

    return BRCSceneView;
});

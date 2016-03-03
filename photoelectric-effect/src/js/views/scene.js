define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var AppView            = require('common/v3/app/app');
    var PixiSceneView      = require('common/v3/pixi/view/scene');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var CircuitView = require('views/circuit');
    var BeamControlView = require('views/beamcontrol');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');


    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var PEffectSceneView = PixiSceneView.extend({

        events: {

        },

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, arguments);
        },

        renderContent: function() {

        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.initMVT();
            this.initLayers();
            this.initBackground();
        },

        initMVT: function() {
            var scale;

            if (AppView.windowIsShort()) {
                this.viewOriginX = 0;
                this.viewOriginY = 0;
                scale = 0.75;
            }
            else {
                this.viewOriginX = 0;
                this.viewOriginY = 0;
                scale = 1; 
            }

            this.mvt = ModelViewTransform.createSinglePointScaleMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                scale
            );
        },

        initLayers: function() {
            this.photonElectronLayer = new PIXI.Container();
            this.backgroundLayer = new PIXI.Container();
            this.foregroundLayer = new PIXI.Container();

            this.stage.addChild(this.backgroundLayer);
            this.stage.addChild(this.foregroundLayer);
            this.stage.addChild(this.photonElectronLayer);
        },

        initBackground: function() {
            var beamControlView = new BeamControlView({
                model: this.simulation.beamControl
            });
            this.beamControlView = beamControlView;
            this.backgroundLayer.addChild(this.beamControlView.displayObject);

            var circuitView = new CircuitView({
                model: this.simulation.circuit,
                simulation: this.simulation,
                mvt: this.mvt
            });
            this.circuitView = circuitView;
            this.backgroundLayer.addChild(this.circuitView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
        },

    });

    return PEffectSceneView;
});

define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView = require('common/v3/pixi/view/scene');

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

            this.initLayers();
            this.initBackground();
        },

        initLayers: function() {
            this.photonElectronLayer = new PIXI.DisplayObjectContainer();
            this.backgroundLayer = new PIXI.DisplayObjectContainer();
            this.foregroundLayer = new PIXI.DisplayObjectContainer();

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
                model: this.simulation.circuit
            });
            this.circuitView = circuitView;
            this.backgroundLayer.addChild(this.circuitView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
        },

    });

    return PEffectSceneView;
});

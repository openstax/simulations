define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView = require('common/v3/pixi/view/scene');
    var ModelViewTransform = require('common/math/model-view-transform');

    var MirrorView = require('views/mirror');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var LasersSceneView = PixiSceneView.extend({

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
        },

        initMVT: function() {
            // TODO: Remove this
            this.mvt = ModelViewTransform.createScaleMapping(1);
        },

        initLayers: function() {
            this.photonElectronLayer = new PIXI.Container();
            this.backgroundLayer = new PIXI.Container();
            this.foregroundLayer = new PIXI.Container();

            this.stage.addChild(this.photonElectronLayer);
            this.stage.addChild(this.backgroundLayer);
            this.stage.addChild(this.foregroundLayer);
        },

        initMirrors: function() {
            this.rightMirrorView = new MirrorView({
                mvt: this.mvt,
                model: this.simulation.rightMirror,
                simulation: this.simulation,
                leftFacing: true
            });

            this.leftMirrorView = new MirrorView({
                mvt: this.mvt,
                model: this.simulation.leftMirror,
                simulation: this.simulation,
                leftFacing: false
            });

            this.backgroundLayer.addChild(this.rightMirrorView.displayObject);
            this.foregroundLayer.addChild(this.leftMirrorView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

    });

    return LasersSceneView;
});

define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView      = require('common/v3/pixi/view/scene');
    var ModelViewTransform = require('common/math/model-view-transform');
    var PiecewiseCurve     = require('common/math/piecewise-curve');
    var Rectangle          = require('common/math/rectangle');

    var MirrorView       = require('views/mirror');
    var LaserCurtainView = require('views/laser-curtain');

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
            this.tubeLayer = new PIXI.Container();
            
            this.stage.addChild(this.backgroundLayer);
            this.stage.addChild(this.tubeLayer);
            this.stage.addChild(this.photonElectronLayer);
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

        initLaserCurtainViews: function() {
            var tubeBounds = this.simulation.tube.getBounds();
            var lensRadius = Constants.MIRROR_THICKNESS / 2 + 3;
            var internalShape = new PiecewiseCurve()
                .moveTo(tubeBounds.right(), tubeBounds.top())
                .lineTo(tubeBounds.left(),  tubeBounds.top())
                .lineTo(tubeBounds.left(),  tubeBounds.bottom())
                .lineTo(tubeBounds.right(), tubeBounds.bottom())
                .curveTo(
                    tubeBounds.right() + lensRadius, tubeBounds.bottom(),
                    tubeBounds.right() + lensRadius, tubeBounds.top(),
                    tubeBounds.right(),              tubeBounds.top()
                );

            this.internalLaserCurtainView = new LaserCurtainView({
                mvt: this.mvt,
                simulation: this.simulation,
                modelShape: internalShape
            });

            var externalShape = new Rectangle(tubeBounds.right(), tubeBounds.y, 500, tubeBounds.h);

            this.externalLaserCurtainView = new LaserCurtainView({
                mvt: this.mvt,
                simulation: this.simulation,
                modelShape: externalShape
            });

            // Create a listener that will adjust the maximum alpha of the external beam based on
            //   the reflectivity of the right-hand mirror
            this.listenTo(this.simulation.rightMirror, 'change:reflectivity', function(mirror, reflectivity) {
                this.externalLaserCurtainView.setMaxAlpha(1 - (Math.pow(reflectivity, 1.5)));
            });

            this.foregroundLayer.addChildAt(this.internalLaserCurtainView.displayObject, 0);
            this.backgroundLayer.addChildAt(this.externalLaserCurtainView.displayObject, 0);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

    });

    return LasersSceneView;
});

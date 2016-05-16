define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var AppView            = require('common/v3/app/app');
    var PixiSceneView      = require('common/v3/pixi/view/scene');
    var ModelViewTransform = require('common/math/model-view-transform');
    var PiecewiseCurve     = require('common/math/piecewise-curve');
    var Rectangle          = require('common/math/rectangle');

    var MirrorView           = require('views/mirror');
    var PhotonCollectionView = require('views/photon-collection');
    var TubeView             = require('views/tube');
    var LaserCurtainView     = require('views/laser-curtain');
    var BeamCurtainView      = require('views/beam-curtain');
    var LaserWaveView        = require('views/laser-wave');
    var EnergyLevelPanelView = require('views/energy-level-panel');

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
            this.initPhotons();
            this.initTube();
            this.initMirrors();
            this.initLaserCurtainViews();
            this.initBeamCurtainView();
            this.initLaserWaveView();
            this.initEnergyLevelPanel();
        },

        initMVT: function() {
            // TODO: Remove this
            this.mvt = ModelViewTransform.createScaleMapping(1);
        },

        initLayers: function() {
            this.photonElectronLayer = new PIXI.Container();
            this.atomLayer = new PIXI.Container();
            this.backgroundLayer = new PIXI.Container();
            this.foregroundLayer = new PIXI.Container();
            this.tubeLayer = new PIXI.Container();
            this.controlsLayer = new PIXI.Container();
            
            this.stage.addChild(this.backgroundLayer);
            this.stage.addChild(this.atomLayer);
            this.stage.addChild(this.tubeLayer);
            this.stage.addChild(this.photonElectronLayer);
            this.stage.addChild(this.foregroundLayer);
            this.stage.addChild(this.controlsLayer);
        },

        initPhotons: function() {
            this.photonsView = new PhotonCollectionView({
                collection: this.simulation.photons,
                simulation: this.simulation,
                mvt: this.mvt
            });

            this.photonElectronLayer.addChild(this.photonsView.displayObject);
        },

        initTube: function() {
            this.tubeView = new TubeView({
                model: this.simulation.tube,
                mvt: this.mvt
            });

            this.tubeLayer.addChild(this.tubeView.displayObject);
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

        initBeamCurtainView: function() {
            this.beamCurtainView = new BeamCurtainView({
                mvt: this.mvt,
                model: this.simulation.pumpingBeam
            });

            this.backgroundLayer.addChildAt(this.beamCurtainView.displayObject, 0);

            this.determineBeamCurtainViewVisibility();
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
            this.listenTo(this.simulation.rightMirror, 'change:reflectivity', this.rightMirrorReflectivityChanged);
            this.rightMirrorReflectivityChanged(this.simulation.rightMirror, this.simulation.rightMirror.get('reflectivity'));

            this.foregroundLayer.addChildAt(this.internalLaserCurtainView.displayObject, 0);
            this.backgroundLayer.addChildAt(this.externalLaserCurtainView.displayObject, 0);
        },

        initLaserWaveView: function() {
            this.laserWaveView = new LaserWaveView({
                mvt: this.mvt,
                simulation: this.simulation
            });

            this.tubeLayer.addChild(this.laserWaveView.foregroundLayer);
            this.backgroundLayer.addChildAt(this.laserWaveView.backgroundLayer, 0);
        },

        initEnergyLevelPanel: function() {
            this.energyLevelPanelView = new EnergyLevelPanelView({
                simulation: this.simulation,
                averagingPeriod: 0
            });

            if (AppView.windowIsShort()) {
                this.energyLevelPanelView.displayObject.x = 12;
                this.energyLevelPanelView.displayObject.y = 12;
            }
            else {
                this.energyLevelPanelView.displayObject.x = 20;
                this.energyLevelPanelView.displayObject.y = 20;
            }

            this.controlsLayer.addChild(this.energyLevelPanelView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            this.photonsView.update(time, deltaTime, paused);
            this.energyLevelPanelView.update(time, deltaTime, paused);
            this.laserWaveView.update(time, deltaTime, paused);
        },

        rightMirrorReflectivityChanged: function(mirror, reflectivity) {
            this.externalLaserCurtainView.setMaxAlpha(1 - (Math.pow(reflectivity, 1.5)));
        }

    });

    return LasersSceneView;
});

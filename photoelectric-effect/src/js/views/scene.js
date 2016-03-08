define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var AppView            = require('common/v3/app/app');
    var PixiSceneView      = require('common/v3/pixi/view/scene');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var TubeView = require('lasers/views/tube');

    var CircuitView            = require('views/circuit');
    var BeamView               = require('views/beam');
    var PhotonCollectionView   = require('views/photon-collection');
    var ElectronCollectionView = require('views/electron-collection');

    var PEffectSimulation = require('models/simulation');

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
            this.initPhotons();
            this.initElectrons();
        },

        initMVT: function() {
            var scale;

            if (AppView.windowIsShort()) {
                this.viewOriginX = 50;
                this.viewOriginY = 0;
                scale = 0.75;
            }
            else {
                this.viewOriginX = 32;
                this.viewOriginY = 30;
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

            this.stage.addChild(this.photonElectronLayer);
            this.stage.addChild(this.backgroundLayer);
            this.stage.addChild(this.foregroundLayer);
        },

        initBackground: function() {
            this.beamView = new BeamView({
                model: this.simulation.beam,
                simulation: this.simulation,
                mvt: this.mvt
            });
            this.backgroundLayer.addChild(this.beamView.displayObject);

            this.circuitView = new CircuitView({
                model: this.simulation.circuit,
                simulation: this.simulation,
                mvt: this.mvt
            });
            this.backgroundLayer.addChild(this.circuitView.displayObject);

            this.tubeView = new TubeView({
                model: this.simulation.tube,
                mvt: this.mvt
            });
            this.backgroundLayer.addChild(this.tubeView.displayObject);
        },

        initPhotons: function() {
            this.photonsView = new PhotonCollectionView({
                collection: this.simulation.photons,
                simulation: this.simulation,
                mvt: this.mvt
            });

            this.photonElectronLayer.addChild(this.photonsView.displayObject);
        },

        initElectrons: function() {
            this.electronsView = new ElectronCollectionView({
                collection: this.simulation.electrons,
                simulation: this.simulation,
                mvt: this.mvt
            });

            this.photonElectronLayer.addChild(this.electronsView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            if (this.simulation.updated()) {
                if (this.simulation.get('viewMode') === PEffectSimulation.PHOTON_VIEW)
                    this.photonsView.update();
                this.electronsView.update();
                this.circuitView.update();
            }
        },

    });

    return PEffectSceneView;
});

define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var AppView            = require('common/v3/app/app');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var LasersSceneView      = require('views/scene');
    var PhotonCollectionView = require('views/photon-collection');

    // Constants
    var Constants = require('constants');

    /**
     *
     */
    var OneAtomSceneView = LasersSceneView.extend({

        initialize: function(options) {
            LasersSceneView.prototype.initialize.apply(this, arguments);
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            LasersSceneView.prototype.initGraphics.apply(this, arguments);

            this.initMVT();
            this.initLayers();
            this.initBackground();
            this.initPhotons();
        },

        initMVT: function() {
            var scale;

            if (AppView.windowIsShort()) {
                this.viewOriginX = 50;
                this.viewOriginY = 0;
                scale = 0.75;
            }
            else {
                this.viewOriginX = 4;
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
            // this.beamView = new BeamView({
            //     model: this.simulation.beam,
            //     simulation: this.simulation,
            //     mvt: this.mvt
            // });
            // this.backgroundLayer.addChild(this.beamView.displayObject);

            // this.circuitView = new CircuitView({
            //     model: this.simulation.circuit,
            //     simulation: this.simulation,
            //     mvt: this.mvt
            // });
            // this.backgroundLayer.addChild(this.circuitView.displayObject);

            // this.tubeView = new TubeView({
            //     model: this.simulation.tube,
            //     mvt: this.mvt
            // });
            // this.backgroundLayer.addChild(this.tubeView.displayObject);
        },

        initPhotons: function() {
            this.photonsView = new PhotonCollectionView({
                collection: this.simulation.photons,
                simulation: this.simulation,
                mvt: this.mvt
            });

            this.photonElectronLayer.addChild(this.photonsView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            LasersSceneView.prototype._update.apply(this, arguments);

        },

    });

    return OneAtomSceneView;
});

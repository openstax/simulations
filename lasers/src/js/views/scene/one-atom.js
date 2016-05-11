define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var AppView            = require('common/v3/app/app');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var LasersSceneView      = require('views/scene');
    var PhotonCollectionView = require('views/photon-collection');
    var TubeView             = require('views/tube');
    var LampView             = require('views/lamp');
    var AtomView             = require('views/atom');
    var EnergyLevelPanelView = require('views/energy-level-panel');

    // Constants
    var Constants = require('constants');

    /**
     *
     */
    var OneAtomSceneView = LasersSceneView.extend({

        initialize: function(options) {
            LasersSceneView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.simulation, 'change:elementProperties', this.elementPropertiesChanged);
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            LasersSceneView.prototype.initGraphics.apply(this, arguments);

            this.initMVT();
            this.initLayers();
            this.initTube();
            this.initMirrors();
            this.initAtom();
            this.initPhotons();
            this.initLamps();
            this.initEnergyLevelPanel();

            this.elementPropertiesChanged(this.simulation, this.simulation.get('elementProperties'));
        },

        initMVT: function() {
            var scale;

            if (AppView.windowIsShort()) {
                this.viewOriginX = 294;
                this.viewOriginY = 90;
                scale = 0.76;
            }
            else {
                this.viewOriginX = 150;
                this.viewOriginY = 80;
                scale = 0.98; 
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

        initTube: function() {
            this.tubeView = new TubeView({
                model: this.simulation.tube,
                mvt: this.mvt
            });

            this.backgroundLayer.addChild(this.tubeView.displayObject);
        },

        initMirrors: function() {
            // Put the left one in the foreground and the right one in the background
        },

        initAtom: function() {
            this.atomView = new AtomView({
                model: this.simulation.atoms.first(),
                mvt: this.mvt
            });

            this.backgroundLayer.addChild(this.atomView.displayObject);
        },

        initPhotons: function() {
            this.photonsView = new PhotonCollectionView({
                collection: this.simulation.photons,
                simulation: this.simulation,
                mvt: this.mvt
            });

            this.photonElectronLayer.addChild(this.photonsView.displayObject);
        },

        initLamps: function() {
            this.lamp1View = new LampView({
                model: this.simulation.seedBeam,
                mvt: this.mvt
            });

            this.lamp2View = new LampView({
                model: this.simulation.pumpingBeam,
                mvt: this.mvt
            });

            this.foregroundLayer.addChild(this.lamp1View.displayObject);
            this.foregroundLayer.addChild(this.lamp2View.displayObject);
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

            this.foregroundLayer.addChild(this.energyLevelPanelView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            LasersSceneView.prototype._update.apply(this, arguments);

            this.photonsView.update(time, deltaTime, paused);
            this.energyLevelPanelView.update(time, deltaTime, paused);
        },

        elementPropertiesChanged: function(simulation, elementProperties) {
            if (elementProperties === simulation.twoLevelProperties)
                this.lamp2View.hide();
            else
                this.lamp2View.show();
        }

    });

    return OneAtomSceneView;
});

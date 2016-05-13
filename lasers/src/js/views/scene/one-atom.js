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
    var BeamCurtainView      = require('views/beam-curtain');

    // Constants
    var Constants = require('constants');

    /**
     *
     */
    var OneAtomSceneView = LasersSceneView.extend({

        initialize: function(options) {
            LasersSceneView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.simulation, 'change:elementProperties',     this.elementPropertiesChanged);
            this.listenTo(this.simulation, 'change:pumpingPhotonViewMode', this.determineBeamCurtainViewVisibility);
            this.listenTo(this.simulation, 'change:lasingPhotonViewMode',  this.determineLaserWaveViewVisibility);
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            LasersSceneView.prototype.initGraphics.apply(this, arguments);

            this.initMirrors();
            this.initTube();
            this.initAtom();
            this.initPhotons();
            this.initLamps();
            this.initLaserCurtainViews();
            this.initBeamCurtainView();
            this.initLaserWaveView();
            this.initEnergyLevelPanel();

            this.determineLaserWaveViewVisibility();

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

        initTube: function() {
            this.tubeView = new TubeView({
                model: this.simulation.tube,
                mvt: this.mvt
            });

            this.tubeLayer.addChild(this.tubeView.displayObject);
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

        initBeamCurtainView: function() {
            this.beamCurtainView = new BeamCurtainView({
                mvt: this.mvt,
                model: this.simulation.pumpingBeam
            });

            this.foregroundLayer.addChild(this.beamCurtainView.displayObject);

            this.determineBeamCurtainViewVisibility();
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
            LasersSceneView.prototype._update.apply(this, arguments);

            this.photonsView.update(time, deltaTime, paused);
            this.energyLevelPanelView.update(time, deltaTime, paused);
            this.laserWaveView.update(time, deltaTime, paused);
        },

        elementPropertiesChanged: function(simulation, elementProperties) {
            if (elementProperties === simulation.twoLevelProperties)
                this.lamp2View.hide();
            else
                this.lamp2View.show();
            this.determineBeamCurtainViewVisibility();
            this.determineLaserWaveViewVisibility();
        },

        determineBeamCurtainViewVisibility: function() {
            if (this.simulation.get('elementProperties') === this.simulation.threeLevelProperties &&
                this.simulation.get('pumpingPhotonViewMode') === Constants.PHOTON_CURTAIN
            ) {
                this.beamCurtainView.show();
            }
            else {
                this.beamCurtainView.hide();
            }
        },

        determineLaserWaveViewVisibility: function() {
            if (this.simulation.get('elementProperties') === this.simulation.threeLevelProperties &&
                this.simulation.get('lasingPhotonViewMode') === Constants.PHOTON_WAVE
            ) {
                this.laserWaveView.show();
            }
            else {
                this.laserWaveView.hide();
            }
        }

    });

    return OneAtomSceneView;
});

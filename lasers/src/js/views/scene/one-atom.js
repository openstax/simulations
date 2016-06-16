define(function(require) {

    'use strict';

    var AppView            = require('common/v3/app/app');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var LasersSceneView      = require('views/scene');
    var LampView             = require('views/lamp');
    var AtomView             = require('views/atom');

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

            this.initAtom();
            this.initLamps();
            
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

        initAtom: function() {
            this.atomView = new AtomView({
                model: this.simulation.atoms.first(),
                mvt: this.mvt
            });

            this.atomLayer.addChild(this.atomView.displayObject);
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

            this.lampLayer.addChild(this.lamp1View.displayObject);
            this.lampLayer.addChild(this.lamp2View.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            LasersSceneView.prototype._update.apply(this, arguments);

            
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

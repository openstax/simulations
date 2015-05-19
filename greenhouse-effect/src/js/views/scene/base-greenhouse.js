define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView      = require('common/pixi/view/scene');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Rectangle          = require('common/math/rectangle');
    var Vector2            = require('common/math/vector2');

    var InfraredFilter = require('models/filter/infrared');

    var PhotonView = require('views/photon');
    var CloudView  = require('views/cloud');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var BaseGreenhouseSceneView = PixiSceneView.extend({

        visiblePhotonProportion: 0.1,

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.simulation.photons, 'reset',          this.photonsReset);
            this.listenTo(this.simulation.photons, 'add',            this.photonAdded);
            this.listenTo(this.simulation.photons, 'remove destroy', this.photonRemoved);
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.backgroundLayer = new PIXI.DisplayObjectContainer();
            this.foregroundLayer = new PIXI.DisplayObjectContainer();

            this.stage.addChild(this.backgroundLayer);
            this.stage.addChild(this.foregroundLayer);

            this.initMVT();
            this.initBackground();
            this.initPhotons();

            this.initialized = true;
        },

        initMVT: function() {
            // Map the simulation bounds...
            var bounds = this.simulation.bounds;

            // ...to the usable screen space that we have
            var controlsWidth = 180;
            var margin = 20;
            var leftMargin = ($(window).height() <= 500) ? margin + controlsWidth + margin : margin;
            var rightMargin = margin + controlsWidth + margin;
            var usableScreenSpace = new Rectangle(leftMargin, 0, this.width - leftMargin - rightMargin, this.height);

            var boundsRatio = bounds.w / bounds.h;
            var screenRatio = usableScreenSpace.w / usableScreenSpace.h;
            
            var scale = (screenRatio > boundsRatio) ? usableScreenSpace.h / bounds.h : usableScreenSpace.w / bounds.w;
            
            this.viewOriginX = Math.round(usableScreenSpace.x + usableScreenSpace.w / 2);
            this.viewOriginY = Math.round(usableScreenSpace.y + usableScreenSpace.h);

            this.mvt = ModelViewTransform.createSinglePointScaleInvertedYMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                scale
            );
        },

        initBackground: function() {},

        createScene: function(image) {
            var scene = Assets.createSprite(image);
            scene.anchor.y = 1;
            scene.y = this.height;
            scene.visible = false;
            this.setSceneScale(scene);

            return scene;
        },

        setSceneScale: function(scene) {
            var targetSceneWidth = this.width; // In pixels
            scene.scale.x = targetSceneWidth / scene.width;
            scene.scale.y = targetSceneWidth / scene.width;
        },

        initPhotons: function() {
            this.photonViews = [];

            this.sunlightPhotons = new PIXI.SpriteBatch();
            this.infraredPhotons = new PIXI.SpriteBatch();

            // Sunlight goes on top because it goes over the glass
            this.backgroundLayer.addChild(this.infraredPhotons);
            this.backgroundLayer.addChild(this.sunlightPhotons);
            

            this.irFilter = new InfraredFilter();

            this.photonsReset(this.simulation.photons);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

        photonAdded: function(photon, photons) {
            this.createAndAddPhotonView(photon);
        },

        photonRemoved: function(photon, photons) {
            for (var i = this.photonViews.length - 1; i >= 0; i--) {
                if (this.photonViews[i].model === photon) {
                    this.photonViews[i].removeFrom(this.photonViews[i].displayObject.parent);
                    this.photonViews.splice(i, 1);
                    break;
                }
            }
        },

        photonsReset: function(photons) {
            // Remove old photon views
            for (var i = this.photonViews.length - 1; i >= 0; i--) {
                this.photonViews[i].removeFrom(this.photonViews[i].displayObject.parent);
                this.photonViews.splice(i, 1);
            }

            // Add new photon views
            photons.each(function(photon) {
                this.createAndAddPhotonView(photon);
            }, this);
        },

        createAndAddPhotonView: function(photon) {
            var photonView = new PhotonView({ 
                model: photon,
                mvt: this.mvt,
                visibleProportion: this.visiblePhotonProportion
            });

            // Add them to the right layer based on wavelength
            if (this.irFilter.absorbs(photon.get('wavelength')))
                this.infraredPhotons.addChild(photonView.displayObject);
            else
                this.sunlightPhotons.addChild(photonView.displayObject);

            this.photonViews.push(photonView);
        },

        setVisiblePhotonProportion: function(visiblePhotonProportion) {
            this.visiblePhotonProportion = visiblePhotonProportion;
            for (var i = 0; i < this.photonViews.length; i++)
                this.photonViews[i].updateVisibility(visiblePhotonProportion);
        },

        showAllPhotons: function() {
            this.setVisiblePhotonProportion(1);
        },

        showFewerPhotons: function() {
            this.setVisiblePhotonProportion(0.1);
        }

    });

    return BaseGreenhouseSceneView;
});

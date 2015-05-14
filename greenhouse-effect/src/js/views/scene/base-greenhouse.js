define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView      = require('common/pixi/view/scene');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Rectangle          = require('common/math/rectangle');
    var Vector2            = require('common/math/vector2');
    var range              = require('common/math/range');

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

            this.listenTo(this.simulation.atmosphere, 'change:greenhouseGasConcentration', this.updatePollution);
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
            this.initPolution();

            this.initialized = true;
        },

        initMVT: function() {
            // Map the simulation bounds...
            var bounds = this.simulation.bounds;

            // ...to the usable screen space that we have
            var controlsWidth = 210;
            var usableScreenSpace = new Rectangle(0, 0, this.width - controlsWidth, this.height);

            if ($(window).height() <= 500) {
                usableScreenSpace.x += controlsWidth;
                usableScreenSpace.w -= controlsWidth;
            }

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

            this.photons = new PIXI.SpriteBatch();
            this.backgroundLayer.addChild(this.photons);

            this.photonsReset(this.simulation.photons);
        },

        initPolution: function() {
            if (this.pollution)
                this.foregroundLayer.removeChild(this.pollution);

            var canvas = document.createElement('canvas');
            canvas.width  = this.width;
            canvas.height = this.height;

            var ctx = canvas.getContext('2d');

            var gradient = ctx.createLinearGradient(0, 0, 0, this.height);
            gradient.addColorStop(0, Constants.Atmosphere.POLLUTION_TOP_COLOR);
            gradient.addColorStop(1, Constants.Atmosphere.POLLUTION_BOTTOM_COLOR);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, this.width, this.height);

            this.pollution = new PIXI.Sprite(PIXI.Texture.fromCanvas(canvas));
            this.foregroundLayer.addChild(this.pollution);

            this.pollutionRange = range({
                min: Constants.Atmosphere.MIN_GREENHOUSE_GAS_CONCENTRATION,
                max: Constants.Atmosphere.MAX_GREENHOUSE_GAS_CONCENTRATION
            });

            this.updatePollution(this.simulation.atmosphere, this.simulation.atmosphere.get('greenhouseGasConcentration'));
        },

        resize: function() {
            PixiSceneView.prototype.resize.apply(this, arguments);

            if (this.initialized) {
                this.setSceneScale(this.bgToday);
                this.setSceneScale(this.bg1750);
                this.setSceneScale(this.bgIceAge);
                this.initPolution();
            }
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

        updatePollution: function(atmosphere, concentration) {
            this.pollution.alpha = 0.2 * this.pollutionRange.percent(concentration);
        },

        photonsReset: function(photons) {
            // Remove old photon views
            for (var i = this.photonViews.length - 1; i >= 0; i--) {
                this.photonViews[i].removeFrom(this.photons);
                this.photonViews.splice(i, 1);
            }

            // Add new photon views
            photons.each(function(photon) {
                this.createAndAddPhotonView(photon);
            }, this);
        },

        photonAdded: function(photon, photons) {
            this.createAndAddPhotonView(photon);
        },

        photonRemoved: function(photon, photons) {
            for (var i = this.photonViews.length - 1; i >= 0; i--) {
                if (this.photonViews[i].model === photon) {
                    this.photonViews[i].removeFrom(this.photons);
                    this.photonViews.splice(i, 1);
                    break;
                }
            }
        },

        createAndAddPhotonView: function(photon) {
            var photonView = new PhotonView({ 
                model: photon,
                mvt: this.mvt,
                visibleProportion: this.visiblePhotonProportion
            });
            this.photons.addChild(photonView.displayObject);
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

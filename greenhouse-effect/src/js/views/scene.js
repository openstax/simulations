define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView      = require('common/pixi/view/scene');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Rectangle          = require('common/math/rectangle');
    var Vector2            = require('common/math/vector2');

    var PhotonView = require('views/photon');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var GreenhouseSceneView = PixiSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.simulation.photons, 'reset',  this.photonsReset);
            this.listenTo(this.simulation.photons, 'add',    this.photonAdded);
            this.listenTo(this.simulation.photons, 'remove', this.photonRemoved);
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.initMVT();
            this.initPhotons();
        },

        initMVT: function() {
            // Map the simulation bounds...
            var bounds = this.simulation.bounds;

            // ...to the usable screen space that we have
            var usableScreenSpace = new Rectangle(0, 0, this.width, this.height);

            var boundsRatio = bounds.w / bounds.h;
            var screenRatio = usableScreenSpace.w / usableScreenSpace.h;
            
            var scale = (screenRatio > boundsRatio) ? usableScreenSpace.h / bounds.h : usableScreenSpace.w / bounds.w;
            
            this.viewOriginX = Math.round(usableScreenSpace.x);
            this.viewOriginY = Math.round(usableScreenSpace.y + usableScreenSpace.h / 2);

            this.mvt = ModelViewTransform.createSinglePointScaleInvertedYMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                scale
            );
        },

        initPhotons: function() {
            this.photonViews = [];

            this.photons = new PIXI.SpriteBatch();
            this.stage.addChild(this.photons);

            this.photonsReset(this.simulation.photons);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
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
                mvt: this.mvt
            });
            this.photons.addChild(photonView.displayObject);
            this.photonViews.push(photonView);
        },

    });

    return GreenhouseSceneView;
});

define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    var _ = require('underscore');

                   require('common/v3/pixi/dash-to');
    var PixiView = require('common/v3/pixi/view');
    var Colors   = require('common/colors/colors');
    
    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');
    var PhotonCollectionView = require('hydrogen-atom/views/photon-collection');

    var Assets = require('assets');
    var Constants = require('constants');
    
    /**
     * Represents the zoomed in view of the scene and what's happening at the atomic level
     */
    var SpaceBoxView = PixiView.extend({

        /**
         * Initializes the new SpaceBoxView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.particleMVT = options.particleMVT;
            this.simulation = options.simulation;

            this.initGraphics();


        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.initMask();
            this.initParticles();
            this.initBox();
            
            this.updateMVT(this.mvt);
        },

        initMask: function() {
            this.boxMask = new PIXI.Graphics();
            
            this.displayObject.addChild(this.boxMask);
        },

        initParticles: function() {
            this.particlesLayer = new PIXI.Container();
            this.particlesLayer.mask = this.boxMask;

            this.photonCollectionView = new PhotonCollectionView({
                mvt: this.mvt,
                collection: this.simulation.photons
            });

            this.particlesLayer.addChild(this.photonCollectionView.displayObject);
            this.displayObject.addChild(this.particlesLayer);
        },

        initBox: function() {
            this.box = new PIXI.Graphics();
            
            this.displayObject.addChild(this.box);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            // Update the mask
            this.boxMask.clear();
            this.boxMask.beginFill(0x000000, 1);
            this.drawBox(this.boxMask);
            this.boxMask.endFill();

            // Update the box outline
            this.box.clear();
            this.box.lineStyle(1, 0xFFFFFF, 1);
            this.drawBox(this.box);
        },

        drawBox: function(box) {
            var spaceRect = this.simulation.spaceRect;
            this.boxWidth  = Math.abs(this.mvt.modelToViewDeltaX(this.simulation.spaceRect.w));
            this.boxHeight = Math.abs(this.mvt.modelToViewDeltaY(this.simulation.spaceRect.h));

            this.boxCorner = this.mvt.modelToView({
                x: spaceRect.x,
                y: spaceRect.y
            });

            box.drawRect(this.boxCorner.x, this.boxCorner.y, this.boxWidth, this.boxHeight);
        },

        getLeft: function() {
            return this.boxCorner.x;
        },

        getTop: function() {
            return this.boxCorner.y;
        },

        getBottom: function() {
            return this.boxCorner.y + this.boxHeight;
        },

        update: function(time, deltaTime, paused) {
            this.photonCollectionView.update(time, deltaTime, paused);
        },

        reset: function() {
            
        }

    });


    return SpaceBoxView;
});
define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    var _ = require('underscore');

                   require('common/v3/pixi/dash-to');
    var PixiView = require('common/v3/pixi/view');
    var Colors   = require('common/colors/colors');
    
    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');

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
            this.box = new PIXI.Graphics();
            this.box.lineStyle(1, 0xFFFFFF, 1);
            this.drawBox(this.box);

            this.maskBox = new PIXI.Graphics();
            this.maskBox.beginFill(0x000000, 1);
            this.drawBox(this.maskBox);
            this.maskBox.endFill();

            this.particlesLayer = new PIXI.Container();
            this.particlesLayer.mask = this.maskBox;

            this.displayObject.addChild(this.particlesLayer);
            this.displayObject.addChild(this.box);

            this.updateMVT(this.mvt);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.update();
        },

        drawBox: function(box) {
            var spaceRect = this.simulation.spaceRect;
            this.boxWidth  = Math.abs(this.mvt.modelToViewDeltaX(this.simulation.spaceRect.w));
            this.boxHeight = Math.abs(this.mvt.modelToViewDeltaY(this.simulation.spaceRect.h));

            this.boxCorner = this.mvt.modelToView({
                x: - spaceRect.w / 2,
                y: spaceRect.h / 2
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

        },

        reset: function() {
            
        }

    });


    return SpaceBoxView;
});
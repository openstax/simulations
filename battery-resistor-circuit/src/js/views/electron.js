define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');

    var Constants = require('constants');

    var Assets = require('assets');

    /**
     * A view that represents an electron
     */
    var ElectronView = PixiView.extend({

        /**
         * Initializes the new ElectronView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.batteryWirePatch = options.batteryWirePatch;

            this.initGraphics();
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            var electron     = Assets.createSprite(Assets.Images.ELECTRON);
            var electronGlow = Assets.createSprite(Assets.Images.ELECTRON_GLOW);

            electron.anchor.x = electron.anchor.y = 0.5;
            electronGlow.anchor.x = electronGlow.anchor.y = 0.5;
            electronGlow.visible = false;
            this.glow = electronGlow;

            this.displayObject.addChild(electronGlow);
            this.displayObject.addChild(electron);

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

        updatePosition: function() {
            // First we need to convert wire position to (x,y) and then to view
            var modelPosition = this.model.wirePatch.getPosition(this.model.position);
            var viewPosition = this.mvt.modelToView(modelPosition);
            this.displayObject.x = viewPosition.x;
            this.displayObject.y = viewPosition.y; 
        },

        updateGlow: function(paused) {
            if (this.model.wirePatch === this.batteryWirePatch) {
                this.glow.visible = true;
                if (!paused)
                    this.glow.rotation = Math.random() * Math.PI * 2;
            }
            else {
                this.glow.visible = false;
            }
        },

        update: function(time, deltaTime, paused) {
            this.updatePosition();
            this.updateGlow();
        }

    });


    return ElectronView;
});
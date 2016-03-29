define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');
    var Colors   = require('common/colors/colors');
    
    var Assets = require('assets');
    var Constants = require('constants');

    /**
     * A view that represents an electron
     */
    var PlumPudding = PixiView.extend({

        /**
         * Initializes the new PlumPudding.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.scale = options.scale;
            this.boundWidth = options.simulation.boundWidth;

            this.initGraphics();
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.pudding = Assets.createSprite(Assets.Images.PLUM_PUDDING);
            this.pudding.anchor.x = 0.5;
            this.pudding.anchor.y = 0.5;
            this.pudding.blendMode = PIXI.BLEND_MODES.OVERLAY;
            this.pudding.alpha = 0.75;

            this.displayObject.addChild(this.pudding);

            this.updateMVT(this.mvt);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            var targetWidth = Math.round(this.mvt.modelToViewDeltaX(this.boundWidth));
            var scale = targetWidth / this.pudding.texture.width;

            this.pudding.scale.x = scale;
            this.pudding.scale.y = scale;
            this.pudding.x = this.mvt.modelToViewX(PlumPudding.center.x);
            this.pudding.y = this.mvt.modelToViewY(PlumPudding.center.y);

        }
    }, {center: {x: 0, y: 0}});


    return PlumPudding;
});
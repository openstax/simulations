define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');
    var Colors   = require('common/colors/colors');
    
    var Assets = require('assets');
    var Constants = require('constants');
    // var STICK_COLOR = Colors.parseHex(Constants.RayGunView.STICK_COLOR);

    /**
     * A view that represents an electron
     */
    var RayGunView = PixiView.extend({

        /**
         * Initializes the new RayGunView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;

            this.initGraphics();
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            // this.ray = new PIXI.Graphics();

            this.rayGun = Assets.createSprite(Assets.Images.RAY_GUN);
            this.rayGun.anchor.x = 0.5;
            this.rayGun.anchor.y = 0.5;

            // this.displayObject.addChild(this.ray);
            this.displayObject.addChild(this.rayGun);

            this.updateMVT(this.mvt);
        },

        // drawStick: function() {
        //     var width  = Math.round(this.mvt.modelToViewDeltaX(RayGunView.STICK_WIDTH) / 2) * 2;
        //     var height = Math.round(this.mvt.modelToViewDeltaY(RayGunView.STICK_HEIGHT));
        //     var graphics = this.stick;
        //     graphics.clear();
        //     graphics.beginFill(STICK_COLOR, 1);
        //     graphics.drawRect(-width / 2, 0, width, height);
        //     graphics.endFill();
        // },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            var targetWidth = Math.round(this.mvt.modelToViewDeltaX(20));
            var scale = targetWidth / this.rayGun.texture.width;
            this.rayGun.scale.x = scale;
            this.rayGun.scale.y = scale;

            this.displayObject.x = Math.floor(this.mvt.modelToViewX(this.model.center.x));
            this.displayObject.y = Math.floor(this.mvt.modelToViewY(this.model.center.y));

            this.update();
        }

    }, {});


    return RayGunView;
});
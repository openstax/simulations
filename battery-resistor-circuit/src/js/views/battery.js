define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');

    var Constants = require('constants');

    var Assets = require('assets');
    var Constants = require('constants');

    /**
     * A view that represents an electron
     */
    var BatteryView = PixiView.extend({

        /**
         * Initializes the new BatteryView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;
            this.modelLeftX = this.simulation.batteryLeft;
            this.modelRightX = this.simulation.batteryRight;
            this.modelY = this.simulation.batteryY;

            this.initGraphics();

            this.listenTo(this.simulation, 'change:voltage', this.updateDirection);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            //var batteryTexture = Assets.Texture(Assets.Images.BATTERY);

            this.batterySprite = Assets.createSprite(Assets.Images.BATTERY);
            this.batterySprite.anchor.x = 0.5;
            this.batterySprite.anchor.y = 0.5;

            this.solidLayer = new PIXI.Container();
            this.solidLayer.addChild(this.batterySprite);

            this.cutawayBatterySprite = Assets.createSprite(Assets.Images.BATTERY_INSIDE);
            this.cutawayBatterySprite.anchor.x = 0.5;
            this.cutawayBatterySprite.anchor.y = 0.5;

            this.cutawayLayer = new PIXI.Container();
            this.cutawayLayer.addChild(this.cutawayBatterySprite);

            this.showSolid();

            this.updateMVT(this.mvt);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            var targetWidth  = Math.round(this.mvt.modelToViewDeltaX(this.modelRightX - this.modelLeftX));
            var targetHeight = Math.round(this.mvt.modelToViewDeltaY(BatteryView.MODEL_HEIGHT));
            this.batterySprite.scale.x = this.cutawayBatterySprite.scale.x = targetWidth  / this.batterySprite.texture.width;
            this.batterySprite.scale.y = this.cutawayBatterySprite.scale.y = targetHeight / this.batterySprite.texture.height;

            this.updateDirection();
        },

        updateDirection: function() {
            if (this.simulation.get('voltage') > 0) {
                this.solidLayer.scale.x   = -1;
                this.cutawayLayer.scale.x = -1;
            }
            else {
                this.solidLayer.scale.x   = 1;
                this.cutawayLayer.scale.x = 1;
            }

            this.solidLayer.x = this.cutawayLayer.x = Math.floor(this.mvt.modelToViewX(this.modelLeftX) + this.batterySprite.width / 2);
            this.solidLayer.y = this.cutawayLayer.y = Math.floor(this.mvt.modelToViewY(this.modelY));
        },

        showSolid: function() {
            this.solidLayer.visible = true;
            this.cutawayLayer.visible = false;
        },

        showCutaway: function() {
            this.solidLayer.visible = false;
            this.cutawayLayer.visible = true;
        }

    }, Constants.BatteryView);


    return BatteryView;
});
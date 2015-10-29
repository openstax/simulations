define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');
    var Vector2  = require('common/math/vector2');

    var Assets = require('assets');

    var Constants = require('constants');

    /**
     * 
     */
    var LightbulbView = PixiView.extend({

        /**
         * Initializes the new LightbulbView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;

            this.initGraphics();

            this.listenTo(this.model, 'change:position', this.updatePosition);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.faucet       = Assets.createSprite(Assets.Images.FAUCET);
            this.waterWheel   = Assets.createSprite(Assets.Images.WATER_WHEEL);
            this.barMagnet    = Assets.createSprite(Assets.Images.BAR_MAGNET);
            this.turbinePivot = Assets.createSprite(Assets.Images.TURBINE_PIVOT);

            this.waterWheel.anchor.x = this.waterWheel.anchor.y = 0.5;
            this.barMagnet.anchor.x = this.barMagnet.anchor.y = 0.5;
            this.turbinePivot.anchor.x = this.turbinePivot.anchor.y = 0.5;

            this.displayObject.addChild(this.waterWheel);
            this.initWater();
            this.displayObject.addChild(this.faucet);
            this.displayObject.addChild(this.barMagnet);
            this.displayObject.addChild(this.turbinePivot);
            this.initLabels();

            this.updateMVT(this.mvt);
        },

        initWater: function() {
            this.water = new PIXI.Graphics();
            this.displayObject.addChild(this.water);
        },

        initLabels: function() {
            var textSettings = {
                fill: '#0f0',
                font: '14px Helvetica Neue',
                align: 'center'
            };

            var rpmValue = new PIXI.Text('0', textSettings);
            var rpmUnits = new PIXI.Text('RPM', textSettings);

            rpmValue.y = -12;
            rpmUnits.y =  12;

            this.rpmValue = rpmValue;

            this.displayObject.addChild(rpmValue);
            this.displayObject.addChild(rpmUnits);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.scaleFromTextureSize(this.waterWheel);
            this.scaleFromTextureSize(this.turbinePivot);
            this.scaleFromTextureSize(this.barMagnet);

            this.water.x = this.mvt.modelToViewDeltaX(-112);
            this.water.y = this.mvt.modelToViewDeltaY(-245);
            this.faucet.x = this.mvt.modelToViewDeltaX(-405);
            this.faucet.y = this.mvt.modelToViewDeltaY(-350);

            this.updatePosition(this.model, this.model.get('position'));
            this.update();
        },

        scaleFromTextureSize: function(sprite) {
            var targetWidth = this.mvt.modelToViewDeltaX(sprite.texture.width);
            var scale = targetWidth / sprite.texture.width;
            sprite.scale.x = scale;
            sprite.scale.y = scale;
        },

        updatePosition: function(model, position) {
            var viewPosition = this.mvt.modelToViewDelta(position);
            this.displayObject.x = viewPosition.x;
            this.displayObject.y = viewPosition.y;
        },

        /**
         * Synchronize the view with the model.
         */
        update: function() {
            this.displayObject.visible = this.model.get('enabled');
            
            if (this.displayObject.visible) {
               
            }
        }

    }, Constants.LightbulbView);


    return LightbulbView;
});
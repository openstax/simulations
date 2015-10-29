define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView   = require('common/v3/pixi/view');
    var SliderView = require('common/v3/pixi/view/slider');
    var Vector2    = require('common/math/vector2');
    var Colors     = require('common/colors/colors');

    var Assets = require('assets');

    var Constants = require('constants');

    /**
     * 
     */
    var TurbineView = PixiView.extend({

        /**
         * Initializes the new TurbineView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;

            this.waterColor = Colors.parseHex(TurbineView.WATER_COLOR);
            this.waterAlpha = TurbineView.WATER_ALPHA;

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
            this.initFaucetSlider();
            this.displayObject.addChild(this.barMagnet);
            this.displayObject.addChild(this.turbinePivot);
            this.initLabels();

            this.updateMVT(this.mvt);
        },

        initWater: function() {
            this.water = new PIXI.Graphics();
            this.displayObject.addChild(this.water);
        },

        initFaucetSlider: function() {
            this.faucetSlider = new SliderView({
                start: 0,
                range: {
                    min: 0,
                    max: 100
                },
                width: 100,
                backgroundHeight: 4,
                backgroundColor: '#000',
                backgroundAlpha: 0.4,

                handleColor: '#21366B'
            });

            this.faucetSlider.displayObject.x = 198;
            this.faucetSlider.displayObject.y = 10;

            // Bind events
            this.listenTo(this.faucetSlider, 'slide', function(value, prev) {
                var speed = -value / 100; // Counterclockwise
                this.model.set('speed', speed);
            });

            this.faucet.addChild(this.faucetSlider.displayObject);
        },

        initLabels: function() {
            var textSettings = {
                fill: '#0f0',
                font: '14px Helvetica Neue',
                align: 'center'
            };

            var rpmValue = new PIXI.Text('0', textSettings);
            var rpmUnits = new PIXI.Text('RPM', textSettings);

            rpmValue.y = -20;
            rpmUnits.y =  -1;
            rpmValue.anchor.x = rpmUnits.anchor.x = 0.5;

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

            this.maxWaterWidth = this.mvt.modelToViewDeltaX(TurbineView.MAX_WATER_WIDTH);

            this.scaleFromTextureSize(this.faucet);
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
               // Location
               this.updatePosition(this.model, this.model.get('position'));

               var speed = this.model.get('speed');

               // If the turbine is moving...
               if (speed !== 0) {
                   // Rotate the water wheel.
                   var direction = this.model.get('direction');
                   this.barMagnet.rotation = direction;
                   this.waterWheel.rotation = direction;
               }

               // If the speed has changed...
               if (speed !== this.previousSpeed) {
                   this.previousSpeed = speed;

                   // Update the RPM readout.
                   this.rpmValue.text = Math.floor(this.model.getRPM());

                   // Update the water flow.
                   this.updateWater(speed);
               }
            }
        },

        /**
         * Updates the shape used to represent the column of water.
         */
        updateWater: function(speed) {
            this.water.clear();
            if (speed !== 0) {console.log(this.maxWaterWidth)
                var waterWidth = Math.abs(speed * this.maxWaterWidth);
                if (waterWidth < 1)
                    waterWidth = 1; // Must be at least 1 pixel wide
                this.water.beginFill(this.waterColor, this.waterAlpha);
                this.water.drawRect(-waterWidth / 2, 0, waterWidth, 1000);
                this.water.endFill();
            }
        }

    }, Constants.TurbineView);


    return TurbineView;
});
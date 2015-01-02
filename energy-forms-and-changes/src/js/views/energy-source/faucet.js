define(function(require) {

    'use strict';

    var _ = require('underscore');
    var PIXI = require('pixi');

    var Colors           = require('common/colors/colors');
    var SliderView       = require('common/pixi/view/slider');
    var EnergySourceView = require('views/energy-source');
    var WaterDropView    = require('views/water-drop');

    var Constants = require('constants');

    var FaucetView = EnergySourceView.extend({

        /**
         *
         */
        initialize: function(options) {
            options = _.extend({
                
            }, options);

            EnergySourceView.prototype.initialize.apply(this, [options]);
        },

        initGraphics: function() {
            this.initWater();
            this.initFaucet();
        },

        initFaucet: function() {
            var faucetFront = Assets.createSprite(Assets.Images.FAUCET_FRONT);
            var faucetPipe  = Assets.createSprite(Assets.Images.FAUCET_PIPE);

            faucetPipe.anchor.x = 1;
            faucetPipe.scale.x = 100; // Make it go off the screen and disappear
            faucetPipe.y = 32; // Line it up with the faucet front graphic

            var faucet = new PIXI.DisplayObjectContainer();
            faucet.addChild(faucetFront);
            faucet.addChild(faucetPipe);
            faucet.x = -(faucet.width  / 2) + this.mvt.modelToViewDeltaX(Constants.Faucet.OFFSET_FROM_CENTER_TO_WATER_ORIGIN.x);
            faucet.y = -(faucet.height / 2) + this.mvt.modelToViewDeltaY(Constants.Faucet.OFFSET_FROM_CENTER_TO_WATER_ORIGIN.y);
            this.displayObject.addChild(faucet);

            var handle = new PIXI.Graphics();
            handle.beginFill(Colors.parseHex(Constants.WATER_FILL_COLOR), 1);
            handle.lineStyle(1, 0x333333, 1);
            handle.drawRect(-5, -10, 10, 20);
            handle.endFill();

            this.sliderView = new SliderView({
                start: 0,
                range: {
                    min: 0,
                    max: 1
                },
                orientation: 'horizontal',
                direction: 'ltr',

                width: 82,
                backgroundHeight: 7,
                backgroundColor: '#fff',
                backgroundAlpha: 0.2,
                backgroundLineColor: '#000',
                backgroundLineWidth: 1,
                backgroundLineAlpha: 0.4,
                
                handle: handle
            });
            this.sliderView.displayObject.x = 5;
            this.sliderView.displayObject.y = 8;
            faucet.addChild(this.sliderView.displayObject);

            this.listenTo(this.sliderView, 'slide', function(value, prev) {
                this.model.set('flowProportion', value);
            });

            this.listenTo(this.model, 'change:active', function(active) {
                if (!active)
                    this.sliderView.val(0);
            })

            this.drawDebugOrigin();
        },

        initWater: function() {
            this.waterLayer = new PIXI.DisplayObjectContainer();
            this.displayObject.addChild(this.waterLayer);

            this.listenTo(this.model.waterDrops, 'add', this.addWaterDrop);
            this.listenTo(this.model.waterDrops, 'reset', function() {
                this.waterLayer.removeChildren();
            });
        },

        addWaterDrop: function(waterDrop) {
            var waterDropView = new WaterDropView({
                model: waterDrop,
                mvt: this.mvt
            });
            this.waterLayer.addChild(waterDropView.displayObject);

            this.listenTo(waterDrop, 'destroy', function() {
                this.waterLayer.removeChild(waterDropView.displayObject);
                this.stopListening(waterDrop);
            });
        }

    });

    return FaucetView;
});
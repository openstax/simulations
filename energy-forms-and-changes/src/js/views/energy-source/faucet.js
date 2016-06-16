define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var Colors                  = require('common/colors/colors');
    var SliderView              = require('common/v3/pixi/view/slider');
    var EnergySourceView        = require('views/energy-source');
    var WaterDropCollectionView = require('views/water-drop-collection');

    var Constants = require('constants');

    var Assets = require('assets');

    var FaucetView = EnergySourceView.extend({

        /**
         *
         */
        initialize: function(options) {
            EnergySourceView.prototype.initialize.apply(this, [options]);
        },

        initGraphics: function() {
            EnergySourceView.prototype.initGraphics.apply(this);

            this.initWater();
            this.initFaucet();
        },

        initFaucet: function() {
            var faucetFront = Assets.createSprite(Assets.Images.FAUCET_FRONT);
            var faucetPipe  = Assets.createSprite(Assets.Images.FAUCET_PIPE);

            faucetPipe.anchor.x = 1;
            faucetPipe.scale.x = 200; // Make it go off the screen and disappear
            faucetPipe.y = 32; // Line it up with the faucet front graphic

            var faucet = new PIXI.Container();
            faucet.addChild(faucetFront);
            faucet.addChild(faucetPipe);
            this.displayObject.addChild(faucet);

            var imageScale = this.getImageScale();

            /* 
             * The original simulation uses an instance of FaucetNode
             *   (from phet.common.piccolophet.nodes.faucet.FaucetNode)
             *   in whose constructor they pass a mysterious integer
             *   literal *40*, but the source for FaucetNode is not in
             *   their SVN trunk for some reason, so I don't know what
             *   that value represents.  However, they scale the faucet
             *   node later by 0.9, and if I multiply 40 by 0.9, I get
             *   36, which if I divide by two and use to offset the
             *   image--as can be seen below--the faucet seems to be
             *   lined up correctly with the water coming out.
             */
            var offsetX = (-(faucetFront.width / 2) - 18) * imageScale;
            var offsetY = (-faucetFront.height + 18) * imageScale;
            faucet.x = offsetX + this.mvt.modelToViewDeltaX(Constants.Faucet.OFFSET_FROM_CENTER_TO_WATER_ORIGIN.x);
            faucet.y = offsetY + this.mvt.modelToViewDeltaY(Constants.Faucet.OFFSET_FROM_CENTER_TO_WATER_ORIGIN.y);

            
            faucet.scale.x = faucet.scale.y = imageScale * 0.9;
            
            var handle = new PIXI.Graphics();
            handle.beginFill(Colors.parseHex(Constants.WATER_FILL_COLOR), 1);
            handle.lineStyle(1, 0x333333, 1);
            handle.drawRect(-5 * (1 / imageScale), -10 * (1 / imageScale), 10 * (1 / imageScale), 20 * (1 / imageScale));
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

            this.listenTo(this.model, 'change:active', function(model, active) {
                if (!active)
                    this.sliderView.val(0);
            });

            // this.drawDebugOrigin();
        },

        initWater: function() {
            this.waterLayer = new PIXI.Container();
            this.displayObject.addChild(this.waterLayer);

            this.waterDropCollectionView = new WaterDropCollectionView({
                collection: this.model.waterDrops,
                mvt: this.mvt
            });

            this.waterLayer.addChild(this.waterDropCollectionView.displayObject);
        },

        update: function(time, deltaTime, paused) {
            EnergySourceView.prototype.update.apply(this, arguments);
            
            this.waterDropCollectionView.update(time, deltaTime, paused);
        }

    });

    return FaucetView;
});
define(function(require) {

    'use strict';

    var _       = require('underscore');
    var PIXI    = require('pixi');
    //var Vector2 = require('common/math/vector2');
    var PiecewiseCurve = require('common/math/piecewise-curve');

    var ElementView = require('views/element');
    var SliderView  = require('common/pixi/view/slider');
    //var Assets      = require('assets');

    var Constants = require('constants');

    /**
     * A view that represents a block model
     */
    var BurnerView = ElementView.extend({

        /**
         *
         */
        initialize: function(options) {
            options = _.extend({
                width:  10,
                height: 10,
                openingHeight: 2,
            }, options);

            this.width = options.width;
            this.height = options.height;
            this.openingHeight = options.openingHeight;

            ElementView.prototype.initialize.apply(this, [options]);
        },

        initGraphics: function() {
            // Layers
            this.backLayer        = new PIXI.DisplayObjectContainer();
            this.frontLayer       = new PIXI.DisplayObjectContainer();
            this.energyChunkLayer = new PIXI.DisplayObjectContainer();

            this.backLayer.addChild(this.energyChunkLayer);

            this.energyChunkLayer.visible = false;

            // Graphical components
            this.initBucket();
            this.initControls();
        },

        initBucket: function() {
            var width = this.width;
            var height = this.height;
            var openingHeight = this.openingHeight;
            var bottomWidth = width * 0.8;

            // Bucket inside (just an ellipse)
            var bucketInsideCurve = new PiecewiseCurve();
            bucketInsideCurve
                .moveTo(0, 0)
                .curveTo(
                    0,     -openingHeight / 2,
                    width, -openingHeight / 2,
                    width, 0
                )
                .curveTo(
                    width, openingHeight / 2,
                    0,     openingHeight / 2,
                    0,     0
                )
                .close();

            var bucketInsideStyle = {
                lineWidth: 1,
                strokeStyle: '#000',
                fillStyle: function(ctx, width, height) {
                    var gradient = ctx.createLinearGradient(0, 0, width, 0);
                    gradient.addColorStop(0, '#535e6a');
                    gradient.addColorStop(1, '#cdd7e2');
                    ctx.fillStyle = gradient;
                }
            };

            // Bucket outside
            var bucketOutsideCurve = new PiecewiseCurve();
            bucketOutsideCurve
                .moveTo(0, 0)                              // Start in upper left corner
                .curveTo(                                  // Curve to upper right corner
                    0,     openingHeight / 2,
                    width, openingHeight / 2,
                    width, 0
                )
                .lineTo((width + bottomWidth) / 2, height) // Line down to lower right corner
                .curveTo(                                  // Curve over to lower left corner
                    (width + bottomWidth) / 2, height + openingHeight / 2,
                    (width - bottomWidth) / 2, height + openingHeight / 2,
                    (width - bottomWidth) / 2, height
                )
                .lineTo(0, 0)                              // Line back up to upper left corner
                .close();

            var bucketOutsideStyle = {
                lineWidth: 2,
                strokeStyle: '#444',
                fillStyle: function(ctx, width, height) {
                    var gradient = ctx.createLinearGradient(0, 0, width, 0);
                    gradient.addColorStop(0, '#ced9e5');
                    gradient.addColorStop(1, '#7a8b9b');
                    
                    ctx.fillStyle = gradient;
                }
            };

            var bucketInside = PIXI.Sprite.fromPiecewiseCurve(bucketInsideCurve, bucketInsideStyle);
            bucketInside.x = -width / 2;
            bucketInside.y = -height;
            this.backLayer.addChild(bucketInside);

            var bucketOutside = PIXI.Sprite.fromPiecewiseCurve(bucketOutsideCurve, bucketOutsideStyle);
            bucketOutside.x = -width / 2;
            bucketOutside.y = -height;
            this.frontLayer.addChild(bucketOutside);
        },

        initControls: function() {
            // Slider background (hot to cold)
            var bgHeight = this.height * 0.6;
            var bgWidth  = 6;

            var canvas = document.createElement('canvas');
            canvas.width  = bgWidth;
            canvas.height = bgHeight;

            var ctx = canvas.getContext('2d');

            var gradient = ctx.createLinearGradient(0, 0, 0, bgHeight);
            gradient.addColorStop(0, BurnerView.HOT_COLOR);
            gradient.addColorStop(1, BurnerView.COLD_COLOR);
            
            ctx.fillStyle = gradient;
            ctx.lineWidth   = 1;
            ctx.strokeStyle = '#000';

            ctx.rect(0, 0, bgWidth, bgHeight);
            ctx.fill();
            ctx.stroke();

            var sliderBackground = new PIXI.Sprite(PIXI.Texture.fromCanvas(canvas));
            sliderBackground.anchor.x = 0.5;

            // Slider handle

            this.sliderView = new SliderView({
                orientation: 'vertical',
                background: sliderBackground
            });
            this.sliderView.displayObject.y = -(this.sliderView.height + this.height) / 2 + this.openingHeight / 2;
            this.frontLayer.addChild(this.sliderView.displayObject);
            this.listenTo(this.sliderView, 'slide', function(value, prev) {
                console.log(value);
            });
        },

        updatePosition: function(model, position) {
            var viewPoint = this.mvt.modelToView(position);
            this.backLayer.x = this.frontLayer.x = viewPoint.x;
            this.backLayer.y = this.frontLayer.y = viewPoint.y;
        },

        showEnergyChunks: function() {
            this.energyChunkLayer.visible = true;
        },

        hideEnergyChunks: function() {
            this.energyChunkLayer.visible = false;
        }

    }, Constants.BurnerView);

    return BurnerView;
});
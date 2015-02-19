define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PiecewiseCurve   = require('../../math/piecewise-curve');
    var PixiView         = require('../view');
    var SliderView       = require('./slider');

    var Assets = require('assets');

    var HOT_COLOR  = '#ff4500';
    var COLD_COLOR = '#0000f0';

    var HeaterCoolerViewModel = Backbone.Model.extend({
        defaults: {
            heatCoolLevel: 0
        }
    });

    /**
     * A view that creates a bucket with ice and fire that the user 
     *   can control to add or remove heat from something. The view
     *   uses a HeaterCoolerViewModel to record the current heating
     *   and cooling amount or any model that has a 'heatCoolLevel'
     *   attribute.
     */
    var HeaterCoolerView = PixiView.extend({

        initialize: function(options) {
            options = _.extend({
                width:  100,
                height: 100,
                openingHeight: 2,

                textFont: 'bold 17px Arial',
                textColor: '#000',
                lineWidth: 2,
                lineColor: '#444',

                heatingEnabled: true,
                coolingEnabled: true,
                sliderReturnsToCenter: true,

                iceAssetReference:  '',
                fireAssetReference: ''
            }, options);

            this.width = options.width;
            this.height = options.height;
            this.openingHeight = options.openingHeight;

            this.textFont  = options.textFont;
            this.textColor = options.textColor;
            this.lineWidth = options.lineWidth;
            this.lineColor = options.lineColor;

            this.heatingEnabled = options.heatingEnabled;
            this.coolingEnabled = options.coolingEnabled;
            this.sliderReturnsToCenter = options.sliderReturnsToCenter;

            this.iceAssetReference  = options.iceAssetReference;
            this.fireAssetReference = options.fireAssetReference;

            this.initGraphics();
        },

        initGraphics: function() {
            // Layers
            this.backLayer  = new PIXI.DisplayObjectContainer();
            this.frontLayer = new PIXI.DisplayObjectContainer();

            this.displayObject.addChild(this.backLayer);
            this.displayObject.addChild(this.frontLayer);

            // Graphical components
            this.initBucket();
            this.initSlider();
            this.initFire();
            this.initIce();
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
                lineWidth: this.lineWidth / 2,
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
                lineWidth: this.lineWidth,
                strokeStyle: this.lineColor,
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

        initSlider: function() {
            var sliderOffset = Math.round(-this.width * 0.18);
            var textOffset   = Math.round(-this.width * 0.08);
            // Slider background (hot to cold)
            var bgHeight = this.height * 0.6;
            var bgWidth  = 6;

            var canvas = document.createElement('canvas');
            canvas.width  = bgWidth;
            canvas.height = bgHeight;
            var ctx = canvas.getContext('2d');

            var gradient = ctx.createLinearGradient(0, 0, 0, bgHeight);
            gradient.addColorStop(0, HOT_COLOR);
            gradient.addColorStop(1, COLD_COLOR);
            
            ctx.fillStyle = gradient;
            ctx.lineWidth   = 1;
            ctx.strokeStyle = '#000';
            ctx.rect(0, 0, bgWidth, bgHeight);
            ctx.fill();
            ctx.stroke();

            var sliderBackground = new PIXI.Sprite(PIXI.Texture.fromCanvas(canvas));
            sliderBackground.anchor.x = 0.5;

            // Create the slider view
            this.sliderView = new SliderView({
                start: 0,
                range: {
                    min: this.coolingEnabled ? -1 : 0,
                    max: this.heatingEnabled ?  1 : 0
                },
                orientation: 'vertical',
                direction: 'rtl',

                background: sliderBackground,
                handleColor: '#ced9e5',
                handleLineColor: '#444',
                handleLineWidth: 2
            });
            this.sliderView.displayObject.x = sliderOffset;
            this.sliderView.displayObject.y = -(this.sliderView.height + this.height) / 2 + this.openingHeight / 2;
            this.frontLayer.addChild(this.sliderView.displayObject);

            // Bind events
            this.listenTo(this.sliderView, 'slide', function(value, prev) {
                var percent = Math.abs(value);
                if (value > 0) {
                    this.ice.anchor.y = 0;
                    this.fire.anchor.y = percent * 0.9;
                }
                else {
                    this.fire.anchor.y = 0;
                    this.ice.anchor.y = percent * 0.9;
                }
                this.model.set('heatCoolLevel', value);
            });

            if (this.sliderReturnsToCenter) {
                this.listenTo(this.sliderView, 'drag-end', function() {
                    this.sliderView.val(0);
                    this.fire.anchor.y = 0;
                    this.ice.anchor.y = 0;
                    this.model.set('heatCoolLevel', 0);
                });    
            }

            // Labels
            var textStyle = {
                font: this.textFont,
                fill: this.textColor,
                dropShadowColor: '#ced9e5',
                dropShadow: true,
                dropShadowAngle: 2 * Math.PI,
                dropShadowDistance: 1
            };

            if (this.heatingEnabled) {
                var heat = new PIXI.Text('Heat', textStyle);
                heat.anchor.y = 0.1;
                heat.x = textOffset;
                heat.y = this.sliderView.displayObject.y;
                this.frontLayer.addChild(heat);    
            }
            
            if (this.coolingEnabled) {
                var cool = new PIXI.Text('Cool', textStyle);
                cool.anchor.y = 0.64;
                cool.x = textOffset;
                cool.y = this.sliderView.displayObject.y + this.sliderView.displayObject.height;
                this.frontLayer.addChild(cool);
            }
        },

        initFire: function() {
            this.fire = Assets.createSprite(this.fireAssetReference);
            var scale = (this.width * 0.8) / this.fire.texture.width;
            this.fire.scale.x = scale;
            this.fire.scale.y = scale;
            this.fire.anchor.x = 0.5;
            this.fire.y = -this.height + this.openingHeight / 2;
            this.backLayer.addChild(this.fire);
        },

        initIce: function() {
            this.ice = Assets.createSprite(this.iceAssetReference);
            var scale = (this.width * 0.8) / this.ice.texture.width;
            this.ice.scale.x = scale;
            this.ice.scale.y = scale;
            this.ice.anchor.x = 0.5;
            this.ice.y = -this.height + this.openingHeight / 2;
            this.backLayer.addChild(this.ice);
        }

    }, {

        HeaterCoolerViewModel: HeaterCoolerViewModel

    });

    return HeaterCoolerView;
});
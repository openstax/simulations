define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PiecewiseCurve = require('common/math/piecewise-curve');
    var SliderView     = require('common/v3/pixi/view/slider');

    var IntroElementView          = require('views/intro-element');
    var EnergyChunkCollectionView = require('views/energy-chunk-collection');
    

    var Assets    = require('assets');
    var Constants = require('constants');

    /**
     * A view that represents a burner model or any model
     *   with a 'heatCoolLevel' property as long as the
     *   view gets positioned externally after creation.
     */
    var BurnerView = IntroElementView.extend({

        initialize: function(options) {
            options = _.extend({
                width:  10,
                height: 10,
                openingHeight: 2,
                textFont: BurnerView.TEXT_FONT,
                textColor: BurnerView.TEXT_COLOR,
                heatingEnabled: true,
                coolingEnabled: true,
                sliderReturnsToCenter: true,
                energyChunkCollection: null
            }, options);

            this.width = options.width;
            this.height = options.height;
            this.openingHeight = options.openingHeight;
            this.heatingEnabled = options.heatingEnabled;
            this.coolingEnabled = options.coolingEnabled;
            this.sliderReturnsToCenter = options.sliderReturnsToCenter;
            this.energyChunkCollection = options.energyChunkCollection;

            IntroElementView.prototype.initialize.apply(this, [options]);

            /* This view can be used with any model--not necessarily
             *   a Burner model--and therefore we want this view
             *   being positioned wherever that model is because
             *   model may not be the actual burner.  The burner
             *   also will not move during the simulation, so it's
             *   safe to turn this off.
             */
            this.stopListening(this.model, 'change:position');
        },

        initGraphics: function() {
            // Layers
            this.backLayer        = new PIXI.Container();
            this.frontLayer       = new PIXI.Container();
            this.energyChunkLayer = new PIXI.Container();

            // Graphical components
            this.initBucket();
            this.initSlider();
            this.initFire();
            this.initIce();
            this.initEnergyChunks();
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
                    this.fire.anchor.y = percent;
                }
                else {
                    this.fire.anchor.y = 0;
                    this.ice.anchor.y = percent;
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
                heat.anchor.y = 0;
                heat.x = textOffset;
                heat.y = this.sliderView.displayObject.y;
                this.frontLayer.addChild(heat);    
            }
            
            if (this.coolingEnabled) {
                var cool = new PIXI.Text('Cool', textStyle);
                cool.anchor.y = 0.82;
                cool.x = textOffset;
                cool.y = this.sliderView.displayObject.y + bgHeight;
                this.frontLayer.addChild(cool);
            }
        },

        initFire: function() {
            this.fire = Assets.createSprite(Assets.Images.FLAME);
            var scale = (this.width * 0.8) / this.fire.texture.width;
            this.fire.scale.x = scale;
            this.fire.scale.y = scale;
            this.fire.anchor.x = 0.5;
            this.fire.y = -this.height + this.openingHeight / 2;
            this.backLayer.addChild(this.fire);
        },

        initIce: function() {
            this.ice = Assets.createSprite(Assets.Images.ICE_CUBE_STACK);
            var scale = (this.width * 0.8) / this.ice.texture.width;
            this.ice.scale.x = scale;
            this.ice.scale.y = scale;
            this.ice.anchor.x = 0.5;
            this.ice.y = -this.height + this.openingHeight / 2;
            this.backLayer.addChild(this.ice);
        },

        initEnergyChunks: function() {
            this.energyChunkLayer.visible = false;

            this.energyChunkCollectionView = new EnergyChunkCollectionView({
                collection: this.energyChunkCollection,
                mvt: this.mvt
            });

            this.energyChunkLayer.addChild(this.energyChunkCollectionView.displayObject);
        },

        updatePosition: function(model, position) {
            var viewPoint = this.mvt.modelToView(position);
            this.setPosition(viewPoint.x, viewPoint.y);
        },

        setPosition: function(x, y) {
            this.backLayer.x = this.frontLayer.x = x;
            this.backLayer.y = this.frontLayer.y = y;
        },

        showEnergyChunks: function() {
            this.energyChunkLayer.visible = true;
        },

        hideEnergyChunks: function() {
            this.energyChunkLayer.visible = false;
        },

        update: function(time, deltaTime) {
            this.energyChunkCollectionView.update(time, deltaTime);
        }

    }, Constants.BurnerView);

    return BurnerView;
});
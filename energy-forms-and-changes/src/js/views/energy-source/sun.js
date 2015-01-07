define(function(require) {

    'use strict';

    var _ = require('underscore');
    var $ = require('jquery');
    var PIXI = require('pixi');

    var Colors     = require('common/colors/colors');
    var SliderView = require('common/pixi/view/slider');
    var Rectangle  = require('common/math/rectangle');

    var EnergySourceView   = require('views/energy-source');
    var LightRaySourceView = require('views/light-ray-source');
    var LightAbsorbingShape = require('views/light-absorbing-shape');
    var CloudView          = require('views/cloud');

    var Constants = require('constants');

    var SunView = EnergySourceView.extend({

        /**
         *
         */
        initialize: function(options) {
            options = _.extend({
                
            }, options);

            EnergySourceView.prototype.initialize.apply(this, [options]);
        },

        initGraphics: function() {
            EnergySourceView.prototype.initGraphics.apply(this);

            var sunRadius = this.mvt.modelToViewDeltaX(Constants.Sun.RADIUS);
            var sunCenter = this.mvt.modelToViewDelta(Constants.Sun.OFFSET_TO_CENTER_OF_SUN);
            
            this.initOrb(sunRadius, sunCenter);
            this.initRays(sunRadius, sunCenter);
            this.initControls();
            this.initClouds();

            this.drawDebugOrigin();
        },

        initOrb: function(sunRadius, sunCenter) {
            // Create a texture
            var sunTexture = PIXI.Texture.generateCircleTexture(
                sunRadius, 
                0, 
                sunRadius * SunView.GRADIENT_END, 
                SunView.INNER_FILL_COLOR, 
                SunView.OUTER_FILL_COLOR,
                SunView.LINE_WIDTH,
                SunView.LINE_COLOR
            );

            // Create a sprite
            var sunSprite = new PIXI.Sprite(sunTexture);
            sunSprite.anchor.x = sunSprite.anchor.y = 0.5;

            // Move the sprite
            sunSprite.x = sunCenter.x;
            sunSprite.y = sunCenter.y;

            // Add it
            this.displayObject.addChild(sunSprite);
        },

        initRays: function(sunRadius, sunCenter) {
            // Create a ray source
            var raySource = new LightRaySourceView({
                center:      sunCenter, 
                innerRadius: sunRadius, 
                outerRadius: 1000,      
                numRays:     40,            
                color:       SunView.RAY_COLOR
            });

            // Save it
            this.lightRays = raySource.displayObject;
            this.raySource = raySource;

            // Add it
            this.displayObject.addChild(this.lightRays);
        },

        initClouds: function() {
            this.cloudLayer = new PIXI.DisplayObjectContainer();
            this.model.clouds.each(function(cloud) {
                var cloudView = new CloudView({
                    model: cloud,
                    mvt: this.mvt
                });
                this.cloudLayer.addChild(cloudView.displayObject);

                var relativeShape = this.mvt.modelToViewDelta(cloud.getRelativelyPositionedShape().getBounds());
                var shape = new LightAbsorbingShape({
                    shape: new Rectangle(relativeShape.x, relativeShape.y - cloudView.displayObject.height, cloudView.displayObject.width, cloudView.displayObject.height),
                    lightAbsorptionCoefficient: 0
                });
                console.log(shape.get('shape'));
                this.listenTo(cloud, 'change:existenceStrength', function(model, existenceStrength) {
                    shape.set('lightAbsorptionCoefficient', existenceStrength / 10);
                });
                this.raySource.addLightAbsorbingShape(shape);
            }, this);
        },

        initControls: function() {
            // Create a panel
            var panel = new PIXI.DisplayObjectContainer();
            var panelOffset = this.mvt.modelToViewDelta(Constants.SunView.PANEL_OFFSET).clone();
            var panelWidth  = this.mvt.modelToViewDeltaX(Constants.SunView.PANEL_WIDTH);
            var panelHeight = -this.mvt.modelToViewDeltaY(Constants.SunView.PANEL_HEIGHT);

            // Paint it
            var panelRgba = Colors.toRgba($('.energy-system-elements-panel').css('background-color'), true);
            var panelColor = Colors.rgbToHexInteger(panelRgba.r, panelRgba.g, panelRgba.b);
            var panelAlpha = panelRgba.a;

            var panelBackground = new PIXI.Graphics();
            panelBackground.beginFill(panelColor, panelAlpha);
            panelBackground.drawRect(0, 0, panelWidth, panelHeight);
            panelBackground.endFill();
            panel.addChild(panelBackground);

            // Move it
            panel.x = panelOffset.x;
            panel.y = panelOffset.y;
            
            // Add it
            this.displayObject.addChild(panel);

            // Block rays behind it
            //var globalPanelPosition = panel.getGlobalPosition();
            this.raySource.addLightAbsorbingShape(new LightAbsorbingShape({
                shape: new Rectangle(panelOffset.x, panelOffset.y, panelWidth, panelHeight),
                lightAbsorptionCoefficient: 0.2
            }));

            var bgHeight = panelHeight * 0.6;
            var bgWidth  = SunView.SLIDER_WIDTH;

            var canvas = document.createElement('canvas');
            canvas.width  = bgWidth;
            canvas.height = bgHeight;
            var ctx = canvas.getContext('2d');

            var gradient = ctx.createLinearGradient(0, 0, 0, bgHeight);
            gradient.addColorStop(0, SunView.SLIDER_BG_FILL_TOP);
            gradient.addColorStop(1, SunView.SLIDER_BG_FILL_BOTTOM);
            
            ctx.fillStyle = gradient;
            ctx.lineWidth   = 1;
            ctx.strokeStyle = SunView.SLIDER_BG_LINE_COLOR;
            ctx.rect(0, 0, bgWidth, bgHeight);
            ctx.fill();
            ctx.stroke();

            var sliderBackground = new PIXI.Sprite(PIXI.Texture.fromCanvas(canvas));
            sliderBackground.anchor.x = 0.5;

            // Create slider
            var sliderView = new SliderView({
                start: 0,
                range: {
                    min: 0,
                    max: 1
                },
                orientation: 'vertical',
                direction: 'rtl',

                background: sliderBackground,
                
                handleColor: SunView.SLIDER_HANDLE_FILL_COLOR,
                handleLineColor: SunView.SLIDER_HANDLE_LINE_COLOR,
                handleLineWidth: 2,
                handleSize: 12
            });

            // Position it
            sliderView.displayObject.x = panelWidth * 0.3;
            sliderView.displayObject.y = panelHeight * 0.3;

            // Bind events for it
            this.listenTo(sliderView, 'slide', function(value, prev) {
                this.model.set('cloudiness', value);
            });
            this.listenTo(this.model, 'change:active', function(model, active) {
                if (!active)
                    sliderView.val(0);
            });

            // Add it
            panel.addChild(sliderView.displayObject);

            // Create labels
            var textStyle = {
                font: SunView.LABEL_FONT,
                fill: SunView.LABEL_COLOR
            };

            var lots = new PIXI.Text('- Lots', textStyle);
            lots.anchor.y = 0.5;
            lots.x = panelWidth * 0.4;
            lots.y = panelHeight * 0.3;
            panel.addChild(lots);

            var none = new PIXI.Text('- None', textStyle);
            none.anchor.y = 0.5;
            none.x = panelWidth * 0.4;
            none.y = panelHeight * 0.9;
            panel.addChild(none);

            var title = new PIXI.Text('Clouds', {
                font: SunView.LABEL_TITLE_FONT,
                fill: SunView.LABEL_COLOR
            });
            title.anchor.y = 0;
            title.x = panelWidth * 0.1;
            title.y = panelHeight * 0.1;
            panel.addChild(title);    
            
        },

        showEnergyChunks: function() {
            EnergySourceView.prototype.showEnergyChunks.apply(this);
            this.lightRays.visible = false;
        },

        hideEnergyChunks: function() {
            EnergySourceView.prototype.hideEnergyChunks.apply(this);
            this.lightRays.visible = true;
        },

    }, Constants.SunView);

    return SunView;
});
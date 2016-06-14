define(function(require) {

    'use strict';

    var _ = require('underscore');
    var $ = require('jquery');
    var PIXI = require('pixi');

    var Colors     = require('common/colors/colors');
    var SliderView = require('common/v3/pixi/view/slider');
    var Rectangle  = require('common/math/rectangle');

    var EnergySourceView   = require('views/energy-source');
    var LightRaySourceView = require('views/light-ray-source');
    var LightAbsorbingShape = require('views/light-absorbing-shape');
    var CloudView          = require('views/cloud');

    var Constants = require('constants');

    var Assets = require('assets');

    var SunView = EnergySourceView.extend({

        initialize: function(options) {
            options = _.extend({
                
            }, options);

            EnergySourceView.prototype.initialize.apply(this, [options]);
        },

        initGraphics: function() {
            EnergySourceView.prototype.initGraphics.apply(this);

            var sunRadius = this.mvt.modelToViewDeltaX(Constants.Sun.RADIUS);
            var sunCenter = this.mvt.modelToViewDelta(Constants.Sun.OFFSET_TO_CENTER_OF_SUN);
            
            this.initSky(sunCenter);
            this.initOrb(sunRadius, sunCenter);
            this.initRays(sunRadius, sunCenter);
            this.initControls();
            this.initClouds();

            this.raySource.update();

            this.listenTo(this.model,                   'change:active', this.updateSunAndSolarPanelActiveState);
            this.listenTo(this.model.get('solarPanel'), 'change:active', this.updateSunAndSolarPanelActiveState);
        },

        initSky: function(sunCenter) {
            // Create some blue sky background
            var blueSky = new PIXI.Sprite(PIXI.Texture.generateRoundParticleTexture(120, 600, '#82CFFD'));
            blueSky.anchor.x = blueSky.anchor.y = 0.5;

            // Move it
            blueSky.x = sunCenter.x;
            blueSky.y = sunCenter.y;

            // Put it in a separate layer to go behind everything
            this.skyLayer = new PIXI.Container();
            this.skyLayer.addChild(blueSky);
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
                outerRadius: 600, //SunView.RAY_DISTANCE,      
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
            this.cloudLayer = new PIXI.Container();
            this.model.clouds.each(function(cloud) {
                var cloudView = new CloudView({
                    model: cloud,
                    mvt: this.mvt
                });
                this.cloudLayer.addChild(cloudView.displayObject);

                var relativeShape = this.mvt.modelToViewDelta(cloud.getRelativelyPositionedShape());
                var shape = new LightAbsorbingShape({
                    shape: relativeShape,
                    lightAbsorptionCoefficient: 0
                });
                this.listenTo(cloud, 'change:existenceStrength', function(model, existenceStrength) {
                    shape.set('lightAbsorptionCoefficient', existenceStrength / 10);
                });
                this.raySource.addLightAbsorbingShape(shape);
            }, this);
        },

        initControls: function() {
            // Create a panel
            var panel = new PIXI.Container();
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
                lightAbsorptionCoefficient: 0.05
            }));
            this.raySource.addLightAbsorbingShape(new LightAbsorbingShape({
                shape: new Rectangle(panelOffset.x, panelOffset.y - 2, panelWidth, 20),
                lightAbsorptionCoefficient: 0.3
            }));

            var bgHeight = panelHeight * 0.55;
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
                font: Math.round(SunView.LABEL_FONT_SIZE * this.getImageScale()) + 'px ' + SunView.FONT_FAMILY,
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
            none.y = panelHeight * 0.85;
            panel.addChild(none);

            var title = new PIXI.Text('Clouds', {
                font: Math.round(SunView.TITLE_FONT_SIZE * this.getImageScale()) + 'px ' + SunView.FONT_FAMILY,
                fill: SunView.LABEL_COLOR
            });
            title.anchor.y = 0;
            title.x = panelWidth * 0.1;
            title.y = panelHeight * 0.1;
            panel.addChild(title);    
            
            // Create little cloud icon
            var cloudIcon = Assets.createSprite(Assets.Images.CLOUD_1);
            cloudIcon.scale.x = cloudIcon.scale.y = (SunView.CLOUD_ICON_WIDTH / cloudIcon.width) * this.getImageScale();
            cloudIcon.anchor.x = cloudIcon.anchor.y = 0.5;
            cloudIcon.x = panelWidth - (panelWidth - (title.y + title.width)) / 2;
            cloudIcon.y = title.y + title.height / 2 - 2;
            panel.addChild(cloudIcon);
        },

        showEnergyChunks: function() {
            EnergySourceView.prototype.showEnergyChunks.apply(this);
            this.lightRays.visible = false;
        },

        hideEnergyChunks: function() {
            EnergySourceView.prototype.hideEnergyChunks.apply(this);
            this.lightRays.visible = true;
        },

        updatePosition: function(model, position) {
            var viewPoint = this.mvt.modelToView(position);
            this.displayObject.x = this.skyLayer.x = viewPoint.x;
            this.displayObject.y = this.skyLayer.y = viewPoint.y;
        },

        updateOpacity: function(model, opacity) {
            EnergySourceView.prototype.updateOpacity.apply(this, [model, opacity]);
            this.skyLayer.alpha = opacity;
        },

        updateSunAndSolarPanelActiveState: function() {
            var sun        = this.model;
            var solarPanel = this.model.get('solarPanel');

            if (sun.active() && solarPanel.active()) {
                if (!this.solarPanelAbsorptionShape) {
                    /*
                     * To get the shape in model space positioned relative to
                     *   the sun, we need to subtract the sun's position from
                     *   the solar panel's globally positioned shape.  Then
                     *   we'll need to transform it into view space to use it.
                     */
                    var x = sun.get('position').x;
                    var y = sun.get('position').y;
                    var shapeRelativeToSun = solarPanel.getTranslatedAbsorptionShape(-x, -y);
                    var viewSpaceShape = this.mvt.modelToViewDelta(shapeRelativeToSun);

                    this.solarPanelAbsorptionShape = new LightAbsorbingShape({
                        shape: viewSpaceShape,
                        lightAbsorptionCoefficient: 1
                    });
                    this.solarPanelAbsorptionShape.cid = 'solar-panel';
                }
                
                this.raySource.addLightAbsorbingShape(this.solarPanelAbsorptionShape);
                this.raySource.update();
            }
            else if (this.solarPanelAbsorptionShape) {
                this.raySource.removeLightAbsorbingShape(this.solarPanelAbsorptionShape);
                this.raySource.update();
            }
        }

    }, Constants.SunView);

    return SunView;
});
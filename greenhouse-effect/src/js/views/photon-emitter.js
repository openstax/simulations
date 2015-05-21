define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    require('common/pixi/extensions');
    
    var PixiView   = require('common/pixi/view');
    var SliderView = require('common/pixi/view/slider');
    var Colors     = require('common/colors/colors');

    var PhotonAbsorptionSimulation = require('models/simulation/photon-absorption');

    var Constants = require('constants');
    var PhotonTargets = PhotonAbsorptionSimulation.PhotonTargets;

    var Assets = require('assets');

    /**
     * A view that represents an atom
     */
    var PhotonEmitterView = PixiView.extend({

        /**
         * Initializes the new PhotonEmitterView.
         */
        initialize: function(options) {
            this.initGraphics();

            this.infraredMode();

            this.listenTo(this.model, 'change:photonTarget', this.photonTargetChanged);

            this.updateMVT(options.mvt);
        },

        /**
         * Initializes all the graphics
         */
        initGraphics: function() {
            this.sunlightEmitter = Assets.createSprite(Assets.Images.PHOTON_EMITTER_SUNLIGHT);
            this.infraredEmitter = Assets.createSprite(Assets.Images.PHOTON_EMITTER_INFRARED);

            this.sunlightEmitter.anchor.x = this.infraredEmitter.anchor.x = 1;
            this.sunlightEmitter.anchor.y = this.infraredEmitter.anchor.y = 0.5;

            // The sunlight graphic is slightly larger than the infrared, so fix that.
            this.sunlightEmitter.scale.x = this.sunlightEmitter.scale.y = 0.83;

            this.displayObject.addChild(this.infraredEmitter);
            this.displayObject.addChild(this.sunlightEmitter);

            this.initSlider();
            this.initPhotonTypeControls();
        },

        /**
         * Initializes the emission rate slider
         */
        initSlider: function() {
            // Create the background gradients for the slider
            var bgHeight = this.infraredEmitter.height * 0.23;
            var bgWidth  = this.infraredEmitter.width  * 0.36;

            var infraredTexture = PIXI.Texture.generateHoriztonalGradientTexture(bgWidth, bgHeight, '#000', Constants.INFRARED_COLOR);
            var infraredBackground = new PIXI.Sprite(infraredTexture);
            this.infraredBackground = infraredBackground;
            this.displayObject.addChild(infraredBackground);

            var sunlightTexture = PIXI.Texture.generateHoriztonalGradientTexture(bgWidth, bgHeight, '#000', Constants.SUNLIGHT_COLOR);
            var sunlightBackground = new PIXI.Sprite(sunlightTexture);
            this.sunlightBackground = sunlightBackground;
            this.displayObject.addChild(sunlightBackground);

            var bgX = -bgWidth - this.infraredEmitter.width * 0.33;
            var bgY = -bgHeight / 2;

            infraredBackground.x = sunlightBackground.x = bgX;
            infraredBackground.y = sunlightBackground.y = bgY;

            var backgroundBorder = new PIXI.Graphics();
            backgroundBorder.lineStyle(1, 0xFFFFFF, 1);
            backgroundBorder.drawRect(bgX, bgY, bgWidth, bgHeight);
            this.displayObject.addChild(backgroundBorder);

            // Create the slider view
            var sliderWidth = 80;
            var sliderView = new SliderView({
                start: 0,
                range: {
                    min: 0,
                    max: 1
                },
                orientation: 'horizontal',
                direction: 'rtl',

                width: sliderWidth,
                backgroundHeight: 4,
                backgroundColor: '#929091',
                backgroundAlpha: 1,
                backgroundLineColor: '#524F4F',
                backgroundLineWidth: 1,
                backgroundLineAlpha: 1,

                handleColor: '#eee',
                handleAlpha: 1,
                handleLineColor: '#fff',
                handleLineWidth: 2
            });
            sliderView.displayObject.x = infraredBackground.x + (bgWidth - sliderWidth) / 2;
            this.displayObject.addChild(sliderView.displayObject);

            // Bind events
            this.listenTo(sliderView, 'slide', function(value, prev) {
                var percent = 1 - value;
                var emissionPeriod;

                if (percent === 0)
                    emissionPeriod = Number.POSITIVE_INFINITY;
                else if (this.model.get('photonTarget') === PhotonTargets.CONFIGURABLE_ATMOSPHERE)
                    emissionPeriod = PhotonAbsorptionSimulation.MIN_PHOTON_EMISSION_PERIOD_MULTIPLE_TARGET / percent;
                else 
                    emissionPeriod = PhotonAbsorptionSimulation.MIN_PHOTON_EMISSION_PERIOD_SINGLE_TARGET / percent;
                
                this.model.set('photonEmissionPeriod', emissionPeriod);
            });

            this.sliderView = sliderView;
        },

        /**
         * Initializes the controls for changing the photon type.
         */
        initPhotonTypeControls: function() {
            var width  = 135;
            var height =  90;

            var panel = new PIXI.DisplayObjectContainer();
            panel.x = -206;
            panel.y = 80;
            this.displayObject.addChild(panel);

            var panelBg = new PIXI.Graphics();
            panelBg.beginFill(0x929091, 0.5);
            panelBg.drawRect(0, 0, width, height);
            panelBg.endFill();
            panel.addChild(panelBg);

            // Clickable areas
            var clickTop = new PIXI.Graphics();
            clickTop.hitArea = new PIXI.Rectangle(0, 0, width, height / 2);
            clickTop.interactive = true;
            var clickBottom = new PIXI.Graphics();
            clickBottom.hitArea = new PIXI.Rectangle(0, height / 2, width, height / 2);
            clickBottom.interactive = true;
            panel.addChild(clickTop);
            panel.addChild(clickBottom);

            // Labels
            var options = {
                font: '20px Arial',
                fill: '#fff'
            };

            var infraredLabel = new PIXI.Text('Infrared', options);
            var sunlightLabel = new PIXI.Text('Sunlight', options);

            infraredLabel.anchor.x = 1;
            sunlightLabel.anchor.x = 1;

            infraredLabel.x = width - 15;
            sunlightLabel.x = width - 15;
            infraredLabel.y = 15;
            sunlightLabel.y = 50;

            panel.addChild(infraredLabel);
            panel.addChild(sunlightLabel);

            // Slider
            var sliderBackground = new PIXI.Sprite(
                PIXI.Texture.generateVerticalGradientTexture(6, 36, Constants.INFRARED_COLOR, Constants.SUNLIGHT_COLOR)
            );
            sliderBackground.anchor.x = 0.5;

            var sliderView = new SliderView({
                start: 1,
                range: {
                    min: 0,
                    max: 1
                },
                orientation: 'vertical',
                direction: 'rtl',

                background: sliderBackground,

                handleSize: 16,
                handleColor: '#eee',
                handleAlpha: 1,
                handleLineColor: '#fff',
                handleLineWidth: 2
            });
            sliderView.displayObject.x = 22;
            sliderView.displayObject.y = 27;
            panel.addChild(sliderView.displayObject);

            this.listenTo(sliderView, 'set', function(value, prev) {
                if (value === 1)
                    this.infraredMode();
                else
                    this.sunlightMode();
            });

            this.listenTo(sliderView, 'drag-end', function() {
                var value = sliderView.val();
                if (value > 0.5)
                    sliderView.val(1);
                else
                    sliderView.val(0);
            });   

            clickTop.click = function() {
                sliderView.val(1);
            };

            clickBottom.click = function() {
                sliderView.val(0);
            };
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            var bounds = PhotonAbsorptionSimulation.CONTAINMENT_AREA_RECT;
            this.displayObject.x = this.mvt.modelToViewX(bounds.x + bounds.w * 0.05);
            this.displayObject.y = this.mvt.modelToViewY(0);

            var targetSpriteHeight = this.mvt.modelToViewDeltaX(bounds.h * 0.25); // In pixels
            var scale = targetSpriteHeight / this.infraredEmitter.height;
            this.displayObject.scale.x = this.displayObject.scale.y = scale;
        },

        photonTargetChanged: function(simulation, photonTarget) {
            if ((
                photonTarget === PhotonTargets.CONFIGURABLE_ATMOSPHERE && 
                simulation.previous('photonTarget') !== PhotonTargets.CONFIGURABLE_ATMOSPHERE
            ) || (
                photonTarget !== PhotonTargets.CONFIGURABLE_ATMOSPHERE && 
                simulation.previous('photonTarget') === PhotonTargets.CONFIGURABLE_ATMOSPHERE
            )) {
                this.sliderView.val(1);
            }
        },

        infraredMode: function() {
            this.infraredBackground.visible = true;
            this.sunlightBackground.visible = false;
            this.infraredEmitter.visible = true;
            this.sunlightEmitter.visible = false;
            this.model.set('photonWavelength', Constants.IR_WAVELENGTH);
        },

        sunlightMode: function() {
            this.infraredBackground.visible = false;
            this.sunlightBackground.visible = true;
            this.infraredEmitter.visible = false;
            this.sunlightEmitter.visible = true;
            this.model.set('photonWavelength', Constants.SUNLIGHT_WAVELENGTH);
        }

    });

    return PhotonEmitterView;
});
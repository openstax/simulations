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

    var Assets    = require('assets');

    /**
     * A view that represents an atom
     */
    var PhotonEmitterView = PixiView.extend({

        /**
         * Initializes the new PhotonEmitterView.
         */
        initialize: function(options) {
            this.initGraphics();

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

            this.displayObject.addChild(this.infraredEmitter);

            this.initSlider();
        },

        initSlider: function() {
            // Create the background gradients for the slider
            var bgHeight = this.infraredEmitter.height * 0.23;
            var bgWidth  = this.infraredEmitter.width  * 0.36;

            var infraredTexture = PIXI.Texture.generateHoriztonalGradientTexture(bgWidth, bgHeight, '#000', '#DF2F00');
            var infraredBackground = new PIXI.Sprite(infraredTexture);
            this.infraredBackground = infraredBackground;
            this.displayObject.addChild(infraredBackground);

            var sunlightTexture = PIXI.Texture.generateHoriztonalGradientTexture(bgWidth, bgHeight, '#000', '#ffff00');
            var sunlightBackground = new PIXI.Sprite(sunlightTexture);
            this.sunlightBackground = sunlightBackground;
            //this.displayObject.addChild(sunlightBackground);

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
            var scale = targetSpriteHeight / this.displayObject.height;
            this.displayObject.scale.x = this.displayObject.scale.y = scale;
        }

    });

    return PhotonEmitterView;
});
define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView   = require('common/v3/pixi/view');
    var SliderView = require('common/v3/pixi/view/slider');

    var Assets = require('assets');

    var Constants = require('constants');

    /**
     * 
     */
    var ACPowerSupplyView = PixiView.extend({

        /**
         * Initializes the new ACPowerSupplyView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;

            this.initGraphics();

            this.listenTo(this.model, 'change:position',     this.updatePosition);
            this.listenTo(this.model, 'change:enabled',      this.enabledChanged);
            this.listenTo(this.model, 'change:maxAmplitude', this.maxAmplitudeChanged);
            this.listenTo(this.model, 'change:frequency',    this.frequencyChanged);
            this.enabledChanged(this.model, this.model.get('enabled'));
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.body = Assets.createSprite(Assets.Images.AC_POWER_SUPPLY);
            this.body.anchor.x = 0.5;
            this.body.anchor.y = 1;

            this.displayObject.addChild(this.body);

            this.initSliders();
            this.initValues();
            this.initTitle();
            this.initGraph();

            this.updateMVT(this.mvt);
        },

        initSliders: function() {
            var sliderSettings = {
                width: 96,
                backgroundHeight: 2,
                backgroundColor: '#000',
                backgroundAlpha: 0.4,

                handleColor: '#21366B'
            };

            // Amplitude slider
            this.amplitudeSlider = new SliderView(_.extend({
                start: this.model.get('maxAmplitude'),
                range: {
                    min: Constants.AC_MAXAMPLITUDE_MIN,
                    max: Constants.AC_MAXAMPLITUDE_MAX
                },
                orientation: 'vertical',
                direction: 'rtl'
            }, sliderSettings));

            this.amplitudeSlider.displayObject.x = -87;
            this.amplitudeSlider.displayObject.y = -137;

            // Frequency slider
            this.frequencySlider = new SliderView(_.extend({
                start: this.model.get('frequency'),
                range: {
                    min: Constants.AC_FREQUENCY_MIN,
                    max: Constants.AC_FREQUENCY_MAX
                },
                width: 100
            }, sliderSettings));

            this.frequencySlider.displayObject.x = -62;
            this.frequencySlider.displayObject.y = -24;

            // Bind events
            this.listenTo(this.amplitudeSlider, 'slide', function(amplitude, prev, event) {
                event.stopPropagation();
                this.model.set('maxAmplitude', amplitude);
            });

            this.listenTo(this.frequencySlider, 'slide', function(frequency, prev, event) {
                event.stopPropagation();
                this.model.set('frequency', frequency);
            });

            this.displayObject.addChild(this.amplitudeSlider.displayObject);
            this.displayObject.addChild(this.frequencySlider.displayObject);
        },

        initValues: function() {
            var textSettings = {
                font: '13px Helvetica Neue',
                fill: '#0f0',
                align: 'right'
            };

            this.amplitudeText = new PIXI.Text('50%', textSettings);
            this.frequencyText = new PIXI.Text('50%', textSettings);

            this.amplitudeText.anchor.x = 1;
            this.amplitudeText.x = -68;
            this.amplitudeText.y = -169;

            this.frequencyText.anchor.x = 1;
            this.frequencyText.x = 95;
            this.frequencyText.y = -33;

            this.displayObject.addChild(this.amplitudeText);
            this.displayObject.addChild(this.frequencyText);
        },

        initTitle: function() {

        },

        initGraph: function() {

        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            var targetWidth = this.mvt.modelToViewDeltaX(ACPowerSupplyView.MODEL_WIDTH);
            var scale = targetWidth / this.body.texture.width;
            this.displayObject.scale.x = scale;
            this.displayObject.scale.y = scale;

            this.updatePosition(this.model, this.model.get('position'));
            this.update();
        },

        updatePosition: function(model, position) {
            var viewPosition = this.mvt.modelToViewDelta(position);
            this.displayObject.x = viewPosition.x;
            this.displayObject.y = viewPosition.y;
        },

        /**
         * 
         */
        update: function() {
            
        },

        enabledChanged: function(battery, enabled) {
            this.displayObject.visible = enabled;
        },

        maxAmplitudeChanged: function(battery, maxAmplitude) {
            this.amplitudeText.text = Math.round(maxAmplitude * 100) + '%';
        },

        frequencyChanged: function(battery, frequency) {
            this.frequencyText.text = Math.round(frequency * 100) + '%';
        }

    }, Constants.ACPowerSupplyView);


    return ACPowerSupplyView;
});
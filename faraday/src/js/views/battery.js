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
    var BatteryView = PixiView.extend({

        /**
         * Initializes the new BatteryView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;

            this.initGraphics();

            this.listenTo(this.model, 'change:position',  this.updatePosition);
            this.listenTo(this.model, 'change:amplitude', this.amplitudeChanged);
            this.listenTo(this.model, 'change:enabled',   this.enabledChanged);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.battery = Assets.createSprite(Assets.Images.BATTERY);
            this.battery.anchor.x = 0.5;
            this.battery.anchor.y = 1;

            this.displayObject.addChild(this.battery);

            this.initControls();

            this.updateMVT(this.mvt);
        },

        initControls: function() {
            this.sliderContainer = new PIXI.Container();

            // Create the slider view
            this.sliderView = new SliderView({
                start: this.model.get('maxVoltage') * this.model.get('amplitude'),
                range: {
                    min: -this.model.get('maxVoltage'),
                    max:  this.model.get('maxVoltage')
                },

                width: 100,
                backgroundHeight: 4,
                backgroundColor: '#fff',
                backgroundAlpha: 1,
                backgroundLineColor: '#000',
                backgroundLineWidth: 1,
                backgroundLineAlpha: 0.3,

                handleSize: 10,
                handleColor: '#fff',
                handleAlpha: 1,
                handleLineColor: '#222',
                handleLineWidth: 1,
            });

            // Bind events
            this.listenTo(this.sliderView, 'slide', function(voltage, prev, event) {
                event.stopPropagation();
                this.model.set('amplitude', voltage / this.model.get('maxVoltage'));
            });

            this.sliderContainer.x = Math.floor(-this.sliderView.width / 2);

            var ticks = new PIXI.Graphics();
            var tickY = 5;
            var tickH = 8;
            ticks.lineStyle(2, 0xFFFFFF, 1);
            ticks.moveTo(1, tickY);
            ticks.lineTo(1, tickY + tickH);
            ticks.moveTo(Math.round(this.sliderView.width / 2), tickY);
            ticks.lineTo(Math.round(this.sliderView.width / 2), tickY + tickH);
            ticks.moveTo(this.sliderView.width - 1, tickY);
            ticks.lineTo(this.sliderView.width - 1, tickY + tickH);
            ticks.alpha = 0.5;

            var textSettings = {
                font: '16px Helvetica Neue',
                fill: '#fff',
                align: 'right'
            };

            var textY = 15;
            this.leftVoltageText  = new PIXI.Text('10 v', textSettings);
            this.rightVoltageText = new PIXI.Text('10 v', textSettings);
            this.leftVoltageText.anchor.x = this.rightVoltageText.anchor.x = 1;
            this.leftVoltageText.x = Math.floor(this.leftVoltageText.width / 2);
            this.rightVoltageText.x = this.sliderView.width + Math.floor(this.rightVoltageText.width / 2);
            this.leftVoltageText.y = this.rightVoltageText.y = textY;

            this.sliderContainer.addChild(ticks);
            this.sliderContainer.addChild(this.leftVoltageText);
            this.sliderContainer.addChild(this.rightVoltageText);
            this.sliderContainer.addChild(this.sliderView.displayObject);
            this.displayObject.addChild(this.sliderContainer);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            var targetWidth = this.mvt.modelToViewDeltaX(BatteryView.MODEL_WIDTH);
            var scale = targetWidth / this.battery.texture.width;
            this.batteryScale = scale;
            this.battery.scale.x = scale;
            this.battery.scale.y = scale;

            this.sliderContainer.y = -Math.floor(this.battery.height * 0.75);

            this.updatePosition(this.model, this.model.get('position'));
            this.amplitudeChanged(this.model, this.model.get('amplitude'));
        },

        updatePosition: function(model, position) {
            var viewPosition = this.mvt.modelToViewDelta(position);
            this.displayObject.x = viewPosition.x;
            this.displayObject.y = viewPosition.y;
        },

        enabledChanged: function(battery, enabled) {
            this.displayObject.visible = enabled;
        },

        amplitudeChanged: function(battery, amplitude) {
            var voltage = this.model.getVoltage();

            // Update the displayed value and battery orientation
            var text = Math.round(Math.abs(voltage)) + ' v';
            if (voltage < 0) {
                this.leftVoltageText.text = text;
                this.leftVoltageText.visible = true;
                this.rightVoltageText.visible = false;
                this.battery.scale.x = -this.batteryScale;
            }
            else {
                this.rightVoltageText.text = text;
                this.rightVoltageText.visible = true;
                this.leftVoltageText.visible = false;
                this.battery.scale.x = this.batteryScale;
            }
        }

    }, Constants.BatteryView);


    return BatteryView;
});
define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var Colors     = require('common/colors/colors');
    var Vector2    = require('common/math/vector2');
    var Vector3    = require('common/math/vector3');
    var AppView    = require('common/app/app');
    var SliderView = require('common/pixi/view/slider');

    var CapacitorShapeCreator = require('shape-creators/capacitor');

    var CapacitorView              = require('views/capacitor');
    var DielectricTotalChargeView  = require('views/charge/dielectric-total');
    var DielectricExcessChargeView = require('views/charge/dielectric-excess');

    var Constants = require('constants');
    var Polarity = Constants.Polarity;

    /**
     * 
     */
    var CapacitanceControlledCapacitorView = CapacitorView.extend({

        initialize: function(options) {
            options = _.extend({
                handleColor: '#5c35a3',
                handleHoverColor: '#955cff',

                labelFontFamily: 'Helvetica Neue',
                labelFontSize: 14,
                labelColor: '#000',
                labelAlpha: 1
            }, options);

            this.maxDielectricEField = options.maxDielectricEField;
            this.maxPlateCharge = options.maxPlateCharge;
            this.maxExcessDielectricPlateCharge = options.maxExcessDielectricPlateCharge;
            this.maxEffectiveEField = options.maxEffectiveEField;

            // Handle colors
            this.handleColor = Colors.parseHex(options.handleColor);
            this.handleHoverColor = Colors.parseHex(options.handleHoverColor);

            // Label text
            this.labelAlpha = options.labelAlpha;
            this.labelTitleStyle = {
                font: 'bold ' + options.labelFontSize + 'px ' + options.labelFontFamily,
                fill: options.labelColor
            };
            this.labelTitleHoverStyle = _.clone(this.labelTitleStyle);
            this.labelTitleHoverStyle.fill = options.handleHoverColor;

            this.labelValueStyle = {
                font: options.labelFontSize + 'px ' + options.labelFontFamily,
                fill: options.labelColor
            };
            this.labelValueHoverStyle = _.clone(this.labelValueStyle);
            this.labelValueHoverStyle.fill = options.handleHoverColor;

            this.labelValuePowerStyle = {
                font: Math.floor(options.labelFontSize * 0.75) + 'px ' + options.labelFontFamily,
                fill: options.labelColor
            };
            this.labelValuePowerHoverStyle = _.clone(this.labelValuePowerStyle);
            this.labelValuePowerHoverStyle.fill = options.handleHoverColor;

            // Cached objects

            CapacitorView.prototype.initialize.apply(this, [options]);
        },

        initGraphics: function() {
            CapacitorView.prototype.initGraphics.apply(this, arguments);

            this.initCapacitanceControlPanel();
        },

        initCapacitanceControlPanel: function() {
            var width  = Math.round(this.mvt.modelToViewDeltaX(AppView.windowIsShort() ? 0.004 : 0.003));
            var height = Math.round(this.mvt.modelToViewDeltaX(0.010));
            var xOffset = -this.mvt.modelToViewDeltaX(-0.010);
            var capacitorCenter = this.mvt.modelToView(this.model.get('position'));
            var x = Math.round(capacitorCenter.x - xOffset);
            var y = Math.round(capacitorCenter.y - height / 2);

            var panel = new PIXI.Graphics();
            panel.x = x;
            panel.y = y;
            panel.beginFill(0xE2F3FA, 1);
            panel.drawRect(0, 0, width, height);
            panel.endFill();
            this.displayObject.addChild(panel);

            var sliderHeight = Math.floor(height * (AppView.windowIsShort() ? 0.68 : 0.75));

            var sliderView = new SliderView({
                start: Constants.CAPACITANCE_RANGE.min,
                range: {
                    min: Constants.CAPACITANCE_RANGE.min,
                    max: Constants.CAPACITANCE_RANGE.max
                },
                orientation: 'vertical',
                direction: 'rtl',

                width: sliderHeight,
                backgroundHeight: AppView.windowIsShort() ? 3 : 4,
                backgroundColor: '#A2B8C8',
                backgroundAlpha: 1,
                handleSize: 11
            });

            // Position it
            sliderView.displayObject.x = Math.round(width / 2);
            sliderView.displayObject.y = Math.round(height / 2 - sliderHeight / 2);

            // Bind events for it
            this.listenTo(sliderView, 'slide', function(value, prev) {
                this.model.set('disconnectedPlateCharge', value);
            });

            // Save a reference
            this.capacitanceSlider = sliderView;

            // Create labels
            this.capacitanceTitle = new PIXI.Text('Capacitance', this.labelTitleStyle);
            this.capacitanceTitle.x = Math.round(width / 2 - this.capacitanceTitle.width / 2);
            this.capacitanceTitle.y = Math.round(height + 4);

            this.capacitanceSuffix = 'x10     F';
            this.capacitanceValue = new PIXI.Text('1.00' + this.capacitanceSuffix, this.labelValueStyle);
            this.capacitanceValue.x = Math.round(width / 2 - this.capacitanceValue.width / 2);
            this.capacitanceValue.y = Math.round(height + 24);
            //this.capacitanceValue.anchor.x = 0.5;

            this.capacitanceValuePower = new PIXI.Text(Constants.CAPACITANCE_CONTROL_EXPONENT, this.labelValuePowerStyle);
            this.capacitanceValuePower.x = Math.round(width / 2 + this.capacitanceValue.width * 0.15);
            this.capacitanceValuePower.y = Math.round(height + 20);

            panel.addChild(sliderView.displayObject);
            panel.addChild(this.capacitanceTitle);
            panel.addChild(this.capacitanceValue);
            panel.addChild(this.capacitanceValuePower);

            this.capacitancePanel = panel;
        },

        update: function() {
            CapacitorView.prototype.update.apply(this, arguments);


        },

    });

    return CapacitanceControlledCapacitorView;
});
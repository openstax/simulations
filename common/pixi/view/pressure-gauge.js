define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    require('../extensions');
    
    var PixiView = require('../view');

    var Colors         = require('../../colors/colors');
    var Vector2        = require('../../math/vector2');
    var PiecewiseCurve = require('../../math/piecewise-curve');
    var range          = require('../../math/range');

    /**
     * A view that represents a pressure gauge
     */
    var PressureGaugeView = PixiView.extend({

        initialize: function(options) {
            options = _.extend({
                units: 'ATM',
                min: 0,                          // Minimum value
                max: 1,                          // Maximum value
                decimals: 1,                     // Number of decimals to show

                minAngle: -30 * (Math.PI / 180), // Angle of the needle at 0% in radians
                maxAngle: 210 * (Math.PI / 180), // Angle of the needle at 100% in radians

                textColor: '#000',
                readoutFont: '10px Arial',
                unitsFont:   '7px Arial',

                allowOverload: true,
                overloadColor: '#ff0000',
                overloadFont: '8px Arial',
                overloadText: 'OVERLOAD',

                tickColor: '#888',
                tickLength: 6,                   // Pixels
                tickWidth:  1,                   // Pixels
                tickMargin: 7,                   // Margin between ticks and the outline in pixels
                numTicks:  20,

                needleColor: '#121212',
                needleWidth: 2,                  // Pixels

                radius: 40,                      // Pixels
                backgroundColor: '#fff',
                outlineColor: '#e2e2e2',
                outlineThickness: 3,             // Pixels

                // The connector is just a little protusion that visually connects it to something else
                showConnector: true,
                connectorAngle: -Math.PI / 2,    // Which direction it's coming out (bottom default)
                connectorLength: 8,              // Pixels
                connectorWidth: 10,              // Pixels
                connectorColor1: '#000',
                connectorColor2: '#e2e2e2'
            }, options);

            // Field assignments from options
            this.units = options.units;
            this.pressureRange = range({ min: options.min, max: options.max });
            this.angleRange = range({ min: options.minAngle, max: options.maxAngle });

            this.decimals = options.decimals;

            this.textColor = options.textColor;
            this.readoutFont = options.readoutFont;
            this.unitsFont = options.unitsFont;

            this.allowOverload = options.allowOverload;
            this.overloadColor = options.overloadColor;
            this.overloadFont = options.overloadFont;
            this.overloadText = options.overloadText;

            this.tickColor = Colors.parseHex(options.tickColor);
            this.tickLength = options.tickLength;
            this.tickWidth = options.tickWidth;
            this.tickMargin = options.tickMargin;
            this.numTicks = options.numTicks;

            this.needleColor = Colors.parseHex(options.needleColor);
            this.needleWidth = options.needleWidth;

            this.radius = options.radius;
            this.backgroundColor = Colors.parseHex(options.backgroundColor);
            this.outlineColor = Colors.parseHex(options.outlineColor);
            this.outlineThickness = options.outlineThickness;

            this.showConnector = options.showConnector;
            this.connectorAngle = options.connectorAngle;
            this.connectorLength = options.connectorLength;
            this.connectorWidth = options.connectorWidth;
            this.connectorColor1 = options.connectorColor1;
            this.connectorColor2 = options.connectorColor2;

            this.initGraphics();
        },

        initGraphics: function() {
            this.initBackground();
            this.initTicks();
            this.initNeedle();
            this.initReadout();

            this.updatePressureGauge();
        },

        initBackground: function() {
            if (!this.showConnector) {
                // If there's no connector, just make the (0, 0) be the center of the gauge
                this.gaugeCenter = new Vector2();
            }
            else {
                var offset = this.radius + this.connectorLength;
                this.gaugeCenter = new Vector2(
                    offset * -Math.cos(this.connectorAngle),
                    offset * -Math.sin(this.connectorAngle)
                );

                // Create the connector as a gradient-filled box going to the right
                var gradientTexture = PIXI.Texture.generateHorizontalGradientTexture(
                    offset, this.connectorWidth, this.connectorColor1, this.connectorColor2
                );
                var connector = new PIXI.Sprite(gradientTexture);

                // Then rotate it and move it into position
                connector.rotation = this.connectorAngle;
                connector.x = this.gaugeCenter.x;
                connector.y = this.gaugeCenter.y;

                this.displayObject.addChild(connector);
            }
                
            var background = new PIXI.Graphics();
            background.beginFill(this.backgroundColor, 1);
            background.lineStyle(this.outlineThickness, this.outlineColor, 1);
            background.drawCircle(this.gaugeCenter.x, this.gaugeCenter.y, this.radius);
            background.endFill();

            this.displayObject.addChild(connector);
        },

        initTicks: function() {
            var radius = this.radius;
            var edgeWidth = this.tickMargin;
            var tickLength = this.tickLength;

            var startVector = new Vector2(radius - edgeWidth, 0);
            var endVector   = new Vector2(radius - edgeWidth - tickLength, 0);
            var rotationStep = this.angleRange.length() / this.numTicks;

            var ticks = new PIXI.Graphics();
            ticks.x = this.gaugeCenter.x;
            ticks.y = this.gaugeCenter.y;
            ticks.lineStyle(this.tickWidth, this.tickColor, 1);

            startVector.rotate(PressureGaugeView.MAX_ANGLE);
            endVector.rotate(PressureGaugeView.MAX_ANGLE);

            for (var rotation = this.angleRange.max; rotation >= this.angleRange.min; rotation += rotationStep) {
                ticks.moveTo(startVector.x, -startVector.y);
                ticks.lineTo(endVector.x, -endVector.y);

                startVector.rotate(rotationStep);
                endVector.rotate(rotationStep);
            }

            this.displayObject.addChild(ticks);
        },

        initNeedle: function() {
            var lengthA = this.radius - this.tickMargin; // Length of pointing side
            var lengthB = lengthA * 0.25;                // Length of counter-weight side

            this.needle = new PIXI.Graphics();

            // Draw pointing side
            this.needle.lineStyle(this.needleWidth, this.needleColor, 1);
            this.needle.moveTo(lengthA, 0);
            this.needle.lineTo(0, 0);

            // Draw counter-weight side
            this.needle.beginFill(this.needleColor, 1);
            this.needle.moveTo(0, 0);
            this.needle.lineTo(-lengthB,  this.needleWidth * 2);
            this.needle.lineTo(-lengthB, -this.needleWidth * 2);
            this.needle.lineTo(0, 0);
            this.needle.endFill();

            // Draw a little dot for the pivot point
            this.needle.beginFill(this.needleColor, 1);
            this.needle.drawCircle(0, 0, this.needleWidth * 2);
            this.needle.endFill();

            // Position it in the center of the gauge
            this.needle.x = this.gaugeCenter.x;
            this.needle.y = this.gaugeCenter.y;

            this.displayObject.addChild(this.needle);
        },

        initReadout: function() {
            var yOffset = 15;
            var bgWidth = 28;
            var bgHeight = 12;

            var background = new PIXI.Graphics();
            background.beginFill(0xDDDDDD, 1);
            background.drawRect(this.gaugeCenter.x - bgWidth / 2, this.gaugeCenter.y + yOffset, bgWidth, bgHeight);
            background.endFill();
            //this.displayObject.addChild(background);

            this.readout = new PIXI.Text('100.0 ATM', {
                font: PressureGaugeView.READOUT_FONT
            });
            this.readout.x = this.gaugeCenter.x;
            this.readout.y = this.gaugeCenter.y + 8 + 2;
            this.readout.anchor.x = 0.5;
            this.displayObject.addChild(this.readout);

            this.units = new PIXI.Text('ATM', {
                font: PressureGaugeView.UNITS_FONT
            });
            this.units.x = this.readout.x;
            this.units.y = this.readout.y + 12;
            this.units.anchor.x = 0.5;
            this.displayObject.addChild(this.units);

            this.overload = new PIXI.Text('OVERLOAD', {
                font: PressureGaugeView.OVERLOAD_FONT,
                fill: '#ff0000'
            });
            this.overload.x = this.readout.x;
            this.overload.y = this.readout.y + 4;
            this.overload.anchor.x = 0.5;
            this.displayObject.addChild(this.overload);
        },

        setPosition: function(position) {
            this.displayObject.x = position.x;
            this.displayObject.y = position.y;
        },

        val: function(value) {
            if (value === undefined) {
                return this.value;
            }
            else {
                this.value = value;
                this.update();
            }
        },

        update: function() {
            var percent = this.pressureRange.percent(this.value);
            var angle = this.angleRange.lerp(1 - percent);
            this.needle.rotation = -angle;
            this.readout.setText(this.value.toFixed(this.decimals));

            if (percent > 1) {
                this.overload.visible = true;
                this.units.visible = false;
                this.readout.visible = false;
            }
            else {
                this.overload.visible = false;
                this.units.visible = true;
                this.readout.visible = true;
            }
        }

    });

    return PressureGaugeView;
});
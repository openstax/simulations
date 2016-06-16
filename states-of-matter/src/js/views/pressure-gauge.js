define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView = require('common/v3/pixi/view');
    var Vector2  = require('common/math/vector2');
    var range    = require('common/math/range');

    var Assets = require('assets');

    var Constants = require('constants');

    /**
     * A view that represents the particle tank
     */
    var PressureGaugeView = PixiView.extend({

        initialize: function(options) {
            this.simulation = options.simulation;
            this.pressureRange = range({ min: 0, max: PressureGaugeView.MAX_PRESSURE });
            this.angleRange = range({ min: PressureGaugeView.MIN_ANGLE, max: PressureGaugeView.MAX_ANGLE });

            this.initGraphics();

            this.listenTo(this.simulation, 'pressure-changed', this.updatePressureGauge);
        },

        initGraphics: function() {
            this.initSprite();
            this.initTicks();
            this.initNeedle();
            this.initReadout();

            this.updatePressureGauge();
        },

        initSprite: function() {
            var sprite = Assets.createSprite(Assets.Images.PRESSURE_GAUGE);
            sprite.anchor.x = 1;
            sprite.anchor.y = 1;
            sprite.x = 10;
            sprite.y = 8;

            this.displayObject.addChild(sprite);

            var radius = sprite.width / 2;
            this.gaugeCenter = new Vector2(
                -radius + sprite.x, 
                -sprite.height + radius + sprite.y
            );
        },

        initTicks: function() {
            var radius = this.displayObject.width / 2;
            var edgeWidth = 7;
            var tickLength = 6;

            var startVector = new Vector2(radius - edgeWidth, 0);
            var endVector   = new Vector2(radius - edgeWidth - tickLength, 0);

            var ticks = new PIXI.Graphics();
            ticks.x = this.gaugeCenter.x;
            ticks.y = this.gaugeCenter.y;
            ticks.lineStyle(1, 0x888888, 1);

            startVector.rotate(PressureGaugeView.MAX_ANGLE);
            endVector.rotate(PressureGaugeView.MAX_ANGLE);

            for (var rotation = PressureGaugeView.MAX_ANGLE; rotation >= PressureGaugeView.MIN_ANGLE; rotation += PressureGaugeView.STEP) {
                ticks.moveTo(startVector.x, -startVector.y);
                ticks.lineTo(endVector.x, -endVector.y);

                startVector.rotate(PressureGaugeView.STEP);
                endVector.rotate(PressureGaugeView.STEP);
            }

            this.displayObject.addChild(ticks);
        },

        initNeedle: function() {
            this.needle = Assets.createSprite(Assets.Images.PRESSURE_GAUGE_NEEDLE);
            this.needle.anchor.x = 0.225;
            this.needle.anchor.y = 0.5;
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
            this.readout.resolution = this.getResolution();
            this.readout.x = this.gaugeCenter.x;
            this.readout.y = this.gaugeCenter.y + 8 + 2;
            this.readout.anchor.x = 0.5;
            this.displayObject.addChild(this.readout);

            this.units = new PIXI.Text('ATM', {
                font: PressureGaugeView.UNITS_FONT
            });
            this.units.resolution = this.getResolution();
            this.units.x = this.readout.x;
            this.units.y = this.readout.y + 12;
            this.units.anchor.x = 0.5;
            this.displayObject.addChild(this.units);

            this.overload = new PIXI.Text('OVERLOAD', {
                font: PressureGaugeView.OVERLOAD_FONT,
                fill: '#ff0000'
            });
            this.overload.resolution = this.getResolution();
            this.overload.x = this.readout.x;
            this.overload.y = this.readout.y + 4;
            this.overload.anchor.x = 0.5;
            this.displayObject.addChild(this.overload);
        },

        connect: function(connectorPosition) {
            this.displayObject.x = connectorPosition.x;
            this.displayObject.y = connectorPosition.y;
        },

        updatePressureGauge: function() {
            var pressure = this.simulation.getPressureInAtmospheres();
            var pressurePercent = this.pressureRange.percent(pressure);
            var angle = this.angleRange.lerp(1 - pressurePercent);
            this.needle.rotation = -angle;
            this.readout.text = pressure.toFixed(2);

            if (pressurePercent > 1) {
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

    }, Constants.PressureGaugeView);

    return PressureGaugeView;
});
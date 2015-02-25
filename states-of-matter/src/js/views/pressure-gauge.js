define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView = require('common/pixi/view');
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

            this.updatePressureGauge();
        },

        initReadout: function() {
            // var background = new PIXI.Graphics();

            // this.readout = new PIXI.Text();
        },

        connect: function(connectorPosition) {
            this.displayObject.x = connectorPosition.x;
            this.displayObject.y = connectorPosition.y;
        },

        updatePressureGauge: function() {
            var pressurePercent = this.pressureRange.percent(this.simulation.getPressureInAtmospheres());
            var angle = this.angleRange.lerp(1 - pressurePercent);
            console.log(pressurePercent)
            this.needle.rotation = -angle;
        }

    }, Constants.PressureGaugeView);

    return PressureGaugeView;
});
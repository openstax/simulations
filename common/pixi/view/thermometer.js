define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    var PixiView = require('../view');

    var Colors    = require('../../colors/colors');
    var Vector2   = require('../../math/vector2');
    var Rectangle = require('../../math/rectangle');


    var ThermometerView = PixiView.extend({

        initialize: function(options) {
            options = _.extend({
                bulbDiameter: 24,
                tubeWidth:    12,
                tubeHeight:   64,

                numberOfTicks: 7,

                lineColor: '#999',
                lineWidth: 1,
                lineAlpha: 1,

                fillColor: '#fff',
                fillAlpha: 0.3,

                liquidColor: '#ff3c00'
            }, options);

            this.bulbDiameter = options.bulbDiameter;
            this.tubeWidth = options.tubeWidth;
            this.tubeHeight = options.tubeHeight;

            this.lineColor = Colors.parseHex(options.lineColor);
            this.lineWidth = options.lineWidth;
            this.lineAlpha = options.lineAlpha;

            this.fillColor = Colors.parseHex(options.fillColor);
            this.fillAlpha = options.fillAlpha;

            this.liquidColor = Colors.parseHex(options.liquidColor);

            this.value = 0;

            this.padding = 2;
            this.outlineFix = 0.5;

            this.initGraphics();
        },

        initGraphics: function() {
            this.initShape();
            this.initLiquid();
            this.initTicks();
        },

        initShape: function() {
            var background = new PIXI.Graphics();
            var outline    = new PIXI.Graphics();

            // Only want to deal in whole pixels so it looks crisp
            var radius = Math.floor(this.bulbDiameter / 2);
            var halfWidth = Math.floor(this.tubeWidth / 2);
            var width = halfWidth * 2;
            var height = Math.floor(this.tubeHeight);

            // Filling it is easy.
            background.beginFill(this.fillColor, 1);
            background.drawCircle(0, 0, radius);
            background.drawRect(-halfWidth, 0, width, -radius - height);
            background.drawCircle(0, -radius - height, halfWidth);
            background.endFill();

            // (Except that applying an alpha to the graphics is actually buggy,
            //   so I'll create a texture and set an alpha on a sprite.)
            var bgSprite = new PIXI.Sprite(background.generateTexture());
            bgSprite.anchor.x = 0.5;
            bgSprite.anchor.y = (bgSprite.height - radius) / bgSprite.height;
            bgSprite.alpha = this.fillAlpha;

            // It's drawing the outline that's tricky.
            var theta = Math.acos(halfWidth / radius);
            var tubeBulbIntersectionY = -Math.sqrt(Math.pow(radius, 2) - Math.pow(halfWidth, 2));

            outline.lineStyle(this.lineWidth, this.lineColor, this.lineAlpha);
            outline.moveTo(-halfWidth, tubeBulbIntersectionY);
            outline.lineTo(-halfWidth, -radius - height);
            outline.arc(0, -radius - height, halfWidth, Math.PI, 0);
            outline.lineTo(halfWidth, tubeBulbIntersectionY);
            outline.arc(0, 0, radius, -theta, Math.PI + theta);

            this.displayObject.addChild(bgSprite);
            this.displayObject.addChild(outline);
        },

        initLiquid: function() {
            var padding = this.padding;
            var outlineFix = this.outlineFix;
            var radius = Math.floor(this.bulbDiameter / 2) - padding;
            var halfWidth = Math.floor(this.tubeWidth / 2) - padding;
            var width = halfWidth * 2;
            var height = Math.floor(this.tubeHeight) - padding;

            var bulbLiquid = new PIXI.Graphics();
            bulbLiquid.beginFill(this.liquidColor, 1);
            bulbLiquid.drawCircle(outlineFix, outlineFix, radius);
            bulbLiquid.endFill();

            var tubeLiquid = new PIXI.Graphics();
            var tubeLiquidMask = new PIXI.Graphics();

            var x = -halfWidth + outlineFix;
            var y = -radius - height + outlineFix - padding * 2;
            tubeLiquidMask.beginFill(0x000000, 1);
            tubeLiquidMask.drawRect(x, y, width, -y);
            tubeLiquidMask.drawCircle(outlineFix, y, halfWidth);
            tubeLiquidMask.endFill();
            tubeLiquid.mask = tubeLiquidMask;

            this.displayObject.addChild(bulbLiquid);
            this.displayObject.addChild(tubeLiquid);
            this.displayObject.addChild(tubeLiquidMask);

            this.tubeLiquid = tubeLiquid;

            this.drawTubeLiquid();
        },

        initTicks: function() {
            var ticks = new PIXI.Graphics();



            this.displayObject.addChild(ticks);
        },

        drawTubeLiquid: function() {
            var height = this.tubeHeight * this.value;
            if (height > this.tubeHeight * 2)
                height = this.tubeHeight * 2;
            if (height < 0)
                height = 0;

            var padding = this.padding;
            var outlineFix = this.outlineFix;
            var radius = Math.floor(this.bulbDiameter / 2);
            var halfWidth = Math.floor(this.tubeWidth / 2) - padding;
            var width = halfWidth * 2;

            var x = -halfWidth + outlineFix;
            var y = -radius - height + outlineFix + padding;

            this.tubeLiquid.clear();
            this.tubeLiquid.beginFill(this.liquidColor, 1);
            this.tubeLiquid.drawRect(x, y, width, -y);
            this.tubeLiquid.endFill();
        },

        setValue: function(value) {
            this.value = value;
            this.drawTubeLiquid();
        },

        getValue: function() {
            return this.value;
        },

        val: function(value) {
            if (value === undefined)
                return this.getValue();
            else
                this.setValue(value);
        }

    });

    return ThermometerView;
});

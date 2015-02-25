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

                lineColor: '#000',
                lineWidth: 1,
                lineAlpha: 0.5,

                fillColor: '#fff',
                fillAlpha: 0.5
            }, options);

            this.bulbDiameter = options.bulbDiameter;
            this.tubeWidth = options.tubeWidth;
            this.tubeHeight = options.tubeHeight;

            this.lineColor = Colors.parseHex(options.lineColor);
            this.lineWidth = options.lineWidth;
            this.lineAlpha = options.lineAlpha;

            this.fillColor = Colors.parseHex(options.fillColor);
            this.fillAlpha = options.fillAlpha;

            this.initGraphics();
        },

        initGraphics: function() {
            this.initShape();
            this.initFill();
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

        initFill: function() {
            var bulbFill = new PIXI.Graphics();


            var tubeFill = new PIXI.Graphics();
            var tubeFillMask = new PIXI.Graphics();

            this.displayObject.addChild(bulbFill);
            this.displayObject.addChild(tubeFill);
            this.displayObject.addChild(tubeFillMask);

            this.tubeFill = tubeFill;
        },

        initTicks: function() {
            var ticks = new PIXI.Graphics();



            this.displayObject.addChild(ticks);
        }

    });

    return ThermometerView;
});

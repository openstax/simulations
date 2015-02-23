define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    require('common/pixi/extensions');
    
    var PixiView       = require('common/pixi/view');
    var Vector2        = require('common/math/vector2');
    var PiecewiseCurve = require('common/math/piecewise-curve');
    var Colors         = require('common/colors/colors');

    var Assets = require('assets');

    /**
     * A view that represents the particle tank
     */
    var HoseView = PixiView.extend({

        initialize: function(options) {
            options = _.extend({
                color: '#3b3b3b'
            }, options);

            this.color = Colors.parseHex(options.color);
            this.loopHeight = 100;

            this.initGraphics();
        },

        initGraphics: function() {
            // Hose graphics
            this.hose = new PIXI.Graphics();
            this.displayObject.addChild(this.hose);

            // Connector sprites
            this.connector1 = Assets.createSprite(Assets.Images.HOSE_CONNECTOR);
            this.connector2 = Assets.createSprite(Assets.Images.HOSE_CONNECTOR);

            this.connector1.anchor.y = 0.5;
            this.connector2.anchor.y = 0.5;

            this.connector2.scale.x = -1;

            this.displayObject.addChild(this.connector1);
            this.displayObject.addChild(this.connector2);
        },

        drawHose: function() {
            var curve = new PiecewiseCurve();

            var start = new Vector2(this.connector1.x, this.connector1.y);
            var end   = new Vector2(this.connector2.x, this.connector2.y);

            var delta = end.clone().sub(start);
            var dx = delta.x;
            var dy = delta.y;
            var height = this.loopHeight;

            var A  = new Vector2(start).add(this.connector1.width, 0);
            var A2 = new Vector2(start).add(dx * 0.33, dy * 0.33);

            var B1 = new Vector2(start).add(dx * 0.58, dy * 0.67 + height * 0.12);
            var B  = new Vector2(start).add(dx * 0.67, dy * 0.67 + height * 0.33);
            var B2 = new Vector2(start).add(dx * 0.77, dy * 0.67 + height * 0.63);

            var C1 = new Vector2(start).add(dx * 0.67, dy * 0.5 + height);
            var C  = new Vector2(start).add(dx * 0.50, dy * 0.5 + height);
            var C2 = new Vector2(start).add(dx * 0.33, dy * 0.5 + height);

            var D1 = new Vector2(start).add(dx * 0.23, dy * 0.33 + height * 0.63);
            var D  = new Vector2(start).add(dx * 0.33, dy * 0.33 + height * 0.33);
            var D2 = new Vector2(start).add(dx * 0.42, dy * 0.33 + height * 0.12);

            var E1 = new Vector2(start).add(dx * 0.67, dy * 0.67);
            var E  = new Vector2(end).sub(Math.abs(this.connector2.width), 0);

            curve
                .moveTo(start)
                .lineTo(A)
                .curveTo(A2, B1, B)
                .curveTo(B2, C1, C)
                .curveTo(C2, D1, D)
                .curveTo(D2, E1, E)
                .lineTo(end);

            this.hose.clear();
            this.hose.lineStyle(13, this.color, 1);
            this.hose.drawPiecewiseCurve(curve);
        },

        connect1: function(connectorPosition) {
            this.connector1.x = connectorPosition.x;
            this.connector1.y = connectorPosition.y;
            this.drawHose();
        },

        connect2: function(connectorPosition) {
            this.connector2.x = connectorPosition.x;
            this.connector2.y = connectorPosition.y;
            this.drawHose();
        }

    });

    return HoseView;
});
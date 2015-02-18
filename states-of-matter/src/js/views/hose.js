define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView       = require('common/pixi/view');
    var Vector2        = require('common/math/vector2');
    var PiecewiseCurve = require('common/math/piecewise-curve');
    var Colors         = require('common/colors/colors');

    var Assets = require('assets');

    var Constants = require('constants');

    /**
     * A view that represents the particle tank
     */
    var HoseView = PixiView.extend({

        initialize: function(options) {
            options = _.extend({
                color: '#3b3b3b'
            }, options);

            this.color = Colors.parseHex(options.color);

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
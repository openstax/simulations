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

            this.initGraphics();

            
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
        },

        initTicks: function() {

        },

        initNeedle: function() {

        },

        initReadout: function() {

        },

        connect: function(connectorPosition) {
            this.displayObject.x = connectorPosition.x;
            this.displayObject.y = connectorPosition.y;
        }

    });

    return PressureGaugeView;
});
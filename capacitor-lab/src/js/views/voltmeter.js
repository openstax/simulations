define(function(require) {

    'use strict';

    var Backbone = require('backbone');
    var PIXI     = require('pixi');
    require('common/pixi/extensions');

    var PixiView = require('common/pixi/view');

    var Constants = require('constants');

    var Assets = require('assets');

    var VoltmeterView = PixiView.extend({

        events: {
            'touchstart      .voltmeterContainer': 'dragStart',
            'mousedown       .voltmeterContainer': 'dragStart',
            'touchmove       .voltmeterContainer': 'drag',
            'mousemove       .voltmeterContainer': 'drag',
            'touchend        .voltmeterContainer': 'dragEnd',
            'mouseup         .voltmeterContainer': 'dragEnd',
            'touchendoutside .voltmeterContainer': 'dragEnd',
            'mouseupoutside  .voltmeterContainer': 'dragEnd',

            'touchstart      .redProbe': 'dragRedProbeStart',
            'mousedown       .redProbe': 'dragRedProbeStart',
            'touchmove       .redProbe': 'dragRedProbe',
            'mousemove       .redProbe': 'dragRedProbe',
            'touchend        .redProbe': 'dragRedProbeEnd',
            'mouseup         .redProbe': 'dragRedProbeEnd',
            'touchendoutside .redProbe': 'dragRedProbeEnd',
            'mouseupoutside  .redProbe': 'dragRedProbeEnd',

            'touchstart      .blackProbe': 'dragBlackProbeStart',
            'mousedown       .blackProbe': 'dragBlackProbeStart',
            'touchmove       .blackProbe': 'dragBlackProbe',
            'mousemove       .blackProbe': 'dragBlackProbe',
            'touchend        .blackProbe': 'dragBlackProbeEnd',
            'mouseup         .blackProbe': 'dragBlackProbeEnd',
            'touchendoutside .blackProbe': 'dragBlackProbeEnd',
            'mouseupoutside  .blackProbe': 'dragBlackProbeEnd'
        },

        initialize: function(options) {
            options = _.extend({

            }, options);

            this.mvt = options.mvt;
            this.lastPosition = new PIXI.Point();

            this.initGraphics();
            this.updateMVT(this.mvt);
        },

        initGraphics: function() {
            this.initVoltmeterBrick();
            this.initVoltageLabel();
            this.initProbes();
        },

        initVoltmeterBrick: function() {
            this.voltmeterSprite = Assets.createSprite(Assets.Images.VOLTMETER);

            this.voltmeterContainer = new PIXI.DisplayObjectContainer();
            this.voltmeterContainer.buttonMode = true;
            this.voltmeterContainer.addChild(this.voltmeterSprite);

            this.voltmeterContainer.x = 590;
            this.voltmeterContainer.y = 370;

            this.displayObject.addChild(this.voltmeterContainer);
        },

        initVoltageLabel: function() {
            var textStyle = {
                font: '13px Helvetica Neue',
                fill: '#000'
            };

            var voltage = new PIXI.Text('-- V', textStyle);
            voltage.anchor.x = 1;
            voltage.anchor.y = 0.37;
            voltage.x = this.voltmeterSprite.width - (0.18 * this.voltmeterSprite.width);
            voltage.y = 0.193 * this.voltmeterSprite.height;

            this.voltmeterContainer.addChild(voltage);
            this.voltageLabel = voltage;
        },

        initProbes: function() {
            this.redWire = new PIXI.Graphics();
            this.blackWire = new PIXI.Graphics();

            this.redProbe   = Assets.createSprite(Assets.Images.PROBE_RED);
            this.blackProbe = Assets.createSprite(Assets.Images.PROBE_BLACK);

            this.redProbe.anchor.x   = 0.5;
            this.blackProbe.anchor.x = 0.5;

            this.redProbe.rotation   = Math.PI / 4;
            this.blackProbe.rotation = Math.PI / 4;

            this.redProbe.x   = this.voltmeterContainer.x - 100;
            this.blackProbe.x = this.voltmeterContainer.x -  60;

            this.redProbe.y = this.blackProbe.y = this.voltmeterContainer.y;

            this.displayObject.addChild(this.redWire);
            this.displayObject.addChild(this.blackWire);
            this.displayObject.addChild(this.redProbe);
            this.displayObject.addChild(this.blackProbe);
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            var targetSpriteHeight = this.mvt.modelToViewDeltaY(VoltmeterView.HEIGHT); // in pixels
            var scale = targetSpriteHeight / this.voltmeterSprite.texture.height;

            this.voltmeterContainer.scale.x = scale;
            this.voltmeterContainer.scale.y = scale;

            var targetProbeHeight = this.mvt.modelToViewDeltaY(VoltmeterView.PROBE_HEIGHT); // in pixels
            var scale = targetProbeHeight / this.redProbe.texture.height;
            
            this.redProbe.scale.x = this.blackProbe.scale.x = scale;
            this.redProbe.scale.y = this.blackProbe.scale.y = scale;
        },

        dragStart: function(data) {
            this.lastPosition.x = data.global.x;
            this.lastPosition.y = data.global.y;

            this.dragging = true;
        },

        drag: function(data) {
            if (this.dragging) {
                var dx = data.global.x - this.lastPosition.x;
                var dy = data.global.y - this.lastPosition.y;

                this.voltmeterContainer.x += dx;
                this.voltmeterContainer.y += dy;

                this.lastPosition.x = data.global.x;
                this.lastPosition.y = data.global.y;
            }
        },

        dragEnd: function(data) {
            this.dragging = false;
        },

        dragRedProbeStart: function(data) {
            this.lastPosition.x = data.global.x;
            this.lastPosition.y = data.global.y;

            this.draggingRedProbe = true;
        },

        dragRedProbe: function(data) {
            if (this.draggingRedProbe) {
                var dx = data.global.x - this.lastPosition.x;
                var dy = data.global.y - this.lastPosition.y;

                this.redProbe.x += dx;
                this.redProbe.y += dy;

                this.lastPosition.x = data.global.x;
                this.lastPosition.y = data.global.y;
            }
        },

        dragRedProbeEnd: function(data) {
            this.draggingRedProbe = false;
        },

        dragBlackProbeStart: function(data) {
            this.lastPosition.x = data.global.x;
            this.lastPosition.y = data.global.y;

            this.draggingBlackProbe = true;
        },

        dragBlackProbe: function(data) {
            if (this.draggingBlackProbe) {
                var dx = data.global.x - this.lastPosition.x;
                var dy = data.global.y - this.lastPosition.y;

                this.blackProbe.x += dx;
                this.blackProbe.y += dy;

                this.lastPosition.x = data.global.x;
                this.lastPosition.y = data.global.y;
            }
        },

        dragBlackProbeEnd: function(data) {
            this.draggingBlackProbe = false;
        },

        show: function() {
            this.displayObject.visible = true;
        },

        hide: function() {
            this.displayObject.visible = false;
        },

        setPosition: function(x, y) {
            this.voltmeterContainer.x = x;
            this.voltmeterContainer.y = y;
        },

        setRedProbePosition: function(x, y) {

        },

        setBlackProbePosition: function(x, y) {

        }

    }, Constants.VoltmeterView);

    return VoltmeterView;
});

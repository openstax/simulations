define(function(require) {

    'use strict';

    var Backbone = require('backbone');
    var SAT      = require('sat');
    var PIXI     = require('pixi');
    require('common/pixi/extensions');

    var PixiView = require('common/pixi/view');
    var Colors   = require('common/colors/colors');

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
            this.mvt = options.mvt;
            this.scene = options.scene;

            this.redColor   = Colors.parseHex(VoltmeterView.RED_COLOR);
            this.blackColor = Colors.parseHex(VoltmeterView.BLACK_COLOR);

            this.lastPosition = new PIXI.Point();

            this.initGraphics();
            this.updateMVT(this.mvt);
        },

        initGraphics: function() {
            this.initProbes();
            this.initVoltmeterBrick();
            this.initVoltageLabel();

            this.redProbe.x   = this.voltmeterContainer.x - 100;
            this.blackProbe.x = this.voltmeterContainer.x -  60;
            this.redProbe.y = this.blackProbe.y = this.voltmeterContainer.y;

            this.graphics = new PIXI.Graphics();
            this.displayObject.addChild(this.graphics);
        },

        initVoltmeterBrick: function() {
            this.voltmeterSprite = Assets.createSprite(Assets.Images.VOLTMETER);

            this.voltmeterContainer = new PIXI.DisplayObjectContainer();
            this.voltmeterContainer.buttonMode = true;
            this.voltmeterContainer.defaultCursor = 'move';
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

            this.redProbe.buttonMode   = true;
            this.blackProbe.buttonMode = true;
            this.redProbe.defaultCursor   = 'move';
            this.blackProbe.defaultCursor = 'move';

            this.displayObject.addChild(this.redWire);
            this.displayObject.addChild(this.blackWire);
            this.displayObject.addChild(this.redProbe);
            this.displayObject.addChild(this.blackProbe);

            this.redProbePolygon   = new SAT.Polygon(new SAT.Vector(), [ new SAT.Vector(), new SAT.Vector(), new SAT.Vector(), new SAT.Vector() ]);
            this.blackProbePolygon = new SAT.Polygon(new SAT.Vector(), [ new SAT.Vector(), new SAT.Vector(), new SAT.Vector(), new SAT.Vector() ]);
        },

        drawWires: function() {
            this.drawWire(this.redWire,   this.redColor,   this.redProbe,  -this.voltmeterContainer.width / 5);
            this.drawWire(this.blackWire, this.blackColor, this.blackProbe, this.voltmeterContainer.width / 5);
        },

        drawWire: function(graphics, color, probe, connectionXOffset) {
            var x0 = probe.x - Math.cos(probe.rotation) * probe.height;
            var y0 = probe.y + Math.sin(probe.rotation) * probe.height;

            var x1 = this.voltmeterContainer.x + this.voltmeterContainer.width / 2 + connectionXOffset;
            var y1 = this.voltmeterContainer.y + this.voltmeterContainer.height * (190 / 202);

            //var dist = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));

            var c1x = x0 - Math.cos(probe.rotation) * probe.height * 0.5;
            var c1y = y0 + Math.sin(probe.rotation) * probe.height * 0.5;

            var c2x = x1;
            var c2y = y1 + probe.height * 0.5;

            graphics.clear();
            graphics.lineStyle(2, color, 1);
            graphics.moveTo(x0, y0);
            graphics.bezierCurveTo(c1x, c1y, c2x, c2y, x1, y1);

            graphics.lineStyle(8, color, 1);
            graphics.moveTo(x1, y1);
            graphics.lineTo(x1, y1 + this.voltmeterContainer.height * 0.02);
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

            this.drawWires();
        },

        updateVoltage: function() {
            this.updateProbePolygon(this.redProbe,   this.redProbePolygon);
            this.updateProbePolygon(this.blackProbe, this.blackProbePolygon);

            var viewTouchingRed   = this.scene.getIntersectingComponentView(this.redProbePolygon);
            var viewTouchingBlack = this.scene.getIntersectingComponentView(this.blackProbePolygon);

            this.graphics.clear();
            this.graphics.beginFill(0x3300FF, 1);
            this.graphics.moveTo(this.redProbePolygon.points[0].x, this.redProbePolygon.points[0].y);
            this.graphics.lineTo(this.redProbePolygon.points[1].x, this.redProbePolygon.points[1].y);
            this.graphics.lineTo(this.redProbePolygon.points[2].x, this.redProbePolygon.points[2].y);
            this.graphics.lineTo(this.redProbePolygon.points[3].x, this.redProbePolygon.points[3].y);
            this.graphics.endFill();
        },

        updateProbePolygon: function(probe, polygon) {
            var thickness = probe.width * (7 / 29);
            var length = probe.height * (23 / 202);

            var xOffset = Math.cos(probe.rotation) * thickness / 2;
            var yOffset = Math.sin(probe.rotation) * thickness / 2;

            var x0 = probe.x;
            var y0 = probe.y;
            var x1 = x0 - Math.cos(probe.rotation) * length;
            var y1 = y0 + Math.sin(probe.rotation) * length;

            polygon.points[0].x = x0 - xOffset;
            polygon.points[0].y = y0 - yOffset;
            polygon.points[1].x = x0 + xOffset;
            polygon.points[1].y = y0 + yOffset;
            polygon.points[2].x = x1 + xOffset;
            polygon.points[2].y = y1 + yOffset;
            polygon.points[3].x = x1 - xOffset;
            polygon.points[3].y = y1 - yOffset;

            polygon.setPoints(polygon.points);
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

                this.drawWires();
                this.updateVoltage();

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

                this.drawWires();
                this.updateVoltage();

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

                this.drawWires();
                this.updateVoltage();

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
            this.drawWires();
        },

        setRedProbePosition: function(x, y) {
            this.redProbe.x = x;
            this.redProbe.y = y;
            this.drawWires();
        },

        setBlackProbePosition: function(x, y) {
            this.blackProbe.x = x;
            this.blackProbe.y = y;
            this.drawWires();
        }

    }, Constants.VoltmeterView);

    return VoltmeterView;
});

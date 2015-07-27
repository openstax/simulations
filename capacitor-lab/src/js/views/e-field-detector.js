define(function(require) {

    'use strict';

    var Backbone = require('backbone');
    var SAT      = require('sat');
    var PIXI     = require('pixi');
    require('common/pixi/extensions');

    var PixiView = require('common/pixi/view');
    var Colors   = require('common/colors/colors');

    var CapacitorView = require('views/capacitor');
    var WireView      = require('views/wire');
    var BatteryView   = require('views/battery');

    var Constants = require('constants');

    var Assets = require('assets');

    var EFieldDetectorView = PixiView.extend({

        events: {
            'touchstart      .detectorContainer': 'dragStart',
            'mousedown       .detectorContainer': 'dragStart',
            'touchmove       .detectorContainer': 'drag',
            'mousemove       .detectorContainer': 'drag',
            'touchend        .detectorContainer': 'dragEnd',
            'mouseup         .detectorContainer': 'dragEnd',
            'touchendoutside .detectorContainer': 'dragEnd',
            'mouseupoutside  .detectorContainer': 'dragEnd',

            'touchstart      .probe': 'dragProbeStart',
            'mousedown       .probe': 'dragProbeStart',
            'touchmove       .probe': 'dragProbe',
            'mousemove       .probe': 'dragProbe',
            'touchend        .probe': 'dragProbeEnd',
            'mouseup         .probe': 'dragProbeEnd',
            'touchendoutside .probe': 'dragProbeEnd',
            'mouseupoutside  .probe': 'dragProbeEnd'
        },

        initialize: function(options) {
            this.mvt = options.mvt;
            this.scene = options.scene;

            this.wireColor = Colors.parseHex(EFieldDetectorView.WIRE_COLOR);

            this.lastPosition = new PIXI.Point();

            this.initGraphics();
            this.updateMVT(this.mvt);
        },

        initGraphics: function() {
            this.initProbes();
            this.initBody();

            this.probe.x = this.detectorContainer.x - 100;
            this.probe.y = this.detectorContainer.y;
        },

        initBody: function() {
            this.bodySprite = Assets.createSprite(Assets.Images.EFD_DEVICE_BODY);

            this.detectorContainer = new PIXI.DisplayObjectContainer();
            this.detectorContainer.buttonMode = true;
            this.detectorContainer.defaultCursor = 'move';
            this.detectorContainer.addChild(this.bodySprite);

            this.detectorContainer.x = 590;
            this.detectorContainer.y = 370;

            this.displayObject.addChild(this.detectorContainer);

            this.body = new PIXI.DisplayObjectContainer();
            this.body.x = 13;
            this.body.y = 13;
            this.bodyHeight = this.bodySprite.texture.height - 26;
            this.bodyWidth  = this.bodySprite.texture.width  - 26;

            this.detectorContainer.addChild(this.body);
        },

        initProbes: function() {
            this.wire = new PIXI.Graphics();

            this.probe = Assets.createSprite(Assets.Images.PROBE_FIELD);
            this.probe.anchor.x = 0.5;
            this.probe.rotation = Math.PI / 4;
            this.probe.buttonMode = true;
            this.probe.defaultCursor = 'move';

            this.displayObject.addChild(this.wire);
            this.displayObject.addChild(this.probe);
        },

        drawWires: function() {
            this.drawWire(this.wire, this.wireColor, this.probe);
        },

        drawWire: function(graphics, color, probe) {
            var x0 = probe.x - Math.cos(probe.rotation) * probe.height;
            var y0 = probe.y + Math.sin(probe.rotation) * probe.height;

            var x1 = this.detectorContainer.x + this.detectorContainer.width / 2;
            var y1 = this.detectorContainer.y + this.detectorContainer.height * (282 / 295);

            var c1x = x0 - Math.cos(probe.rotation) * probe.height * 0.5;
            var c1y = y0 + Math.sin(probe.rotation) * probe.height * 0.5;

            var c2x = x1;
            var c2y = y1 + probe.height * 0.5;

            graphics.clear();
            graphics.lineStyle(2, color, 1);
            graphics.moveTo(x0, y0);
            graphics.bezierCurveTo(c1x, c1y, c2x, c2y, x1, y1);

            graphics.lineStyle(16, color, 1);
            graphics.moveTo(x1, y1 - 2);
            graphics.lineTo(x1, y1 + 7);
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            var targetSpriteHeight = this.mvt.modelToViewDeltaY(EFieldDetectorView.HEIGHT); // in pixels
            var scale = targetSpriteHeight / this.bodySprite.texture.height;

            this.detectorContainer.scale.x = scale;
            this.detectorContainer.scale.y = scale;

            var targetProbeHeight = this.mvt.modelToViewDeltaY(EFieldDetectorView.PROBE_HEIGHT); // in pixels
            var scale = targetProbeHeight / this.probe.texture.height;
            
            this.probe.scale.x = scale;
            this.probe.scale.y = scale;

            this.drawWires();
        },

        updateReadout: function() {
 
        },

        update: function(time, deltaTime) {
            if (this.displayObject.visible)
                this.updateReadout();
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

                this.detectorContainer.x += dx;
                this.detectorContainer.y += dy;

                this.drawWires();

                this.lastPosition.x = data.global.x;
                this.lastPosition.y = data.global.y;
            }
        },

        dragEnd: function(data) {
            this.dragging = false;
        },

        dragProbeStart: function(data) {
            this.lastPosition.x = data.global.x;
            this.lastPosition.y = data.global.y;

            this.draggingProbe = true;
        },

        dragProbe: function(data) {
            if (this.draggingProbe) {
                var dx = data.global.x - this.lastPosition.x;
                var dy = data.global.y - this.lastPosition.y;

                this.probe.x += dx;
                this.probe.y += dy;

                this.drawWires();

                this.lastPosition.x = data.global.x;
                this.lastPosition.y = data.global.y;
            }
        },

        dragProbeEnd: function(data) {
            this.draggingProbe = false;
        },

        show: function() {
            this.displayObject.visible = true;
        },

        hide: function() {
            this.displayObject.visible = false;
        },

        setPosition: function(x, y) {
            this.detectorContainer.x = x;
            this.detectorContainer.y = y;
            this.drawWires();
        },

        setProbePosition: function(x, y) {
            this.probe.x = x;
            this.probe.y = y;
            this.drawWires();
        }

    }, Constants.EFieldDetectorView);

    return EFieldDetectorView;
});

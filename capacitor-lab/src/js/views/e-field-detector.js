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
            'mouseupoutside  .probe': 'dragProbeEnd',

            'click .zoomInBtn'  : 'zoomIn',
            'click .zoomOutBtn' : 'zoomOut'
        },

        initialize: function(options) {
            this.mvt = options.mvt;
            this.scene = options.scene;
            this.dielectric = options.dielectric;

            this.plateEnabled = true;
            this.sumEnabled = true;
            this.dielectricEnabled = true;

            this.displayWidth  = 62
            this.displayHeight = 136;

            this.color = Colors.parseHex(EFieldDetectorView.DISPLAY_COLOR);
            this.wireColor = Colors.parseHex(EFieldDetectorView.WIRE_COLOR);

            this.lastPosition = new PIXI.Point();

            this.initGraphics();
            this.updateMVT(this.mvt);
        },

        initGraphics: function() {
            this.initProbes();
            this.initBody();
            this.initZoomControls();
            this.initShowValuesBtn();
            this.initDisplayAreas();

            this.probe.x = this.detectorContainer.x - 100;
            this.probe.y = this.detectorContainer.y;
        },

        initBody: function() {
            if (this.dielectric)
                this.bodySprite = Assets.createSprite(Assets.Images.EFD_DEVICE_BODY);
            else
                this.bodySprite = Assets.createSprite(Assets.Images.EFD_DEVICE_BODY_NARROW);

            this.detectorContainer = new PIXI.DisplayObjectContainer();
            this.detectorContainer.buttonMode = true;
            this.detectorContainer.defaultCursor = 'move';
            this.detectorContainer.addChild(this.bodySprite);

            this.detectorContainer.x = 500;
            this.detectorContainer.y = 300;

            this.displayObject.addChild(this.detectorContainer);

            this.body = new PIXI.DisplayObjectContainer();
            this.body.x = 13;
            this.body.y = 13;
            this.bodyHeight = this.bodySprite.texture.height - 24;
            this.bodyWidth  = this.bodySprite.texture.width  - 24;

            this.detectorContainer.addChild(this.body);
        },

        initDisplayAreas: function() {
            var self = this;
            var plateArea;
            var y = 32;
            var btnX = -2;
            var displayX = 3;
            var displayY = 34;

            if (this.dielectric) {
                var leftArea  = Assets.createSprite(Assets.Images.EFD_DISPLAY_AREA);
                var rightArea = Assets.createSprite(Assets.Images.EFD_DISPLAY_AREA);

                var middleMargin = 6;
                var sideMargin = Math.floor(this.bodyWidth - leftArea.width - rightArea.width - middleMargin) / 2;

                leftArea.x = sideMargin;
                leftArea.y = y;
                rightArea.x = this.bodyWidth - sideMargin - rightArea.width;
                rightArea.y = y;

                var sumBtn = this.createToggleButton(
                    Assets.Images.EFD_CHECK_BTN_ON, 
                    Assets.Images.EFD_CHECK_BTN_OFF, 
                    function() {
                        self.sumEnabled = true;
                        self.updateArrows();
                    },
                    function() {
                        self.sumEnabled = false;
                        self.updateArrows();
                    }
                );
                sumBtn.x = btnX;
                sumBtn.y = -1;

                var dielectricBtn = this.createToggleButton(
                    Assets.Images.EFD_CHECK_BTN_ON, 
                    Assets.Images.EFD_CHECK_BTN_OFF, 
                    function() {
                        self.dielectricEnabled = true;
                        self.updateArrows();
                    },
                    function() {
                        self.dielectricEnabled = false;
                        self.updateArrows();
                    }
                );
                dielectricBtn.x = btnX;
                dielectricBtn.y = 14;

                this.dielectricDisplay = new PIXI.DisplayObjectContainer();
                this.dielectricDisplay.x = displayX;
                this.dielectricDisplay.y = displayY;

                rightArea.addChild(sumBtn);
                rightArea.addChild(dielectricBtn);
                rightArea.addChild(this.dielectricDisplay);

                this.body.addChild(leftArea);
                this.body.addChild(rightArea);

                plateArea = leftArea;
            }
            else {
                var area = Assets.createSprite(Assets.Images.EFD_DISPLAY_AREA);
                var margin = Math.floor(this.bodyWidth - area.width) / 2;

                area.x = margin;
                area.y = y;

                this.body.addChild(area);

                plateArea = area;
            }

            var plateBtn = this.createToggleButton(
                Assets.Images.EFD_CHECK_BTN_ON, 
                Assets.Images.EFD_CHECK_BTN_OFF, 
                function() {
                    self.plateEnabled = true;
                    self.updateArrows();
                },
                function() {
                    self.plateEnabled = false;
                    self.updateArrows();
                }
            );
            plateBtn.x = btnX;
            plateBtn.y = 6;

            this.plateDisplay = new PIXI.DisplayObjectContainer();
            this.plateDisplay.x = displayX;
            this.plateDisplay.y = displayY;

            plateArea.addChild(plateBtn);
            plateArea.addChild(this.plateDisplay);
        },

        createToggleButton: function(onImage, offImage, onCallback, offCallback) {
            var onBtn  = Assets.createSprite(onImage);
            var offBtn = Assets.createSprite(offImage);

            onBtn.interactive = true;
            onBtn.buttonMode = true;
            offBtn.buttonMode = true;
            offBtn.interactive = true;
            offBtn.visible = false;

            onBtn.mousedown = onBtn.touchstart = function() {
                onBtn.y = 1;
            };

            offBtn.mousedown = offBtn.touchstart = function() {
                offBtn.y = 1;
            };

            onBtn.mouseup = onBtn.touchend = function() {
                onBtn.y = 0;
                onBtn.visible = false;
                offBtn.visible = true;
                offCallback();
            };

            offBtn.mouseup = offBtn.touchend = function() {
                offBtn.y = 0;
                offBtn.visible = false;
                onBtn.visible = true;
                onCallback();
            };

            var container = new PIXI.DisplayObjectContainer();
            container.addChild(onBtn);
            container.addChild(offBtn);

            return container;
        },

        initZoomControls: function() {
            var label = Assets.createSprite(Assets.Images.EFD_ZOOM_LABEL);

            var zoomInBtn          = Assets.createSprite(Assets.Images.EFD_ZOOM_IN_BTN);
            var zoomInBtnDisabled  = Assets.createSprite(Assets.Images.EFD_ZOOM_IN_BTN_DISABLED);
            var zoomOutBtn         = Assets.createSprite(Assets.Images.EFD_ZOOM_OUT_BTN);
            var zoomOutBtnDisabled = Assets.createSprite(Assets.Images.EFD_ZOOM_OUT_BTN_DISABLED);

            zoomInBtn.x  = zoomInBtnDisabled.x  = label.width + 1;
            zoomOutBtn.x = zoomOutBtnDisabled.x = zoomInBtn.x + zoomInBtn.width;
            label.y = zoomInBtn.height / 2 - label.height / 2;

            zoomInBtn.buttonMode = true;
            zoomOutBtn.buttonMode = true;

            var wrapper = new PIXI.DisplayObjectContainer();
            wrapper.addChild(label);
            wrapper.addChild(zoomInBtn);
            wrapper.addChild(zoomInBtnDisabled);
            wrapper.addChild(zoomOutBtn);
            wrapper.addChild(zoomOutBtnDisabled);

            wrapper.x = Math.floor(this.bodyWidth / 2 - wrapper.width / 2);
            wrapper.y = 210;

            this.body.addChild(wrapper);

            this.zoomInBtn  = zoomInBtn;
            this.zoomOutBtn = zoomOutBtn;
            this.zoomInBtnDisabled  = zoomInBtnDisabled;
            this.zoomOutBtnDisabled = zoomOutBtnDisabled;

            this.zoomInBtn.visible = false;
            this.zoomOutBtn.visible = false;
        },

        initShowValuesBtn: function() {
            var self = this;

            var showValuesBtn = this.createToggleButton(
                Assets.Images.EFD_SHOW_VALUES_BTN_ON, 
                Assets.Images.EFD_SHOW_VALUES_BTN_OFF, 
                function() {
                    self.valuesEnabled = true;
                    self.updateArrows();
                },
                function() {
                    self.valuesEnabled = false;
                    self.updateArrows();
                }
            );

            showValuesBtn.x = Math.floor(this.bodyWidth / 2 - showValuesBtn.width / 2);
            showValuesBtn.y = 232;

            this.body.addChild(showValuesBtn);
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

        updateArrows: function() {

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

        zoomIn: function() {
            console.log('zoom in')
        },

        zoomOut: function() {
            console.log('zoom out')
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

define(function(require) {

    'use strict';

    var Backbone = require('backbone');
    var SAT      = require('sat');
    var PIXI     = require('pixi');
    require('common/pixi/extensions');

    var AppView   = require('common/app/app');
    var PixiView  = require('common/pixi/view');
    var ArrowView = require('common/pixi/view/arrow');
    var Colors    = require('common/colors/colors');
    var Vector2   = require('common/math/vector2');

    var CapacitorView           = require('views/capacitor');
    var WireView                = require('views/wire');
    var BatteryView             = require('views/battery');
    var EFieldDetectorArrowView = require('views/e-field-detector-arrow');

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

            'mouseup    .zoomInBtn'  : 'zoomIn',
            'touchend   .zoomInBtn'  : 'zoomIn',
            'mouseup    .zoomOutBtn' : 'zoomOut',
            'touchend   .zoomOutBtn' : 'zoomOut',

            'mousedown  .zoomInBtn'  : 'zoomInDown',
            'touchstart .zoomInBtn'  : 'zoomInDown',
            'mousedown  .zoomOutBtn' : 'zoomOutDown',
            'touchstart .zoomOutBtn' : 'zoomOutDown'
        },

        initialize: function(options) {
            this.mvt = options.mvt;
            this.scene = options.scene;
            this.dielectric = options.dielectric;
            this.simulation = this.model;

            this.displayWidth  = 62
            this.displayHeight = 136;

            this.color = Colors.parseHex(EFieldDetectorView.DISPLAY_COLOR);
            this.wireColor = Colors.parseHex(EFieldDetectorView.WIRE_COLOR);

            this.lastPosition = new PIXI.Point();
            this._satVec = new SAT.Vector();

            this.initGraphics();
            this.updateMVT(this.mvt);
        },

        initGraphics: function() {
            this.initProbes();
            this.initBody();
            this.initZoomControls();
            this.initShowValuesBtn();
            this.initDisplayAreas();
            this.initArrows();

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

            if (AppView.windowIsShort()) {
                this.detectorContainer.x = 520;
                this.detectorContainer.y = 160;
            }
            else {
                this.detectorContainer.x = 520;
                this.detectorContainer.y = 304;
            }

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
                        self.sumArrow.show();
                    },
                    function() {
                        self.sumArrow.hide();
                    }
                );
                sumBtn.x = btnX;
                sumBtn.y = -1;
                this.sumBtn = sumBtn;

                var dielectricBtn = this.createToggleButton(
                    Assets.Images.EFD_CHECK_BTN_ON, 
                    Assets.Images.EFD_CHECK_BTN_OFF, 
                    function() {
                        self.dielectricArrow.show();
                    },
                    function() {
                        self.dielectricArrow.hide();
                    }
                );
                dielectricBtn.x = btnX;
                dielectricBtn.y = 14;
                this.dielectricBtn = dielectricBtn;

                var sumLabel = Assets.createSprite(Assets.Images.EFD_SUM_LABEL);
                sumLabel.x = sumBtn.x + sumBtn.width + 1;
                sumLabel.y = 6;

                var dielectricLabel = Assets.createSprite(Assets.Images.EFD_DIELECTRIC_LABEL);
                dielectricLabel.x = dielectricBtn.x + dielectricBtn.width + 1;
                dielectricLabel.y = 21;

                var dielectricMask = new PIXI.Graphics();
                dielectricMask.beginFill(0x000000, 1);
                dielectricMask.drawRect(displayX, displayY, this.displayWidth, this.displayHeight);
                dielectricMask.endFill();

                this.dielectricDisplay = new PIXI.DisplayObjectContainer();
                this.dielectricDisplay.x = displayX;
                this.dielectricDisplay.y = displayY;
                this.dielectricDisplay.mask = dielectricMask;

                rightArea.addChild(sumBtn);
                rightArea.addChild(dielectricBtn);
                rightArea.addChild(sumLabel);
                rightArea.addChild(dielectricLabel);
                rightArea.addChild(this.dielectricDisplay);
                rightArea.addChild(dielectricMask);

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
                    self.plateArrow.show();
                },
                function() {
                    self.plateArrow.hide();
                }
            );
            plateBtn.x = btnX;
            plateBtn.y = 6;
            this.plateBtn = plateBtn;

            var plateLabel = Assets.createSprite(Assets.Images.EFD_PLATE_LABEL);
            plateLabel.x = plateBtn.x + plateBtn.width + 1;
            plateLabel.y = 13;

            var plateMask = new PIXI.Graphics();
            plateMask.beginFill(0x000000, 1);
            plateMask.drawRect(displayX, displayY, this.displayWidth, this.displayHeight);
            plateMask.endFill();

            this.plateDisplay = new PIXI.DisplayObjectContainer();
            this.plateDisplay.x = displayX;
            this.plateDisplay.y = displayY;
            this.plateDisplay.mask = plateMask;

            plateArea.addChild(plateBtn);
            plateArea.addChild(plateLabel);
            plateArea.addChild(this.plateDisplay);
            plateArea.addChild(plateMask);
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

            container.reset = function() {
                onBtn.visible = true;
                offBtn.visible = false;
            };

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
                    self.showValues();
                },
                function() {
                    self.hideValues();
                }
            );

            showValuesBtn.x = Math.floor(this.bodyWidth / 2 - showValuesBtn.width / 2);
            showValuesBtn.y = 232;
            this.showValuesBtn = showValuesBtn;

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

        initArrows: function() {
            this.plateArrow = new EFieldDetectorArrowView({
                label: 'Plate'
            });
            this.plateDisplay.addChild(this.plateArrow.displayObject);

            if (this.dielectric) {
                this.sumArrow = new EFieldDetectorArrowView({
                    label: 'Sum'
                });

                this.dielectricArrow = new EFieldDetectorArrowView({
                    label: 'Dielectric'
                });

                this.dielectricDisplay.addChild(this.sumArrow.displayObject);
                this.dielectricDisplay.addChild(this.dielectricArrow.displayObject);
            }

            this.arrowScale = 1;
        },

        reset: function() {
            this.plateArrow.show();
            this.plateBtn.reset();

            if (this.dielectric) {
                this.sumArrow.show();
                this.sumBtn.reset();

                this.dielectricArrow.show();
                this.dielectricBtn.reset();
            }

            this.showValues();
            this.showValuesBtn.reset();
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

            var targetProbeHeight = this.mvt.modelToViewDeltaY(EFieldDetectorView.PROBE_HEIGHT); // in pixels
            var scale = targetProbeHeight / this.probe.texture.height;
            
            this.probe.scale.x = scale;
            this.probe.scale.y = scale;

            this.drawWires();
        },

        update: function(time, deltaTime) {
            if (this.displayObject.visible)
                this.updateReadout();
        },

        updateReadout: function() {
            var imageScale = this.probe.scale.x;
            var xOffset = -10 * imageScale;
            var yOffset =  10 * imageScale;
            var point = this._satVec;
            point.x = this.probe.x + xOffset;
            point.y = this.probe.y + yOffset;

            var platesEField = 0;
            var dielectricEField = 0;
            var sumEField = 0;

            // Find out from the scene which capacitor view it's intersecting with
            //   and then ask the capacitor view if it's intersecting with the air
            //   or the dielectric.
            var capacitorView = this.scene.getIntersectingCapacitorView(point);
            if (capacitorView) {
                var intersectsWithDielectric = capacitorView.pointIntersectsDielectricBetweenPlates(point);
                var capacitor = capacitorView.model;

                platesEField = this.simulation.get('circuit').getPlatesDielectricEFieldAt(capacitor, intersectsWithDielectric);

                if (this.dielectric) {
                    dielectricEField = this.simulation.get('circuit').getDielectricEFieldAt(capacitor, intersectsWithDielectric);
                    sumEField        = this.simulation.get('circuit').getEffectiveEFieldAt(capacitor);
                }
            }
            
            if (platesEField) {
                this.plateArrow.setValue(platesEField);
                this.plateArrow.centerOn(this.displayWidth / 2, this.displayHeight / 2);
            }
            else {
                this.plateArrow.setValue(0);
                this.plateArrow.centerOn(this.displayWidth / 2, this.displayHeight / 2);
            }

            if (this.dielectric) {
                if (sumEField) {
                    this.sumArrow.setValue(sumEField);
                    this.sumArrow.moveToY(this.plateArrow.getOriginY());
                }
                else {
                    this.sumArrow.setValue(0);
                    this.sumArrow.centerOn(this.displayWidth / 2, this.displayHeight / 2); 
                }

                // This has to happen before the dielectric arrow is positioned
                if (platesEField > 0)
                    this.sumArrow.alignTextAbove();
                else
                    this.sumArrow.alignTextBelow();
                
                if (dielectricEField) {
                    this.dielectricArrow.setValue(-dielectricEField);
                    this.dielectricArrow.moveToY(this.plateArrow.getTargetY());
                }
                else {
                    this.dielectricArrow.setValue(0);
                    this.dielectricArrow.centerOn(this.displayWidth / 2, this.displayHeight / 2);
                    this.dielectricArrow.moveToY(this.sumArrow.getTargetY());
                }

                if (platesEField > 0)
                    this.dielectricArrow.alignTextBelow();
                else
                    this.dielectricArrow.alignTextAbove();
            }

            this.zoomOutBtn.visible = this.canZoomOut();
            this.zoomInBtn.visible = this.canZoomIn();

            this.zoomOutBtnDisabled.visible = !this.zoomOutBtn.visible;
            this.zoomInBtnDisabled.visible = !this.zoomInBtn.visible;
        },

        canZoomOut: function() {
            return (this.canZoom() && this.displayHeight < this.getArrowsHeight() * this.arrowScale + 2 * this.getArrowsTextHeight());
        },

        canZoomIn: function() {
            var filledDisplayPercent = 0.75;
            return (this.canZoom() && this.displayHeight * filledDisplayPercent > this.getArrowsHeight() * this.arrowScale + 2 * this.getArrowsTextHeight());
        },

        canZoom: function() {
            return this.hasVisibleVector() && this.hasNonZeroVector();
        },

        hasNonZeroVector: function() {
            var nonZero = this.plateArrow.value !== 0;
            if (this.dielectric) {
                nonZero = nonZero || this.sumArrow.value !== 0;
                nonZero = nonZero || this.dielectricArrow.value !== 0;
            }
            return nonZero;
        },

        hasVisibleVector: function() {
            var visible = this.plateArrow.displayObject.visible;
            if (this.dielectric) {
                visible = visible || this.sumArrow.displayObject.visible;
                visible = visible || this.dielectricArrow.displayObject.visible;
            }
            return visible;
        },

        /**
         * Zooms to the optimum scale that makes everything visible in the viewport,
         *   with a little bit of whitespace at the top and bottom of the viewport.
         *   The zoom factor computation is complicated by the fact that the vectors
         *   scale, while their labels and values do not. Zooming is based solely on
         *   vertical dimensions (height); width of the scene is irrelevant.
         */
        determineZoomScale: function() {
            var arrowHeight = this.getArrowsHeight();
            var textHeight = this.getArrowsTextHeight();
            var totalHeight = arrowHeight + 2 * textHeight;
            var displayHeight = this.displayHeight;
            var percentOfDisplayToFill = 1;

            var scale = (displayHeight * percentOfDisplayToFill - 2 * textHeight) / arrowHeight;

            this.plateArrow.setScale(scale);
            if (this.dielectric) {
                this.sumArrow.setScale(scale);
                this.dielectricArrow.setScale(scale);
            }

            this.arrowScale = scale;
        },

        /**
         * Returns the maximum height of all the arrows
         */
        getArrowsHeight: function() {
            if (!this.dielectric)
                return this.plateArrow.getArrowHeight();
            else {
                var max = Number.NEGATIVE_INFINITY;
                max = Math.max(max, this.plateArrow.getArrowHeight());
                max = Math.max(max, this.sumArrow.getArrowHeight());
                max = Math.max(max, this.dielectricArrow.getArrowHeight());
                return max;
            }
        },

        /**
         * Returns the maximum height of all the arrows' text
         */
        getArrowsTextHeight: function() {
            if (!this.dielectric)
                return this.plateArrow.getTextHeight();
            else {
                var max = Number.NEGATIVE_INFINITY;
                max = Math.max(max, this.plateArrow.getTextHeight());
                max = Math.max(max, this.sumArrow.getTextHeight());
                max = Math.max(max, this.dielectricArrow.getTextHeight());
                return max;
            }
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
            this.determineZoomScale();
            this.zoomInBtn.y = 0;
        },

        zoomOut: function() {
            this.determineZoomScale();
            this.zoomOutBtn.y = 0;
        },

        zoomInDown: function() {
            this.zoomInBtn.y = 1;
        },

        zoomOutDown: function() {
            this.zoomOutBtn.y = 1;
        },

        showValues: function() {
            this.plateArrow.showValue();
            if (this.dielectric) {
                this.sumArrow.showValue();
                this.dielectricArrow.showValue();
            }
        },

        hideValues: function() {
            this.plateArrow.hideValue();
            if (this.dielectric) {
                this.sumArrow.hideValue();
                this.dielectricArrow.hideValue();
            }
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

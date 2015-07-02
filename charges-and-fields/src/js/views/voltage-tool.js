define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    require('common/pixi/extensions');
    
    var PixiView       = require('common/pixi/view');
    var Colors         = require('common/colors/colors');
    var PiecewiseCurve = require('common/math/piecewise-curve');

    var EquipotentialPlot = require('views/equipotential-plot');

    var Constants = require('constants');

    var Assets = require('assets');

    /**
     * A view that represents an atom
     */
    var VoltageTool = PixiView.extend({

        width: 200,
        height: 116,
        margin: 15,
        sensorOuterRadius: 25,
        sensorInnerRadius: 17,
        btnHeight: 36,

        events: {
            'touchstart      .displayObject': 'dragStart',
            'mousedown       .displayObject': 'dragStart',
            'touchmove       .displayObject': 'drag',
            'mousemove       .displayObject': 'drag',
            'touchend        .displayObject': 'dragEnd',
            'mouseup         .displayObject': 'dragEnd',
            'touchendoutside .displayObject': 'dragEnd',
            'mouseupoutside  .displayObject': 'dragEnd',

            'click .plotBtn'  : 'plot',
            'click .clearBtn' : 'clearPlot',

            'mouseover .plotBtn'  : 'plotBtnHover',
            'mouseout  .plotBtn'  : 'plotBtnUnhover',
            'mousedown .plotBtn'  : 'plotBtnDown',
            'mouseover .clearBtn' : 'clearBtnHover',
            'mouseout  .clearBtn' : 'clearBtnUnhover',
            'mousedown .clearBtn' : 'clearBtnDown',
        },

        /**
         * Initializes the new VoltageTool.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;
            this.equipotentialPlotLayer = options.equipotentialPlotLayer;

            this.panelColor = Colors.parseHex(Constants.SceneView.PANEL_BG);
            this.plotBtnColor = Colors.parseHex('#21366b');
            this.clearBtnColor = Colors.parseHex('#bbb');

            this.plotViews = [];

            // Cached objects
            this._dragOffset = new PIXI.Point();

            this.initGraphics();

            this.listenTo(this.simulation.charges, 'change add remove reset',  this.detectVoltage);
            this.listenTo(this.simulation.charges, 'change add remove reset',  this.clearPlot);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.initPanel();
            this.initSensor();
            this.initButtons();
            this.initReadoutText();
            this.initEquipotentialLabel();

            this.displayObject.buttonMode = true;

            this.updateMVT(this.mvt);
        },

        initPanel: function() {
            var halfWidth = this.width / 2;

            // Draw the shadow
            var outline = new PiecewiseCurve();
            var kappa = 4 * ((Math.sqrt(2) - 1) / 3);
            var radius = this.sensorOuterRadius;

            outline
                .moveTo(-halfWidth, 0)
                .lineTo(-radius, 0)
                .curveTo(
                    -radius, 0 -radius * kappa, 
                    -radius*kappa, -radius,
                    0, -radius
                )
                .curveTo(
                    radius * kappa, -radius,
                    radius, -radius * kappa,
                    radius, 0
                )
                .lineTo(halfWidth, 0)
                .lineTo(halfWidth, this.height)
                .lineTo(-halfWidth, this.height)
                .close();

            var drawStyle = {
                lineWidth: 11,
                strokeStyle: 'rgba(0,0,0,0)',
                shadowBlur: 11,
                fillStyle: 'rgba(0,0,0,1)'
            };

            var shadow = PIXI.Sprite.fromPiecewiseCurve(outline, drawStyle);
            shadow.alpha = 0.3;
            this.displayObject.addChild(shadow);

            // Draw the panel
            var graphics = new PIXI.Graphics();
            graphics.beginFill(this.panelColor, 1);
            graphics.drawRect(-halfWidth, 0, this.width, this.height);
            graphics.drawCircle(0, 0, this.sensorOuterRadius);
            graphics.endFill();

            this.displayObject.addChild(graphics);
        },

        initSensor: function() {
            this.sensor = new PIXI.Graphics();
            this.sensorMinus = new PIXI.Graphics();
            this.sensorPlus = new PIXI.Graphics();

            var lineThickness = 4;
            var lineLength = this.sensorInnerRadius - 3;

            this.sensorMinus.beginFill(0xFFFFFF, 1);
            this.sensorMinus.drawRect(-lineLength / 2, -lineThickness / 2, lineLength, lineThickness);
            this.sensorMinus.endFill();
            this.sensorMinus.visible = false;

            this.sensorPlus.beginFill(0xFFFFFF, 1);
            this.sensorPlus.drawRect(-lineLength / 2, -lineThickness / 2, lineLength, lineThickness);
            this.sensorPlus.drawRect(-lineThickness / 2, -lineLength / 2, lineThickness, lineLength);
            this.sensorPlus.endFill();
            this.sensorMinus.visible = true;

            this.displayObject.addChild(this.sensor);
            this.displayObject.addChild(this.sensorMinus);
            this.displayObject.addChild(this.sensorPlus);
        },

        drawSensor: function(voltage) {
            var color = Constants.colorFromVoltage(voltage);
            this.sensor.clear();
            this.sensor.beginFill(0xD7D7D7, 1);
            this.sensor.drawCircle(0, 0, this.sensorInnerRadius + 2);
            this.sensor.endFill();
            this.sensor.beginFill(color, 1);
            this.sensor.drawCircle(0, 0, this.sensorInnerRadius);
            this.sensor.endFill();

            if (voltage > 0) {
                this.sensorMinus.visible = false;
                this.sensorPlus.visible = true;
            }
            else if (voltage < 0) {
                this.sensorMinus.visible = true;
                this.sensorPlus.visible = false;
            }
            else {
                this.sensorMinus.visible = false;
                this.sensorPlus.visible = false;
            }
        },

        initButtons: function() {
            var w = this.width;
            var h = this.height;
            var m = this.margin;
            var btnWidth = (w - m * 2 - 4) / 2;
            var btnHeight = this.btnHeight;

            var textSettings = {
                font: '17px Helvetica Neue',
                fill: '#fff'
            };

            // Plot button
            var plotBtnBg = new PIXI.Graphics();
            plotBtnBg.beginFill(this.plotBtnColor, 1);
            plotBtnBg.drawRect(0, 0, btnWidth, btnHeight);
            plotBtnBg.endFill();

            var plotBtnText = new PIXI.Text('Plot', textSettings);
            plotBtnText.anchor.x = 0.49;
            plotBtnText.anchor.y = 0.391;
            plotBtnText.x = btnWidth / 2;
            plotBtnText.y = btnHeight / 2;

            this.plotBtn = new PIXI.DisplayObjectContainer();
            this.plotBtn.x = -w / 2 + m;
            this.plotBtn.y = h - btnHeight;
            this.plotBtn.addChild(plotBtnBg);
            this.plotBtn.addChild(plotBtnText);

            // Clear button
            var clearBtnBg = new PIXI.Graphics();
            clearBtnBg.beginFill(this.clearBtnColor, 1);
            clearBtnBg.drawRect(0, 0, btnWidth, btnHeight);
            clearBtnBg.endFill();

            var clearBtnText = new PIXI.Text('Clear', textSettings);
            clearBtnText.anchor.x = 0.492;
            clearBtnText.anchor.y = 0.391;
            clearBtnText.x = btnWidth / 2;
            clearBtnText.y = btnHeight / 2;

            this.clearBtn = new PIXI.DisplayObjectContainer();
            this.clearBtn.x = 2;
            this.clearBtn.y = h - btnHeight;
            this.clearBtn.addChild(clearBtnBg);
            this.clearBtn.addChild(clearBtnText);

            // Add them
            this.displayObject.addChild(this.plotBtn);
            this.displayObject.addChild(this.clearBtn);
        },

        initReadoutText: function() {
            var w = this.width;
            var m = this.margin;

            var readoutTextSettings = {
                font: '16px Helvetica Neue',
                fill: '#555'
            };

            var voltage = new PIXI.Text('Voltage:', readoutTextSettings);
            voltage.x = -w / 2 + m;
            voltage.y = m;

            var readout = new PIXI.Text('40.9 V', readoutTextSettings);
            readout.x = w / 2 - m;
            readout.y = m;
            readout.anchor.x = 1;

            this.displayObject.addChild(voltage);
            this.displayObject.addChild(readout);

            this.readout = readout;
        },

        initEquipotentialLabel: function() {
            var h = this.height;
            var m = this.margin;

            var settings = {
                font: '14px Helvetica Neue',
                fill: '#888'
            };

            var label = new PIXI.Text('EQUIPOTENTIAL', settings);
            label.anchor.x = 0.5;
            label.x = 0;
            label.y = h - this.btnHeight - 24;

            this.displayObject.addChild(label);

            var graphics = new PIXI.Graphics();
            graphics.lineStyle(1, 0xD1D1D1, 1);
            graphics.moveTo(-label.width / 2 - 6, label.y + 6);
            graphics.lineTo(-this.width / 2 + m, label.y + 6);
            graphics.moveTo(-label.width / 2 - 6, label.y + 10);
            graphics.lineTo(-this.width / 2 + m, label.y + 10);

            graphics.moveTo(label.width / 2 + 6, label.y + 6);
            graphics.lineTo(this.width / 2 - m, label.y + 6);
            graphics.moveTo(label.width / 2 + 6, label.y + 10);
            graphics.lineTo(this.width / 2 - m, label.y + 10);

            this.displayObject.addChild(graphics);
        },

        updateReadout: function(voltage) {
            this.readout.setText((voltage * Constants.VFAC).toFixed(1) + ' V');
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.detectVoltage();
        },

        dragStart: function(data) {
            this.dragOffset = data.getLocalPosition(this.displayObject, this._dragOffset);
            this.dragging = true;
        },

        drag: function(data) {
            if (this.dragging) {
                var dx = data.global.x - this.displayObject.x - this.dragOffset.x;
                var dy = data.global.y - this.displayObject.y - this.dragOffset.y;
                
                this.displayObject.x += dx;
                this.displayObject.y += dy;

                this.detectVoltage();
            }
        },

        dragEnd: function(data) {
            this.dragging = false;
        },

        detectVoltage: function() {
            var x = this.mvt.viewToModelX(this.displayObject.x);
            var y = this.mvt.viewToModelY(this.displayObject.y);
            var voltage = this.simulation.getV(x, y);
            this.drawSensor(voltage);
            this.updateReadout(voltage);
        },

        plot: function() {
            this.plotBtnHover();
            this.plotBtn.y = this.height - this.btnHeight;

            if (this.simulation.hasCharges()) {
                // We can only create equipotential plots if there are charges.
                var plotView = new EquipotentialPlot({
                    x: this.displayObject.x,
                    y: this.displayObject.y,
                    mvt: this.mvt,
                    simulation: this.simulation
                });

                this.equipotentialPlotLayer.addChild(plotView.displayObject);
                this.plotViews.push(plotView);
            }
        },

        clearPlot: function() {
            this.clearBtnHover();
            this.clearBtn.y = this.height - this.btnHeight;

            for (var i = this.plotViews.length - 1; i >= 0; i--) {
                this.plotViews[i].removeFrom(this.equipotentialPlotLayer);
                this.plotViews.splice(i, 1);
            }
        },

        plotBtnHover: function() {
            this.plotBtn.alpha = 0.9;
        },

        plotBtnUnhover: function() {
            this.plotBtn.alpha = 1;
        },

        plotBtnDown: function() {
            this.plotBtnUnhover();
            this.plotBtn.y = this.height - this.btnHeight + 1;
        },

        clearBtnHover: function() {
            this.clearBtn.alpha = 0.9;
        },

        clearBtnUnhover: function() {
            this.clearBtn.alpha = 1;
        },

        clearBtnDown: function() {
            this.clearBtnUnhover();
            this.clearBtn.y = this.height - this.btnHeight + 1;
        }

    });


    return VoltageTool;
});
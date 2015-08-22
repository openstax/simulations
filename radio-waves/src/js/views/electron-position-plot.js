define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    require('common/pixi/extensions');
    
    var PixiView       = require('common/pixi/view');
    var Colors         = require('common/colors/colors');
    var PiecewiseCurve = require('common/math/piecewise-curve');

    var Constants = require('constants');

    /**
     * A view that represents an electron-position plot. Its update
     *   function assumes a constant deltaTime because the spacing
     *   between data points is the same.
     */
    var ElectronPositionPlot = PixiView.extend({

        width: 260,
        height: 160,
        margin: 15,

        events: {
            'touchstart      .displayObject': 'dragStart',
            'mousedown       .displayObject': 'dragStart',
            'touchmove       .displayObject': 'drag',
            'mousemove       .displayObject': 'drag',
            'touchend        .displayObject': 'dragEnd',
            'mouseup         .displayObject': 'dragEnd',
            'touchendoutside .displayObject': 'dragEnd',
            'mouseupoutside  .displayObject': 'dragEnd'
        },

        /**
         * Initializes the new ElectronPositionPlot.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;
            this.electron = options.electron;
            this.titleText = options.title;
            this.minY = options.minY;
            this.maxY = options.maxY;

            this.panelColor = Colors.parseHex('#fff');
            this.gridColor  = Colors.parseHex('#ccc');
            this.lineColor  = Colors.parseHex('#2575BA');

            this.lineWidth  = 1;
            this.gridLineWidth = 1;

            // Cached objects
            this._dragOffset = new PIXI.Point();

            this.initGraphics();
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.initPanel();
            this.initTitle();
            this.initAxisLabel();
            this.initPlot();

            this.displayObject.buttonMode = true;

            this.updateMVT(this.mvt);
        },

        initPanel: function() {
            var halfWidth = this.width / 2;

            // Draw the shadow
            var outline = new PiecewiseCurve();

            outline
                .moveTo(0, 0)
                .lineTo(this.width, 0)
                .lineTo(this.width, this.height)
                .lineTo(0, this.height)
                .close();

            var drawStyle = {
                lineWidth: 11,
                strokeStyle: 'rgba(0,0,0,0)',
                shadowBlur: 11,
                fillStyle: 'rgba(0,0,0,1)'
            };

            var shadow = PIXI.Sprite.fromPiecewiseCurve(outline, drawStyle);
            shadow.alpha = 0.13;
            this.displayObject.addChild(shadow);

            // Draw the panel
            var graphics = new PIXI.Graphics();
            graphics.beginFill(this.panelColor, 0.78);
            graphics.drawRect(0, 0, this.width, this.height);
            graphics.endFill();

            this.displayObject.addChild(graphics);
        },

        initTitle: function() {
            var m = this.margin;

            var settings = {
                font: '14px Helvetica Neue',
                fill: '#888'
            };

            var title = new PIXI.Text(this.titleText, settings);
            title.x = Math.round((this.width - title.width) / 2);
            title.y = 8;

            this.displayObject.addChild(title);

            // Y-Offsets for lines
            var y1 = 6;
            var y2 = 10;
            // Padding between words and line
            var p = m / 2;

            var graphics = new PIXI.Graphics();
            graphics.lineStyle(1, 0xC1C1C1, 1);

            // Lines on left side
            graphics.moveTo(title.x - p, title.y + y1);
            graphics.lineTo(m,           title.y + y1);
            graphics.moveTo(title.x - p, title.y + y2);
            graphics.lineTo(m,           title.y + y2);

            // Lines on right side
            graphics.moveTo(title.x + title.width + p, title.y + y1);
            graphics.lineTo(this.width - m,            title.y + y1);
            graphics.moveTo(title.x + title.width + p, title.y + y2);
            graphics.lineTo(this.width - m,            title.y + y2);

            this.displayObject.addChild(graphics);
        },

        initAxisLabel: function() {
            var m = this.margin;

            var settings = {
                font: '11px Helvetica Neue',
                fill: '#888'
            };

            var label = new PIXI.Text('Time', settings);
            label.x = Math.round((this.width - label.width) / 2);
            label.y = this.height - 20;

            this.displayObject.addChild(label);
        },

        initPlot: function() {
            var plotX = this.margin;
            var plotY = this.margin + 19;
            var plotWidth  = this.width  - (plotX * 2);
            var plotHeight = this.height - (plotY + 26);

            var plotBg = new PIXI.Graphics();
            // Draw border
            plotBg.beginFill(0xCCCCCC, 1);
            plotBg.drawRect(plotX - 1, plotY - 1, plotWidth + 2, plotHeight + 2);
            plotBg.endFill();
            // Draw fill color
            plotBg.beginFill(0xFFFFFF, 1);
            plotBg.drawRect(plotX, plotY, plotWidth, plotHeight);
            plotBg.endFill();

            var plotGraphics = new PIXI.Graphics();
            plotGraphics.x = plotX;
            plotGraphics.y = plotY;

            this.displayObject.addChild(plotBg);
            this.displayObject.addChild(plotGraphics);

            this.plotX = plotX;
            this.plotY = plotY;
            this.plotWidth = plotWidth;
            this.plotHeight = plotHeight;
            this.plotGraphics = plotGraphics;

            this.plotDataLength = plotWidth;
            this.plotData = [];

            this.tickX = 0;
            this.tickSpace = 20;

            this.yScale = plotHeight / (this.maxY - this.minY);
            this.yOffset = Math.floor(this.minY * this.yScale);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;
        },

        /**
         * This function assumes a constant deltaTime, so only call it
         *   in that context.
         */
        update: function() {
            // Add the current electron position to the dataset
            this.addDatum(this.electron.get('position').y);

            var data       = this.plotData;
            var plotWidth  = this.plotWidth;
            var plotHeight = this.plotHeight;
            var graphics   = this.plotGraphics;
            var yScale     = this.yScale;
            var yOffset    = this.yOffset;
            var tickX      = this.tickX;
            var tickSpace  = this.tickSpace;

            // Draw horizontal lines
            graphics.lineStyle(this.gridLineWidth, this.gridColor, 1);
            graphics.moveTo(0,         plotHeight / 2);
            graphics.lineTo(plotWidth, plotHeight / 2);

            // Draw vertical lines
            for (var x = 0; x < plotWidth; x++) {
                if ((x % tickSpace) === tickX) {
                    graphics.moveTo(x, 0);
                    graphics.lineTo(x, plotHeight);
                }
            }

            // Draw data points
            graphics.lineStyle(this.lineWidth, this.lineColor, 1);
            for (var i = 1; i < data.length; i++) {
                var d0 = data[i - 1] * yScale;
                var d1 = data[i] * yScale;

                graphics.moveTo(i - 1, d0 - yOffset);
                graphics.lineTo(i,     d1 - yOffset);
            }
        },

        addDatum: function(datum) {
            // Move the vertical tick location
            this.tickX = (this.tickX + 1) % this.tickSpace;

            // Move all data one spot to the right
            var data = this.plotData;
            for (var i = this.plotDataLength - 1; i > 0; i--)
                data[i] = data[i - 1];

            data[0] = datum;
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
            }
        },

        dragEnd: function(data) {
            this.dragging = false;
        },

        show: function() {
            this.displayObject.visible = true;
        },

        hide: function() {
            this.displayObject.visible = false;
        }

    });


    return ElectronPositionPlot;
});
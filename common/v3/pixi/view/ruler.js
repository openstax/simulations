define(function(require) {

    'use strict';

    var Backbone = require('backbone');
    var PIXI     = require('pixi');
    require('common/pixi/extensions');

    var PixiView = require('../view');

    var Colors         = require('../../colors/colors');
    var Vector2        = require('../../math/vector2');
    var PiecewiseCurve = require('../../math/piecewise-curve');

    var RulerView = PixiView.extend({

        defaultFont: '14px Arial',
        defaultLabelColor: '#000',

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

        initialize: function(options) {
            options = _.extend({
                shadow: true,

                fillColor: '#fcd076',
                fillAlpha: 1,
                lineColor: '#d49005',
                lineWidth: 1,
                lineAlpha: 1,

                units: 'cm',
                pxPerUnit: 5,
                orientation: 'vertical',
                rulerWidth: 10,
                rulerMeasureUnits : 100,
                unitsFont: undefined,

                ticks : [{
                    size: 10,
                    at: 10,
                    color: '#000'
                },{
                    size: 6,
                    at: 5,
                    color: '#000'
                },{
                    size: 3,
                    at: 1,
                    color: '#d49005'
                }],

                labels: [{
                    font: this.defaultFont,
                    at: 10
                }]
            }, options);

            this.shadow = options.shadow;

            this.fillColor = Colors.parseHex(options.fillColor);
            this.fillAlpha = options.fillAlpha;

            this.lineColor = Colors.parseHex(options.lineColor);
            this.lineWidth = options.lineWidth;
            this.lineAlpha = options.lineAlpha;

            this.vertical = options.orientation === 'vertical';
            this.pxPerUnit = options.pxPerUnit;
            this.rulerWidth = options.rulerWidth;
            this.units = options.units;
            this.rulerMeasureUnits = options.rulerMeasureUnits;
            this.unitsFont = options.unitsFont;

            // Sort the ticks from smallest to largest so that draw
            //   over the smaller ones with larger ones instead of
            //   the other way around.
            this.ticks = _.sortBy(options.ticks, function(tick){
                return tick.size;
            });
            this.labels = options.labels;

            this.lastPosition = new PIXI.Point();

            this.initGraphics();
        },

        initGraphics: function() {
            this.displayObject.buttonMode = true;

            this.initBackground();
            this.initTicks();
            this.initLabels();

            this.drawBackground();
            this.drawTicks();
            this.drawLabels();
        },

        initBackground: function() {
            this.background = new PIXI.Graphics();
            this.displayObject.addChild(this.background);

            this.shadow = new PIXI.Container();
            this.displayObject.addChild(this.shadow);
        },

        initTicks: function() {
            this.ticksGraphics = new PIXI.Graphics();
            this.displayObject.addChild(this.ticksGraphics);
        },

        initLabels: function() {
            this.labelsContainer = new PIXI.Container();
            this.displayObject.addChild(this.labelsContainer);
        },

        drawBackground: function() {
            this.background.clear();
            this.background.lineStyle(this.lineWidth, this.lineColor, this.lineAlpha);
            this.background.beginFill(this.fillColor, this.fillAlpha);

            var width, height, rect;
            if (this.vertical) {
                width  = this.rulerWidth * this.pxPerUnit;
                height = this.rulerMeasureUnits * this.pxPerUnit + 1;
                rect = new PIXI.Rectangle(0, 0, width, height);
            }
            else {
                width  = this.rulerMeasureUnits * this.pxPerUnit + 1;
                height = this.rulerWidth * this.pxPerUnit;
                rect = new PIXI.Rectangle(0, 0, width, height);
            }

            this.outlineRect = rect;
            this.background.drawRect(rect.x, rect.y, rect.width, rect.height);
            this.background.endFill();

            if (this.shadow) {
                var drawStyle = {
                    lineWidth: 11,
                    strokeStyle: 'rgba(0,0,0,0)',
                    shadowBlur: 11,
                    fillStyle: 'rgba(0,0,0,1)'
                };

                var outline = new PiecewiseCurve()
                    .moveTo(rect.x,              rect.y)
                    .lineTo(rect.x,              rect.y + rect.height)
                    .lineTo(rect.x + rect.width, rect.y + rect.height)
                    .lineTo(rect.x + rect.width, rect.y)
                    .close();

                this.displayObject.removeChild(this.shadow);
                this.shadow = PIXI.Sprite.fromPiecewiseCurve(outline, drawStyle);
                this.shadow.alpha = 0.3;
                this.displayObject.addChildAt(this.shadow, 0);
            }
        },

        drawTicks: function() {
            var outlineRect = this.outlineRect;
            var pxPerUnit = this.pxPerUnit;
            var graphics = this.ticksGraphics;
            graphics.clear();

            // Draw each kind of tick
            var color, width, size;
            for (var i = 0; i < this.ticks.length; i++) {
                color = (this.ticks[i].color !== undefined) ? Colors.parseHex(this.ticks[i].color) : this.lineColor;
                width = (this.ticks[i].width !== undefined) ? this.ticks[i].width : this.lineWidth;
                size  = this.ticks[i].size;
   
                graphics.lineStyle(width, color, this.lineAlpha);

                if (this.vertical) {
                    for (var d = this.ticks[i].at; d < this.rulerMeasureUnits; d += this.ticks[i].at) {
                        graphics.moveTo(outlineRect.x,        outlineRect.y + d * pxPerUnit);
                        graphics.lineTo(outlineRect.x + size, outlineRect.y + d * pxPerUnit);

                        graphics.moveTo(outlineRect.x + outlineRect.width,        outlineRect.y + d * pxPerUnit);
                        graphics.lineTo(outlineRect.x + outlineRect.width - size, outlineRect.y + d * pxPerUnit);
                    }
                }
                else {
                    for (var d = this.ticks[i].at; d < this.rulerMeasureUnits; d += this.ticks[i].at) {
                        graphics.moveTo(outlineRect.x + d * pxPerUnit, outlineRect.y);
                        graphics.lineTo(outlineRect.x + d * pxPerUnit, outlineRect.y + size);

                        graphics.moveTo(outlineRect.x + d * pxPerUnit, outlineRect.y + outlineRect.height);
                        graphics.lineTo(outlineRect.x + d * pxPerUnit, outlineRect.y + outlineRect.height - size);
                    }
                }
            }
        },

        drawLabels: function() {
            this.labelsContainer.removeChildren();

            var outlineRect = this.outlineRect;
            var pxPerUnit = this.pxPerUnit;
            var xAnchor = 0.5;
            var yAnchor = 0.38;
            var style;
            var label;
            for (var i = 0; i < this.labels.length; i++) {
                style = {
                    font: (this.labels[i].font  !== undefined) ? this.labels[i].font  : this.defaultFont,
                    fill: (this.labels[i].color !== undefined) ? this.labels[i].color : this.defaultLabelColor
                };

                if (this.vertical) {
                    for (var d = this.labels[i].at; d < this.rulerMeasureUnits; d += this.labels[i].at) {
                        if (this.labels[i].endAt === undefined || d <= this.labels[i].endAt) {
                            label = new PIXI.Text(d, style);
                            label.anchor.x = xAnchor;
                            label.anchor.y = yAnchor;
                            label.x = outlineRect.x + outlineRect.width / 2;
                            label.y = outlineRect.y + d * pxPerUnit;
                            label.rotation = Math.PI / 2;
                            this.labelsContainer.addChild(label);
                        }
                    }
                }
                else {
                    for (var d = this.labels[i].at; d < this.rulerMeasureUnits; d += this.labels[i].at) {
                        if (this.labels[i].endAt === undefined || d <= this.labels[i].endAt) {
                            label = new PIXI.Text(d, style);
                            label.anchor.x = xAnchor;
                            label.anchor.y = yAnchor;
                            label.x = outlineRect.x + d * pxPerUnit;
                            label.y = outlineRect.y + outlineRect.height / 2;
                            this.labelsContainer.addChild(label);
                        }
                    }
                }
            }

            if (this.unitsFont)
                style = {
                    font: this.unitsFont,
                    fill: style.fill
                };

            label = new PIXI.Text(this.units, style);
            label.anchor.x = 1;
            label.anchor.y = yAnchor;
            label.x = outlineRect.x + outlineRect.width - 6;
            label.y = outlineRect.y + outlineRect.height / 2;
            this.labelsContainer.addChild(label);
        },

        dragStart: function(event) {
            this.lastPosition.x = event.data.global.x;
            this.lastPosition.y = event.data.global.y;

            this.dragging = true;
        },

        drag: function(event) {
            if (this.dragging) {
                var dx = event.data.global.x - this.lastPosition.x;
                var dy = event.data.global.y - this.lastPosition.y;

                this.displayObject.x += dx;
                this.displayObject.y += dy;

                this.lastPosition.x = event.data.global.x;
                this.lastPosition.y = event.data.global.y;
            }
        },

        dragEnd: function(event) {
            this.dragging = false;
        },

        show: function() {
            this.displayObject.visible = true;
        },

        hide: function() {
            this.displayObject.visible = false;
        },

        setPixelsPerUnit: function(pxPerUnit) {
            this.pxPerUnit = pxPerUnit;

            this.drawBackground();
            this.drawTicks();
            this.drawLabels();
        },

        setPosition: function(x, y) {
            this.displayObject.x = x;
            this.displayObject.y = y;
        }

    });

    return RulerView;
});

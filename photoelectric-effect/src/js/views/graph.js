define(function(require) {

    'use strict';

    var $        = require('jquery');
    var _        = require('underscore');
    var Backbone = require('backbone'); Backbone.$ = $;
    var Pool     = require('object-pool');

    var Vector2 = require('common/math/vector2');

    var vectorPool = Pool({
        init: function() {
            return new Vector2();
        },
        enable: function(vector) {
            vector.set(0, 0);
        }
    });

    var html = require('text!templates/graph.html');
    
    require('less!styles/graph');

    /**
     * 
     */
    var GraphView = Backbone.View.extend({

        className: 'graph-view',

        events: {
            'click .zoom-in-btn'  : 'zoomIn',
            'click .zoom-out-btn' : 'zoomOut'
        },

        paddingLeft: 30,
        paddingRight: 30,
        paddingTop: 6,
        paddingBottom: 34,

        zoomFactor: 0.2,
        minZoom: 0.2,
        maxZoom: 2.6,

        initialize: function(options) {
            // Default values
            options = _.extend({
                title: 'Value',
                points: [],
                pointsDisjoint: false,

                x: {
                    start: -8,
                    end: 8,
                    step: 2,
                    label: 'X Axis',
                    showNumbers: true,
                    decimals: undefined
                },
                y: {
                    start: 0,
                    end: 8,
                    step: 2,
                    label: 'Y Axis',
                    showNumbers: true,
                    decimals: undefined
                },

                width: 240,
                height: 124,

                lineThickness: 3,
                lineColor: '#f00',
                lineAlpha: 0.4,
                gridColor: '#ddd',
                gridThickness: 1,
                borderColor: '#000',
                borderThickness: 1,
                axisColor: '#000',
                axisThickness: 2,
                tickLength: 6,
                axisLabelMargin: 4,

                numberFontSize: 10,
                axisLabelFontSize: 14
            }, options);

            this.simulation = options.simulation;

            this.title = options.title;
            this.points = options.points;
            this.pointsDisjoint = options.pointsDisjoint;

            this.x = options.x;
            this.y = options.y;
            this.yEnd = this.y.end; // Because of zooming, the y-end changes
            this.yScale = 1;

            this.elementWidth = options.width;
            this.elementHeight = options.height;

            var resolution = this.getResolution();
            this.width  = options.width  * resolution;
            this.height = options.height * resolution;
            this.paddingLeft   *= resolution;
            this.paddingRight  *= resolution;
            this.paddingTop    *= resolution;
            this.paddingBottom *= resolution;

            this.lineThickness = options.lineThickness * resolution;
            this.lineColor = options.lineColor;
            this.lineAlpha = options.lineAlpha;
            this.gridColor = options.gridColor;
            this.gridThickness = options.gridThickness * resolution;
            this.borderColor = options.borderColor;
            this.borderThickness = options.borderThickness * resolution;
            this.axisColor = options.axisColor;
            this.axisThickness = options.axisThickness * resolution;
            this.tickLength = options.tickLength * resolution;
            this.axisLabelMargin = options.axisLabelMargin;

            this.numberFont = options.numberFontSize * resolution + 'px Helvetica Neue';
            this.axisLabelFont = options.axisLabelFontSize * resolution + 'px Helvetica Neue';
        },

        /**
         * Renders the view
         */
        render: function() {
            this.$el.html(html);
            return this;
        },

        /**
         * Sizes the canvas and initializes the canvas context
         */
        postRender: function() {
            // Give the canvas its dimensions
            var $canvas = this.$('canvas');
            $canvas.width(this.elementWidth);
            $canvas.height(this.elementHeight);
            var canvas = this.$('canvas')[0];
            canvas.width = this.width;
            canvas.height = this.height;

            // Get the canvas context
            this.ctx = canvas.getContext('2d');

            return this;
        },

        /**
         * Updates the graph
         */
        update: function() {
            this.draw();
        },

        /**
         * Draws the graph
         */
        draw: function() {
            this.ctx.clearRect(0, 0, this.width, this.height);

            this.drawEmptyGraph();
            this.drawData();
        },

        drawEmptyGraph: function() {
            var ctx = this.ctx;
            var width = this.getGraphWidth();
            var height = this.getGraphHeight();
            var originX = this.paddingLeft;
            var originY = this.paddingTop + height;

            var cols = (this.x.end - this.x.start) / this.x.step;
            var gridCellWidth  = width / cols;
            var gridCellHeight = this.getRowHeight();
            var xZeroOffset = (0 - this.x.start) * (width / (this.x.end - this.x.start));

            var c;
            var y;
            var n;

            // Draw background
            ctx.fillStyle = '#fff';
            ctx.fillRect(originX, originY - height, width, height);

            // Draw Grid
            ctx.beginPath();
            
            // Draw longitudinal grid lines
            for (c = 0; c <= cols; c++) {
                ctx.moveTo(originX + gridCellWidth * c, originY);
                ctx.lineTo(originX + gridCellWidth * c, originY - height);
            }

            // Draw latitudinal grid lines and numbers
            for (y = originY; y >= originY - height; y -= gridCellHeight) {
                ctx.moveTo(originX,         y);
                ctx.lineTo(originX + width, y);
            }

            ctx.lineWidth = this.gridThickness;
            ctx.strokeStyle = this.gridColor;
            ctx.stroke();

            // Draw axis lines
            ctx.beginPath();
            ctx.moveTo(originX, originY);
            ctx.lineTo(originX + width, originY);

            // Draw the y-axis line at x = 0
            ctx.moveTo(originX + xZeroOffset, originY - height);
            ctx.lineTo(originX + xZeroOffset, originY);

            ctx.lineWidth = this.axisThickness;
            ctx.strokeStyle = this.axisColor;
            ctx.stroke();

            // Draw ticks
            var halfTick = this.tickLength / 2;
            
            if (this.x.showNumbers) {
                for (c = 0; c <= cols; c++) {
                    ctx.moveTo(originX + gridCellWidth * c, originY + halfTick);
                    ctx.lineTo(originX + gridCellWidth * c, originY - halfTick);
                }
            }

            if (this.y.showNumbers) {
                var startY = this.y.start;
                var stepY = this.y.step;
                for (y = originY; y >= originY - height; y -= gridCellHeight) {
                    ctx.moveTo(originX + xZeroOffset - halfTick,   y);
                    ctx.lineTo(originX + xZeroOffset + halfTick, y);
                }
            }

            ctx.lineWidth = this.axisThickness;
            ctx.strokeStyle = this.axisColor;
            ctx.stroke();

            // Draw numbers
            ctx.font = this.numberFont;
            ctx.fillStyle = this.axisColor;
            
            if (this.x.showNumbers) {
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                var startX = this.x.start;
                var stepX = this.x.step;

                for (c = 0; c <= cols; c++) {
                    n = startX + (c * stepX);
                    if (this.x.decimals !== undefined)
                        n = n.toFixed(this.x.decimals);
                    ctx.fillText(n, originX + gridCellWidth * c, originY + halfTick);
                }
            }

            if (this.y.showNumbers) {
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                var stepY = this.y.step;
                var yValue = this.y.start;

                for (y = originY; y >= originY - height; y -= gridCellHeight) {
                    n = yValue;
                    if (this.y.decimals !== undefined)
                        n = n.toFixed(this.y.decimals);
                    ctx.fillText(n, originX - halfTick, y);
                    yValue += stepY;
                }
            }

            // Draw axis labels
            ctx.font = this.axisLabelFont;
            ctx.textAlign = 'center';

            var xOffset = originX + width / 2;
            var yOffset;
            if (!this.x.showNumbers) {
                yOffset = this.height - (this.paddingBottom / 2);
                ctx.textBaseline = 'middle';
            }
            else {
                yOffset = this.height - this.axisLabelMargin;
                ctx.textBaseline = 'bottom';
            }
            ctx.fillText(this.x.label, xOffset, yOffset);

            yOffset = originY - height / 2;
            if (!this.y.showNumbers) {
                xOffset = this.paddingLeft / 2;
                ctx.textBaseline = 'middle';
            }
            else {
                xOffset = this.axisLabelMargin;
                ctx.textBaseline = 'top';
            }
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(this.y.label, -yOffset, xOffset);
            ctx.rotate(Math.PI / 2);

            // Draw border
            ctx.beginPath();
            ctx.rect(this.paddingLeft, this.paddingTop, width, height);
            ctx.lineWidth = this.borderThickness;
            ctx.strokeStyle = this.borderColor;
            ctx.stroke();
        },

        drawData: function() {
            if (this.points.length === 0)
                return;

            // Draw the data points
            var ctx = this.ctx;
            var points = this.points;
            var width = this.getGraphWidth();
            var height = this.getGraphHeight();
            var originX = this.paddingLeft;
            var originY = this.paddingTop + height;
            var xToPx = this.getPixelsPerUnitX();
            var yToPx = this.getPixelsPerUnitY();
            var xZeroOffset = (0 - this.x.start) * (width / (this.x.end - this.x.start));

            ctx.globalAlpha = this.lineAlpha;

            if (this.pointsDisjoint) {
                ctx.fillStyle = this.lineColor;
                var twoPi = 2 * Math.PI;
                var r = this.lineThickness / 2;

                for (i = 0; i < this.points.length; i++) {
                    ctx.beginPath();
                    ctx.arc(originX + points[i].x * xToPx + xZeroOffset, originY - points[i].y * yToPx, r, 0, twoPi);
                    ctx.fill();
                }
            }
            else {
                ctx.beginPath();
                ctx.moveTo(originX + points[0].x * xToPx + xZeroOffset, originY - points[0].y * yToPx);

                for (i = 1; i < this.points.length; i++)
                    ctx.lineTo(originX + points[i].x * xToPx + xZeroOffset, originY - points[i].y * yToPx);

                ctx.lineWidth = this.lineThickness;
                ctx.lineJoin = 'round';
                ctx.strokeStyle = this.lineColor;
                ctx.stroke();
            }
            
            ctx.globalAlpha = 1;

            // Draw a circle on the current data point
            var currentPoint = this.points[this.points.length - 1];
            var radius = this.lineThickness;
            ctx.beginPath();
            ctx.arc(originX + currentPoint.x * xToPx + xZeroOffset, originY - currentPoint.y * yToPx, radius, 0, 2 * Math.PI);
            ctx.fillStyle = this.lineColor;
            ctx.fill();
        },

        createPoint: function(x, y) {
            return vectorPool.create().set(x, y);
        },

        destroyPoint: function(point) {
            vectorPool.remove(point);
        },

        clearPoints: function() {
            for (var i = this.points.length - 1; i >= 0; i--) {
                vectorPool.remove(this.points[i]);
                this.points.splice(i, 1);
            }
        },

        getGraphWidth: function() {
            return this.width - this.paddingLeft - this.paddingRight;
        },

        getGraphHeight: function() {
            return this.height - this.paddingTop - this.paddingBottom;
        },

        getPixelsPerUnitX: function() {
            return this.getGraphWidth() / (this.x.end - this.x.start);
        },

        getPixelsPerUnitY: function() {
            var yEnd = this.y.end * this.yScale;
            var pixelsPerUnit = this.getGraphHeight() / yEnd;
            return pixelsPerUnit;
        },

        /**
         * Calculates and returns the height of each grid row based on the zoom
         *   level and the y-axis step size.
         */
        getRowHeight: function() {
            return Math.round(this.getPixelsPerUnitY()) * this.y.step;
        },

        getResolution: function() {
            return window.devicePixelRatio ? window.devicePixelRatio : 1;
        },

        zoomIn: function() {
            var zoom = this.yScale + this.zoomFactor;
            if (zoom <= this.maxZoom) {
                this.yScale = zoom;
                this.draw();
            }
        },

        zoomOut: function() {
            var zoom = this.yScale - this.zoomFactor;
            if (zoom >= this.minZoom) {
                this.yScale = zoom;
                this.draw();
            }
        }

    });


    return GraphView;
});

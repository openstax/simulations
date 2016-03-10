define(function(require) {

    'use strict';

    var $        = require('jquery');
    var _        = require('underscore');
    var Backbone = require('backbone'); Backbone.$ = $;

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
        paddingBottom: 40,

        zoomFactor: 0.2,
        minZoom: 0.2,
        maxZoom: 4,

        initialize: function(options) {
            // Default values
            options = _.extend({
                title: 'Value',

                x: {
                    start: -8,
                    end: 8,
                    step: 2,
                    label: 'X Axis',
                    showNumbers: true
                },
                y: {
                    start: 0,
                    end: 8,
                    step: 2,
                    label: 'Y Axis',
                    showNumbers: true
                },

                width: 240,
                height: 130,

                lineThickness: 5,
                lineColor: '#000',
                gridColor: '#ddd',
                gridThickness: 1,
                borderWidth: 1,
                axisWidth: 2,
                tickLength: 6,
                axisLabelMargin: 4,

                numberFontSize: 10,
                axisLabelFontSize: 14
            }, options);

            this.simulation = options.simulation;

            this.title = options.title;

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
            this.gridColor = options.gridColor;
            this.gridThickness = options.gridThickness * resolution;
            this.borderWidth = options.borderWidth * resolution;
            this.axisWidth = options.axisWidth * resolution;
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

            ctx.lineWidth = this.axisWidth;
            ctx.strokeStyle = this.lineColor;
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

            ctx.lineWidth = this.axisWidth;
            ctx.strokeStyle = this.lineColor;
            ctx.stroke();

            // Draw numbers
            ctx.font = this.numberFont;
            ctx.fillStyle = this.lineColor;
            
            if (this.x.showNumbers) {
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                var startX = this.x.start;
                var stepX = this.x.step;

                for (c = 0; c <= cols; c++)
                    ctx.fillText(startX + (c * stepX), originX + gridCellWidth * c, originY + halfTick);
            }

            if (this.y.showNumbers) {
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                var stepY = this.y.step;
                var yValue = this.y.start;

                for (y = originY; y >= originY - height; y -= gridCellHeight) {
                    ctx.fillText(yValue, originX - halfTick, y);
                    yValue += stepY;
                }
            }

            // Draw axis labels
            ctx.font = this.axisLabelFont;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';

            ctx.fillText(this.x.label, originX + width / 2, this.height - this.axisLabelMargin);

            var yOffset = originY - height / 2;
            ctx.textBaseline = 'top';
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(this.y.label, -yOffset, this.axisLabelMargin);
            ctx.rotate(Math.PI / 2);

            // Draw border
            ctx.beginPath();
            ctx.rect(this.paddingLeft, this.paddingTop, width, height);
            ctx.lineWidth = this.borderWidth;
            ctx.strokeStyle = this.lineColor;
            ctx.stroke();
        },

        drawData: function() {
            // Draw the data points

            // Draw a circle on the current data point
        },

        getGraphWidth: function() {
            return this.width - this.paddingLeft - this.paddingRight;
        },

        getGraphHeight: function() {
            return this.height - this.paddingTop - this.paddingBottom;
        },

        /**
         * Calculates and returns the height of each grid row based on the zoom
         *   level and the y-axis step size.
         */
        getRowHeight: function() {
            var yEnd = this.y.end * this.yScale;
            var numVisibleSteps = Math.floor(yEnd / this.y.step);
            var pixelsPerUnit = Math.round(this.getGraphHeight() / yEnd);
            return pixelsPerUnit * this.y.step;
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

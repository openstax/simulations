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
                    showNumbers: false
                },

                width: 240,
                height: 130,

                centeredOnZero: true,

                lineThickness: 5,
                lineColor: '#000',
                gridColor: '#ddd',
                borderWidth: 1
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

            this.lineThickness = options.lineThickness;
            this.lineColor = options.lineColor;
            this.gridColor = options.gridColor;
            this.borderWidth = options.borderWidth;
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

            var c;
            var y;

            // Draw background
            ctx.fillStyle = '#fff';
            ctx.fillRect(originX, originY - height, width, height);

            // Draw Grid
            ctx.beginPath();
            
            var cols = (this.x.end - this.x.start) / this.x.step;
            var gridCellWidth  = width / cols;
            var gridCellHeight = this.getRowHeight();

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

            ctx.lineWidth = 1;
            ctx.strokeStyle = this.gridColor;
            ctx.stroke();

            // Draw axis lines

                // If we're centered on zero, draw a bold axis line down the center at x=0 too

            // Draw ticks and numbers

            // Draw axis labels


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

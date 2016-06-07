define(function(require) {

    'use strict';

    var $        = require('jquery');
    var _        = require('underscore');
    var Backbone = require('backbone');

    var WavelengthColors = require('common/colors/wavelength');

    var Constants = require('constants');

    var html = require('text!hydrogen-atom/templates/spectrometer.html');
    
    require('less!hydrogen-atom/styles/spectrometer');

    /**
     * 
     */
    var SpectrometerView = Backbone.View.extend({

        className: 'spectrometer-view',

        events: {
            
        },

        paddingLeft: 30,
        paddingRight: 30,
        paddingTop: 6,
        paddingBottom: 34,

        initialize: function(options) {
            // Default values
            options = _.extend({
                width: 240,
                height: 30,
                paddingLeft: 11,
                paddingRight: 11,
                paddingTop: 4,
                paddingBottom: 24,

                pointRadius: 4,
                spectrumThickness: 4,

                minWavelength: Constants.SPECTROMETER_MIN_WAVELENGTH,
                maxWavelength: Constants.SPECTROMETER_MAX_WAVELENGTH,
                invisibleSpectrumColor: '#888',
                uvWidth: 60,
                irWidth: 60,

                labelColor: '#000',
                tickLength: 4,
                tickThickness: 1,
                tickColor: '#fff',

                classificationFontSize: 14,
                wavelengthFontSize: 10
            }, options);

            this.simulation = options.simulation;

            this.elementWidth = options.width;
            this.elementHeight = options.height;

            var resolution = this.getResolution();
            this.width  = options.width  * resolution;
            this.height = options.height * resolution;
            this.paddingLeft   = options.paddingLeft * resolution;
            this.paddingRight  = options.paddingRight * resolution;
            this.paddingTop    = options.paddingTop * resolution;
            this.paddingBottom = options.paddingBottom * resolution;
            this.uvWidth = options.uvWidth * resolution;
            this.irWidth = options.irWidth * resolution;

            this.labelColor = options.labelColor;
            this.tickLength = options.tickLength * resolution;
            this.tickThickness = options.tickThickness * resolution;
            this.tickColor = options.tickColor;

            this.pointRadius = options.pointRadius * resolution;
            this.spectrumThickness = options.spectrumThickness * resolution;

            this.minWavelength = options.minWavelength;
            this.maxWavelength = options.maxWavelength;
            this.invisibleSpectrumColor = options.invisibleSpectrumColor;
            
            this.classificationFont = options.classificationFontSize * resolution + 'px Helvetica Neue';
            this.wavelengthFont = options.wavelengthFontSize * resolution + 'px Helvetica Neue';
        },

        setWidth: function(width) {
            this.elementWidth = width;
            this.width  = width * this.getResolution();
        },

        setHeight: function(height) {
            this.elementHeight = height;
            this.height = height * this.getResolution();
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
            this.canvas = canvas;

            this.draw();

            return this;
        },

        /**
         * Updates the graph
         */
        update: function() {
            
        },

        /**
         * Draws the graph
         */
        draw: function() {
            this.ctx.clearRect(0, 0, this.width, this.height);

            this.drawEmptyGraph();
        },

        drawEmptyGraph: function() {
            var ctx = this.ctx;
            var width = this.getGraphWidth();
            var height = this.getGraphHeight();
            var originX = this.paddingLeft;
            var originY = this.paddingTop + height;
            var spectrumThickness = this.spectrumThickness;
            var textY = originY + 8 * this.getResolution();

            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, this.width, this.height - this.paddingBottom + spectrumThickness);

            var percentage;
            var wavelength;
            var color;
            var uvStop = originX + this.uvWidth;
            var irStart = originX + width - this.irWidth;
            var spectrumWidth = irStart - uvStop;

            // Draw visible spectrum colors
            for (var i = 0; i < spectrumWidth; i++) {
                // Perform linear interpolation
                percentage = i / spectrumWidth;
                wavelength = WavelengthColors.MIN_WAVELENGTH * (1 - percentage) + WavelengthColors.MAX_WAVELENGTH * percentage;

                // Convert wavelength to rgb and apply to fill style
                ctx.fillStyle = WavelengthColors.nmToHex(wavelength);
                ctx.fillRect(uvStop + i, originY, 1, spectrumThickness);
            }

            // Draw UV and IR colors
            ctx.fillStyle = this.invisibleSpectrumColor;
            ctx.fillRect(originX, originY, this.uvWidth, spectrumThickness);
            ctx.fillRect(irStart, originY, this.irWidth, spectrumThickness);

            // Draw ticks
            var tickLength = this.tickLength;
            var tickY0 = originY + spectrumThickness;
            var tickY1 = tickY0 + tickLength;
            var majorTicks = [ WavelengthColors.MIN_WAVELENGTH, 500, 600, 700, WavelengthColors.MAX_WAVELENGTH ];
            var minorTicks = [ 400, 450, 550, 650, 750 ];

            ctx.moveTo(originX, tickY0);
            ctx.lineTo(originX, tickY1);
            ctx.moveTo(originX + width, tickY0);
            ctx.lineTo(originX + width, tickY1);

            var i;
            var percent;
            var x;
            for (i = 0; i < majorTicks.length; i++) {
                percent = (majorTicks[i] - WavelengthColors.MIN_WAVELENGTH) / (WavelengthColors.MAX_WAVELENGTH - WavelengthColors.MIN_WAVELENGTH);
                x = uvStop + percent * spectrumWidth;
                ctx.moveTo(x, tickY0);
                ctx.lineTo(x, tickY1);
            }

            for (i = 0; i < minorTicks.length; i++) {
                percent = (minorTicks[i] - WavelengthColors.MIN_WAVELENGTH) / (WavelengthColors.MAX_WAVELENGTH - WavelengthColors.MIN_WAVELENGTH);
                x = uvStop + percent * spectrumWidth;
                ctx.moveTo(x, tickY0);
                ctx.lineTo(x, tickY1);
            }

            ctx.lineWidth = this.tickThickness;
            ctx.strokeStyle = this.tickColor;
            ctx.stroke();

            // Draw UV and IR labels
            ctx.fillStyle = this.labelColor;
            ctx.font = this.classificationFont;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText('UV', originX + this.uvWidth / 2, textY);
            ctx.fillText('IR', irStart + this.irWidth / 2, textY);

            // Draw numbers
            ctx.font = this.wavelengthFont;
            for (i = 0; i < majorTicks.length; i++) {
                percent = (majorTicks[i] - WavelengthColors.MIN_WAVELENGTH) / (WavelengthColors.MAX_WAVELENGTH - WavelengthColors.MIN_WAVELENGTH);
                x = uvStop + percent * spectrumWidth;
                ctx.fillText(majorTicks[i], x, textY);
            }

            ctx.fillText(this.minWavelength, originX, textY);
            ctx.fillText(this.maxWavelength, originX + width, textY);

            // // Draw numbers
            // ctx.font = this.numberFont;
            // ctx.fillStyle = this.axisColor;
            
            // if (this.x.showNumbers) {
            //     ctx.textAlign = 'center';
            //     ctx.textBaseline = 'top';
            //     var startX = this.x.start;
            //     var stepX = this.x.step;

            //     for (c = 0; c <= cols; c++) {
            //         n = startX + (c * stepX);
            //         if (this.x.decimals !== undefined)
            //             n = n.toFixed(this.x.decimals);
            //         ctx.fillText(n, originX + gridCellWidth * c, originY + halfTick);
            //     }
            // }

            // if (this.y.showNumbers) {
            //     ctx.textAlign = 'right';
            //     ctx.textBaseline = 'middle';
            //     var stepY = this.y.step;
            //     var yValue = this.y.start;

            //     for (y = originY; y >= originY - height; y -= gridCellHeight) {
            //         n = yValue;
            //         if (this.y.decimals !== undefined)
            //             n = n.toFixed(this.y.decimals);
            //         ctx.fillText(n, originX - halfTick, y);
            //         yValue += stepY;
            //     }
            // }

            // // Draw axis labels
            // ctx.font = this.axisLabelFont;
            // ctx.textAlign = 'center';

            // var xOffset = originX + width / 2;
            // var yOffset;
            // if (!this.x.showNumbers) {
            //     yOffset = this.height - (this.paddingBottom / 2);
            //     ctx.textBaseline = 'middle';
            // }
            // else {
            //     yOffset = this.height - this.axisLabelMargin;
            //     ctx.textBaseline = 'bottom';
            // }
            // ctx.fillText(this.x.label, xOffset, yOffset);

            // yOffset = originY - height / 2;
            // if (!this.y.showNumbers) {
            //     xOffset = this.paddingLeft / 2;
            //     ctx.textBaseline = 'middle';
            // }
            // else {
            //     xOffset = this.axisLabelMargin;
            //     ctx.textBaseline = 'top';
            // }
            // ctx.rotate(-Math.PI / 2);
            // ctx.fillText(this.y.label, -yOffset, xOffset);
            // ctx.rotate(Math.PI / 2);

            // // Draw border
            // ctx.beginPath();
            // ctx.rect(this.paddingLeft, this.paddingTop, width, height);
            // ctx.lineWidth = this.borderThickness;
            // ctx.strokeStyle = this.borderColor;
            // ctx.stroke();
        },

        drawPoint: function(x, y, color) {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, this.pointRadius, 0, 2 * Math.PI);
            ctx.fill();
        },

        getGraphWidth: function() {
            return this.width - this.paddingLeft - this.paddingRight;
        },

        getGraphHeight: function() {
            return this.height - this.paddingTop - this.paddingBottom;
        },

        getResolution: function() {
            return window.devicePixelRatio ? window.devicePixelRatio : 1;
        }

    });


    return SpectrometerView;
});

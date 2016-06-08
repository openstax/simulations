define(function(require) {

    'use strict';

    var $        = require('jquery');
    var _        = require('underscore');
    var Backbone = require('backbone');

    var WavelengthColors = require('common/colors/wavelength');

    var SnapshotView = require('hydrogen-atom/views/snapshot');

    var Constants = require('constants');

    var html = require('text!hydrogen-atom/templates/spectrometer.html');
    
    require('less!hydrogen-atom/styles/spectrometer');

    /**
     * 
     */
    var SpectrometerView = Backbone.View.extend({

        className: 'spectrometer-view',

        events: {
            'click .spectrometer-start-btn'    : 'start',
            'click .spectrometer-stop-btn'     : 'stop',
            'click .spectrometer-reset-btn'    : 'reset',
            'click .spectrometer-snapshot-btn' : 'snapshot'
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

                pointRadius: 2,
                spectrumThickness: 4,

                minWavelength: Constants.SPECTROMETER_MIN_WAVELENGTH,
                maxWavelength: Constants.SPECTROMETER_MAX_WAVELENGTH,
                invisibleSpectrumColor: '#888',
                uvWidth: 60,
                irWidth: 60,

                labelColor: '#000',
                tickLength: 4,
                tickThickness: 1,
                tickColor: '#000',

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

            this._stopped = false;
            this.wavelengthCounts = [];
            this.snapshotViews = [];

            this.listenTo(this.simulation, 'atom-added', this.atomAdded);
            this.atomAdded();
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

            this.$startButton = this.$('.spectrometer-start-btn');
            this.$stopButton  = this.$('.spectrometer-stop-btn');
            this.$resetButton = this.$('.spectrometer-reset-btn');

            this.$startButton.hide();

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
        update: function(time, deltaTime) {
            for (var i = 0; i < this.snapshotViews.length; i++)
                this.snapshotViews[i].update(time, deltaTime);
        },

        start: function() {
            this.$startButton.hide();
            this.$stopButton.show();
            this._stopped = false;
        },

        stop: function() {
            this.$stopButton.hide();
            this.$startButton.show();
            this._stopped = true;
        },

        reset: function() {
            this.draw();
        },

        snapshot: function() {
            var modelName = this.simulation.get('experimentSelected') ?
                'Experiment' :
                this.simulation.get('atomicModel').label;
            var title = 'Snapshot ' + (this.snapshotViews.length + 1) + ': ' + modelName;

            var x;
            var y;

            var lastView = this.getLatestVisibleSnapshot();
            if (lastView) {
                x = lastView.position.x - 20;
                y = lastView.position.y - 16;
            }
            else {
                var $spectrometerPanel = $('.spectrometer-panel');
                x = $spectrometerPanel.position().left;
                y = $spectrometerPanel.position().top - 176;    
            }

            var snapshotView = new SnapshotView({
                title: title,
                sourceCanvas: this.canvas,
                dragFrame: $('body')[0],
                position: {
                    x: x,
                    y: y
                }
            });

            $('.sim-view').first().append(snapshotView.el);

            this.snapshotViews.push(snapshotView);
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
        },

        drawPoint: function(wavelength, count) {
            var color = WavelengthColors.nmToHex(wavelength);
            if (color === '#000000')
                color = this.invisibleSpectrumColor;

            var x = this.getWavelengthX(wavelength);
            var y = this.paddingTop + this.getGraphHeight() - count * this.pointRadius * 2;
            var ctx = this.ctx;

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, this.pointRadius, 0, 2 * Math.PI);
            ctx.fill();
        },

        getWavelengthX: function(wavelength) {
            if (wavelength < WavelengthColors.MIN_WAVELENGTH) {
                // UV wavelength
                var m = (wavelength - this.minWavelength) / (WavelengthColors.MIN_WAVELENGTH  - this.minWavelength);
                return this.paddingLeft + (m * this.uvWidth);
            }
            else if (wavelength > WavelengthColors.MAX_WAVELENGTH) {
                // IR wavelength
                var m = (this.maxWavelength - wavelength) / (this.maxWavelength - WavelengthColors.MAX_WAVELENGTH);
                return this.paddingLeft + this.getGraphWidth() - this.irWidth + (m * this.irWidth);
            }
            else {
                // Visible wavelength
                var m = (wavelength - WavelengthColors.MIN_WAVELENGTH) / (WavelengthColors.MAX_WAVELENGTH - WavelengthColors.MIN_WAVELENGTH);
                return this.paddingLeft + this.uvWidth + m * (this.getGraphWidth() - this.irWidth - this.uvWidth);
            }
        },

        getGraphWidth: function() {
            return this.width - this.paddingLeft - this.paddingRight;
        },

        getGraphHeight: function() {
            return this.height - this.paddingTop - this.paddingBottom;
        },

        getResolution: function() {
            return window.devicePixelRatio ? window.devicePixelRatio : 1;
        },

        getLatestVisibleSnapshot: function() {
            for (var i = this.snapshotViews.length - 1; i >= 0; i--) {
                if (!this.snapshotViews[i].closed)
                    return this.snapshotViews[i];
            }
        },

        atomAdded: function() {
            if (this.atom)
                this.stopListening(this.atom);

            this.atom = this.simulation.atom;

            this.listenTo(this.atom, 'photon-emitted',  this.photonEmitted);
        },

        photonEmitted: function(photon) {
            if (!this._stopped) {
                var wavelength = Math.floor(photon.getWavelength());
                
                if (this.wavelengthCounts[wavelength] === undefined)
                    this.wavelengthCounts[wavelength] = 1;
                else
                    this.wavelengthCounts[wavelength] = this.wavelengthCounts[wavelength] + 1;
                
                this.drawPoint(wavelength, this.wavelengthCounts[wavelength]);
            }
        }

    });


    return SpectrometerView;
});

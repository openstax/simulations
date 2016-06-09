define(function(require) {

    'use strict';

    var $        = require('jquery');
    var _        = require('underscore');
    var Backbone = require('backbone');

    var WavelengthColors = require('common/colors/wavelength');

    var Constants = require('constants');

    /**
     * 
     */
    var EnergyDiagramView = Backbone.View.extend({

        className: 'energy-diagram-view',

        initialize: function(options) {
            // Default values
            options = _.extend({
                width: 150,
                height: 290,
                paddingLeft:   24,
                paddingRight:  10,
                paddingTop:    10,
                paddingBottom: 10,

                levelFontSize: 10,
                levelColor: '#000',

                axisLabelFontSize: 14,
                axisColor: '#000',
                axisLineWidth: 2
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
            
            var suffix = 'px Helvetica Neue';
            this.levelFont = options.levelFontSize * resolution + suffix;
            this.levelColor = options.levelColor;
            this.axisLabelFont = options.axisLabelFontSize * resolution + suffix;
            this.axisColor = options.axisColor;
            this.axisLineWidth = options.axisLineWidth * resolution;
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
            this.canvas = document.createElement('canvas');

            this.$el.append(this.canvas);

            return this;
        },

        /**
         * Sizes the canvas and initializes the canvas context
         */
        postRender: function() {
            // Give the canvas its dimensions
            this.canvas.style.width = this.elementWidth + 'px';
            this.canvas.style.height = this.elementHeight + 'px';
            this.canvas.width = this.width;
            this.canvas.height = this.height;

            // Get the canvas context
            this.ctx = this.canvas.getContext('2d');

            this.draw();

            return this;
        },

        /**
         * Updates the graph
         */
        update: function(time, deltaTime) {
            
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
            var resolution = this.getResolution();

            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, this.width, this.height);

            var headWidth  = 10 * resolution;
            var headLength = 12 * resolution;

            ctx.moveTo(originX, originY);
            ctx.lineTo(originX, originY - height + headLength);

            ctx.lineWidth = this.axisLineWidth;
            ctx.strokeStyle = this.axisColor;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(originX - headWidth / 2, originY - height + headLength);
            ctx.lineTo(originX, originY - height);
            ctx.lineTo(originX + headWidth / 2, originY - height + headLength);
            ctx.closePath();
            ctx.fillStyle = this.axisColor;
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


    return EnergyDiagramView;
});

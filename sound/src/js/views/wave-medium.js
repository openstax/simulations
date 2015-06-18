define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var PixiView = require('common/pixi/view');
    var Colors   = require('common/colors/colors');

    var Constants = require('constants');

    /**
     * A view that draws a 2D representation of the wave medium
     */
    var WaveMediumView = PixiView.extend({

        /**
         * Overrides PixiView's initializeDisplayObject function
         */
        initializeDisplayObject: function() {
            this.displayObject = new PIXI.Graphics();
        },

        /**
         * Initializes the new WaveMediumView.
         */
        initialize: function(options) {
            this.color = Colors.parseHex('#888888');
            this.colors = [];
            for (var i = 0; i < 255; i++) {
                this.colors.push(Colors.rgbToHexInteger(i, i, i));
            }

            this.updateMVT(options.mvt);
        },

        /**
         * Draws the amplitudes as rings of different shades of a
         *   color, the different shades representing different
         *   amplitudes.
         */
        drawAmplitudes: function() {
            var graphics = this.displayObject;
            graphics.clear();

            var counterclockwise = false;
            var angle = Math.PI / 4;
            var lineWidth = this.lineWidth;

            var maxX = this.model.getMaxX();
            var amplitude;
            var alphaMultiplier = 1.5;

            for (var i = 0; i < maxX; i++) {
                amplitude = this.model.getAmplitudeAt(i);
                // var colorIndex = Math.min(Math.floor(amplitude * 128) + 226, this.colors.length - 1);
                // var alpha = Math.min(1, Math.pow(100, Math.abs(20 * amplitude)) - 1);
                // graphics.lineStyle(lineWidth, this.colors[colorIndex], 1);
                //graphics.lineStyle(lineWidth, this.color, Math.min(amplitude + 0.5, 1));
                if (amplitude >= 0)
                    graphics.lineStyle(lineWidth, 0xFFFFFF, Math.min(1, amplitude * alphaMultiplier));
                else
                    graphics.lineStyle(lineWidth, 0x333333, Math.min(1, Math.abs(amplitude) * alphaMultiplier));
                //graphics.moveTo(0, 0);
                // We alternate the direction so we don't get lines on one edge
                graphics.arc(0, 0, i * lineWidth, -angle * (counterclockwise ? -1 : 1), angle * (counterclockwise ? -1 : 1), counterclockwise);
                counterclockwise = !counterclockwise;
            }
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.lineWidth = this.mvt.modelToViewDeltaX(Constants.Wavefront.LENGTH_IN_METERS) / Constants.Wavefront.SAMPLE_LENGTH;
        },

        /**
         * Gets called every frame to redraw with new info
         */
        update: function(time, deltaTime, paused) {
            if (!paused)
                this.drawAmplitudes();
        }

    });

    return WaveMediumView;
});
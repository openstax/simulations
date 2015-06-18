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
         * Initializes the new WaveMediumView.
         */
        initialize: function(options) {
            this.darkColor  = Colors.parseHex('#333333');
            this.lightColor = Colors.parseHex('#ffffff');

            this.initGraphics();

            this.updateMVT(options.mvt);
        },

        initGraphics: function() {
            this.graphics = new PIXI.Graphics();
            this.mask = new PIXI.Graphics();

            this.displayObject.addChild(this.graphics);
            this.displayObject.addChild(this.mask);

            this.graphics.mask = this.mask;
        },

        drawMask: function() {
            var length = this.mvt.modelToViewDeltaX(Constants.Wavefront.LENGTH_IN_METERS);
            var startX = this.startX;

            var mask = this.mask;
            mask.clear();
            mask.beginFill(0x000000, 1);
            mask.drawRect(startX, -length / 2, length, length);
            mask.endFill();
        },

        /**
         * Draws the amplitudes as rings of different shades of a
         *   color, the different shades representing different
         *   amplitudes.
         */
        drawAmplitudes: function() {
            var graphics = this.graphics;
            graphics.clear();

            var counterclockwise = false;
            var angle = Math.PI / 4;
            var lineWidth = this.lineWidth;

            var lightColor = this.lightColor;
            var darkColor = this.darkColor;

            var maxX = this.model.getMaxX();
            var amplitude;
            var alphaMultiplier = 1.5;

            var startRadius = this.startX;

            for (var i = 0; i < maxX; i++) {
                amplitude = this.model.getAmplitudeAt(i);

                if (amplitude >= 0)
                    graphics.lineStyle(lineWidth, lightColor, Math.min(1, amplitude * alphaMultiplier));
                else
                    graphics.lineStyle(lineWidth, darkColor, Math.min(1, Math.abs(amplitude) * alphaMultiplier));

                // We alternate the direction so we don't get lines on one edge
                graphics.arc(0, 0, startRadius + i * lineWidth, -angle * (counterclockwise ? -1 : 1), angle * (counterclockwise ? -1 : 1), counterclockwise);
                counterclockwise = !counterclockwise;
            }
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.drawMask();
            this.lineWidth = this.mvt.modelToViewDeltaX(Constants.Wavefront.LENGTH_IN_METERS) / Constants.Wavefront.SAMPLE_LENGTH;
            this.startX = this.mvt.modelToViewDeltaX(Constants.SpeakerView.WIDTH_IN_METERS);
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
define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var PixiView = require('common/v3/pixi/view');
    var Colors   = require('common/v3/colors/colors');
    var Vector2  = require('common/v3/math/vector2');

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

            this.arcCenters = [];
            for (var i = 0; i < Constants.Wavefront.SAMPLE_LENGTH; i++)
                this.arcCenters.push(new Vector2());

            this.origin = new Vector2();
            this.angle = 0;
        },

        drawMask: function() {
            var length = this.mvt.modelToViewDeltaX(Constants.Wavefront.LENGTH_IN_METERS);
            var startX = this.startX;

            var mask = this.mask;
            mask.clear();
            mask.beginFill(0x000000, 1);
            mask.drawRect(startX, -length * 2, length * 2, length * 4);
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
            var startAngle;
            var endAngle;
            var i;

            var lightColor = this.lightColor;
            var darkColor = this.darkColor;

            var amplitude;
            var alphaMultiplier = 1.5;

            var startRadius = this.startX;

            // Advance the centers of the arcs forward
            var arcCenters = this.arcCenters;
            var arcCenter;
            for (i = arcCenters.length - 1; i > Constants.PROPAGATION_SPEED; i--)
                arcCenters[i].set(arcCenters[i - Constants.PROPAGATION_SPEED]);
            for (i = 0; i < 50; i++)
                arcCenters[i].set(this.origin.x, this.origin.y);

            // Draw arcs representing the indexed amplitude values
            for (i = 0; i < Constants.Wavefront.SAMPLE_LENGTH; i++) {
                amplitude = this.model.getAmplitudeAt(i);

                if (amplitude >= 0)
                    graphics.lineStyle(lineWidth, lightColor, Math.min(1, amplitude * alphaMultiplier));
                else
                    graphics.lineStyle(lineWidth, darkColor, Math.min(1, Math.abs(amplitude) * alphaMultiplier));

                // We alternate the direction so we don't get lines on one edge
                startAngle = -angle * (counterclockwise ? -1 : 1);
                endAngle = angle * (counterclockwise ? -1 : 1);
                arcCenter = arcCenters[i];
                graphics.arc(arcCenter.x, arcCenter.y, startRadius + i * lineWidth, startAngle + this.angle, endAngle + this.angle, counterclockwise);
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
        },

        /**
         * Sets the position of the root display object in pixels.
         */
        setPosition: function(x, y) {
            this.origin.x = x;
            this.origin.y = y;
        },

        /**
         * Just a (pseudo) alias for setPosition.
         */
        setOrigin: function(x, y) {
            this.setPosition(x, y);
        },

        /**
         * Returns the origin in screen space
         */
        getOrigin: function() {
            return this.origin;
        },

        /**
         * Sets the angle at which the waves emanate from the origin
         */
        setAngle: function(angle) {
            this.angle = angle;
        },

        /**
         *
         */
        clear: function() {
            for (i = 0; i < this.arcCenters.length; i++)
                this.arcCenters[i].set(this.origin.x, this.origin.y);
            this.update();
        },

        /**
         *
         */
        setMask: function(mask) {
            this.displayObject.mask = mask;
        }

    });

    return WaveMediumView;
});
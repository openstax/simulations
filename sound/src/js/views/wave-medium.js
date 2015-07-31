define(function(require) {

    'use strict';

    var _    = require('underscore');
    var Backbone = require('backbone')
    
    var Colors   = require('common/v3/colors/colors');
    var Vector2  = require('common/v3/math/vector2');

    var Constants = require('constants');

    /**
     * A view that draws a 2D representation of the wave medium
     */
    var WaveMediumView = Backbone.View.extend({

        tagName:   'canvas',
        className: 'wave-medium-canvas',

        /**
         * Initializes the new WaveMediumView.
         */
        initialize: function(options) {
            this.width = options.width;
            this.height = options.height;

            this.darkColor  = Colors.hexToRgb('#333333');
            this.lightColor = Colors.hexToRgb('#ffffff');

            this.el.width  = this.width;
            this.el.height = this.height;

            this.ctx = this.el.getContext('2d');

            this.initCenters();

            this.updateMVT(options.mvt);
        },

        initCenters: function() {
            this.arcCenters = [];
            for (var i = 0; i < Constants.Wavefront.SAMPLE_LENGTH; i++)
                this.arcCenters.push(new Vector2());

            this.origin = new Vector2();
            this.angle = 0;
        },

        drawMask: function() {
            var length = this.mvt.modelToViewDeltaX(Constants.Wavefront.LENGTH_IN_METERS);
            var startX = this.startX;

            var ctx = this.ctx;
            ctx.beginPath();
            ctx.rect(startX, -length * 2, length * 2, length * 4);
            ctx.clip();

            if (this.secondaryMaskFunction)
                this.secondaryMaskFunction(ctx);
        },

        /**
         * Draws the amplitudes as rings of different shades of a
         *   color, the different shades representing different
         *   amplitudes.
         */
        drawAmplitudes: function() {
            var ctx = this.ctx;
            ctx.clearRect(0, 0, this.width, this.height);
            //ctx.lineWidth = Math.ceil(this.lineWidth);

            this.drawMask();

            var counterclockwise = false;
            var angle = Math.PI / 4;
            var lineWidth = this.lineWidth;
            var startAngle;
            var endAngle;
            var radius;
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

                ctx.beginPath();

                if (amplitude >= 0)
                    ctx.strokeStyle = this.toRgbaString(lightColor, Math.min(1, amplitude * alphaMultiplier));
                else if (amplitude < 0)
                    ctx.strokeStyle = this.toRgbaString(darkColor,  Math.min(1, Math.abs(amplitude) * alphaMultiplier));
                else
                    continue;

                startAngle = -angle;
                endAngle = angle;
                arcCenter = arcCenters[i];
                radius = startRadius + i * lineWidth;

                ctx.arc(arcCenter.x, arcCenter.y, radius, startAngle + this.angle, endAngle + this.angle, false);

                ctx.stroke();
            }
        },

        toRgbaString: function(rgbObject, alpha) {
            return 'rgba(' + rgbObject.r +',' + rgbObject.g + ',' + rgbObject.b + ',' + alpha + ')';
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

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

        setSecondaryMaskFunction: function(fn) {
            this.secondaryMaskFunction = fn;
        }

    });

    return WaveMediumView;
});
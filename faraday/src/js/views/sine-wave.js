define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');
    var Colors   = require('common/colors/colors');

    var Constants = require('constants');

    /**
     * SinWaveGraphic is the graphical representation of a sine wave.
     * 
     * A set of line segments is draw to approximate the curve. The curve is
     *   constrained to be drawn within some viewport. The amplitude determines
     *   the height of the curve, while the frequency determines how many
     *   cycles of the curve will be drawn.
     */
    var SineWaveView = PixiView.extend({

        /**
         * Initializes the new SineWaveView.
         */
        initialize: function(options) {
            // Wave must be constrained to this viewport.
            this.viewportWidth = options.viewportWidth;
            this.viewportHeight = options.viewportHeight;
            // Maximum number of cycles to draw.
            this.maxCycles = options.maxCycles || 5;
            // The wave's amplitude.
            this.amplitude = 0;
            // The wave's frequency.
            this.frequency = 0;
            // The angle at the leftmost point on the wave.
            this.startAngle = 0;
            // The angle at the rightmost point on the wave.
            this.endAngle = 0;

            this.lineColor = Colors.parseHex(SineWaveView.LINE_COLOR);
            this.lineWidth = SineWaveView.LINE_WIDTH;

            this.initGraphics();
        },

        initGraphics: function() {
            this.leftGraphics  = new PIXI.Graphics();
            this.rightGraphics = new PIXI.Graphics();

            this.displayObject.addChild(this.leftGraphics);
            this.displayObject.addChild(this.rightGraphics);
        },

        /**
         * Sets the number of cycles that will be displayed when the frequency == 1.0.
         */
        setMaxCycles: function(maxCycles) {
            this.maxCycles = maxCycles;
        },
        
        /**
         * Gets the number of cycles that will be displayed when the frequency == 1.0.
         */
        getMaxCycles: function() {
            return this.maxCycles;
        },
        
        /**
         * Sets the amplitude of the displayed wave.
         */
        setAmplitude: function(amplitude) {
            this.amplitude = amplitude;
        },

        /**
         * Gets the amplitude.
         */
        getAmplitude: function() {
            return this.amplitude;
        },
        
        /**
         * Sets the frequency of the displayed wave.
         */
        setFrequency: function(frequency) {
            this.frequency = frequency;
        },
        
        /**
         * Gets the frequency.
         */
        getFrequency: function() {
            return this.frequency;
        },
        
        /**
         * Gets the start angle, the angle at the leftmost point on the wave.
         * 
         * @return the start angle, in radians
         */
        getStartAngle: function() {
            return this.startAngle;
        },
        
        /**
         * Gets the end angle, the angle at the rightmost point on the wave.
         * 
         * @return the end angle, in radians
         */
        getEndAngle: function() {
            return this.endAngle;
        },

        /**
         * Updates the graphic to match the current paramter settings.  The sine wave is
         *   approximated using a set of line segments. The zero crossing (180 phase) of
         *   the center-most cycle is always at the origin.
         */
        update: function() {
            // Number of wave cycles to fill the viewport at the current frequency.
            var numCycles = this.frequency * this.maxCycles;
            // Change in angle per change in X.
            var deltaAngle = (2 * Math.PI * numCycles) / this.viewportWidth;

            // Start with 180 degree phase angle at (0,0).
            var phaseAngle = Math.PI;
            var leftGraphics = this.leftGraphics;
            var rightGraphics = this.rightGraphics;
            leftGraphics.clear();
            leftGraphics.lineStyle(this.lineWidth, this.lineColor, 1);
            leftGraphics.moveTo(0, 0);
            rightGraphics.clear();
            rightGraphics.lineStyle(this.lineWidth, this.lineColor, 1);
            rightGraphics.moveTo(0, 0);

            // Work outwards in positive and negative X directions.
            var angle = 0;
            for (var x = 1; x <= this.viewportWidth / 2; x++) {
                angle = phaseAngle + (x * deltaAngle);
                var y = this.amplitude * Math.sin(angle) * this.viewportHeight / 2;
                rightGraphics.lineTo(x, -y); // +Y is up
                leftGraphics.lineTo(-x,  y); // +Y is up
            }

            // This is a little workaround for a current Pixi 3 bug:
            if (leftGraphics.currentPath && leftGraphics.currentPath.shape)
                leftGraphics.currentPath.shape.closed = false;
            if (rightGraphics.currentPath && rightGraphics.currentPath.shape)
                rightGraphics.currentPath.shape.closed = false;

            // Make the start & end angle positive values, maintaining phase.
            this.startAngle = ((2 * Math.PI) - (angle % (2 * Math.PI))) % (2 * Math.PI);
            this.endAngle = this.startAngle + (2 * (angle - phaseAngle));
        }

    }, Constants.SineWaveView);


    return SineWaveView;
});
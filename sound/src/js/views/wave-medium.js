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
            this.color = Colors.parseHex('#ff00ff');

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

            var maxX = this.model.getMaxX();

            for (var i = 0; i < maxX; i++) {
                var color = parseInt(this.color * this.model.getAmplitudeAt(i));
                graphics.lineStyle(2, color, 1);
                graphics.arc(25, 300, i, 0, 2 * Math.PI);
            }
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;
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
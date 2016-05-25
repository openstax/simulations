define(function(require) {

    'use strict';

    var PIXI = require('pixi');

                   require('common/v3/pixi/extensions');
    var PixiView = require('common/v3/pixi/view');
    var Colors   = require('common/colors/colors');
    var Vector2  = require('common/math/vector2');

    var Constants = require('constants');

    /**
     * Draws a wave
     */
    var WaveView = PixiView.extend({

        /**
         * Overrides PixiView's initializeDisplayObject function
         */
        initializeDisplayObject: function() {
            this.displayObject = new PIXI.Graphics();
        },

        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;
            this.origin = options.origin;
            this.extent = options.extent;
            this.lambda = options.lambda;
            this.period = options.period;
            this.amplitude = options.amplitude;
            this.tube = options.tube;
            this.color = options.color;
            this.thickness = 2;

            // Steps in x for which each piece-wise segment of the standing wave is computed
            this.dx = 1;
            this.elapsedTime = 0;

            // Cached objects
            this._origin = new Vector2();

            this.updateMVT(options.mvt);
        },

        setColor: function(color) {
            this.color = color;
        },

        setAmplitude: function(amplitude) {
            this.amplitude = amplitude;
        },

        clear: function() {
            this.displayObject.clear();
        },

        draw: function() {
            var extent = this.mvt.modelToViewDeltaX(this.extent);
            this.numPoints = Math.floor(extent / this.dx) + 1;
            this.displayObject.lineStyle(this.thickness, Colors.parseHex(this.color), 1);
        },

        /**
         * Updates the model-view-transform and anything that relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.draw();
        },

        update: function(time, deltaTime, paused) {
            this.elapsedTime += deltaTime;
            
            if (this.simulation.updated()) {
                this.clear();
                if (this.amplitude !== 0)
                    this.draw();
            }
        },

        getMaxInternalAmplitude: function() {
            return Constants.LASING_THRESHOLD;
        }

    });
    
    return WaveView;
});

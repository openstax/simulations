define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView = require('common/pixi/view');
    var Colors   = require('common/colors/colors');

    var Constants = require('constants');

    var LaserBeamView = PixiView.extend({

        /**
         * Overrides PixiView's initializeDisplayObject function
         */
        initializeDisplayObject: function() {
            this.displayObject = new PIXI.Graphics();
        },

        initialize: function(options) {
            this.simulation = options.simulation;

            this.updateMVT(options.mvt);
        },

        draw: function() {
            if (this.simulation.laser.get('wave'))
                this.drawLightWaves();
            else
                this.drawLightRays();
        },

        drawLightRays: function() {
            var rays = this.simulation.rays;

            // Sort rays by zIndex so the lower z-indexes come first
            rays.sort(function(a, b) {
                return a.zIndex - b.zIndex;
            });

            var graphics = this.displayObject;
            graphics.clear();

            var beamWidth = LaserBeamView.LASER_BEAM_WIDTH;

            // For each LightRay instance:
                // Set our line color to its color
                // Draw a line between its endpoints
            var point;
            for (var i = 0; i < rays.length; i++) {
                graphics.lineStyle(beamWidth, Constants.wavelengthToHex(rays[i].getLaserWavelength(), true), Math.sqrt(rays[i].getPowerFraction()));
                point = this.mvt.modelToView(rays[i].getTip());
                graphics.moveTo(point.x, point.y);
                point = this.mvt.modelToView(rays[i].getTail());
                graphics.lineTo(point.x, point.y);
            }
        },

        drawLightWaves: function() {
            var rays = this.simulation.rays;

            // Sort rays by zIndex so the lower z-indexes come first
            rays.sort(function(a, b) {
                return a.zIndex - b.zIndex;
            });

            var graphics = this.displayObject;
            graphics.clear();

            // The original Java version seems to have a gradient fill function that can repeat a
            //   linear gradient ("cyclic" option).  We don't have that, so we need to come up
            //   with another way of doing it.
            //
            // Options:
            //   1) We could break up each line into lines that are the length of one period and create
            //      separate gradients for each segments.
            //   2) We could create one big gradient where we calculate the size of the color stops
            //      relative to the total length of the line and then just draw one line.
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.draw();
        }

    }, Constants.LaserBeamView);

    return LaserBeamView;
});
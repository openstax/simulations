define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView  = require('common/pixi/view');
    var Colors    = require('common/colors/colors');
    var Vector2   = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');

    var Constants = require('constants');

    var LaserBeamView = PixiView.extend({

        initialize: function(options) {
            this.simulation = options.simulation;

            this.width = options.stageWidth;
            this.height = options.stageHeight;
            this.viewportRect = new Rectangle(0, 0, this.width, this.height);
            this.maxLineLength = (this.width > this.height) ? this.width : this.height;

            this.raysGraphics = new PIXI.Graphics();
            this.wavesSprite = new PIXI.Sprite();

            this.displayObject.addChild(this.raysGraphics);
            this.displayObject.addChild(this.wavesSprite);

            // create a regular canvas
            this.wavesCanvas = document.createElement('canvas');
            this.wavesCanvas.width = this.width;
            this.wavesCanvas.height = this.height;
            this.wavesContext = this.wavesCanvas.getContext("2d");

            // Cached objects
            this._point0 = new Vector2();
            this._point1 = new Vector2();
            this._vector = new Vector2();
            this._checkVec = new Vector2();

            this.updateMVT(options.mvt);
        },

        draw: function() {
            if (this.simulation.laser.get('wave')) {
                this.wavesSprite.visible = true;
                this.raysGraphics.visible = false;
                this.drawLightWaves();
            }
            else {
                this.wavesSprite.visible = false;
                this.raysGraphics.visible = true;
                this.drawLightRays();
            }
        },

        drawLightRays: function() {
            var rays = this.simulation.rays;

            // Sort rays by zIndex so the lower z-indexes come first
            rays.sort(function(a, b) {
                return a.zIndex - b.zIndex;
            });

            var graphics = this.raysGraphics;
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

            // The original Java version seems to have a gradient fill function that can repeat a
            //   linear gradient ("cyclic" option).  We don't have that, so we need to come up
            //   with another way of doing it.
            //
            // Options:
            //   1) We could break up each line into lines that are the length of one period and create
            //      separate gradients for each segments.
            //   2) We could create one big gradient where we calculate the size of the color stops
            //      relative to the total length of the line and then just draw one line.

            var ctx = this.wavesContext;
            var p0 = this._point0;
            var p1 = this._point1;
            var vector = this._vector;

            ctx.clearRect(0, 0, this.wavesCanvas.width, this.wavesCanvas.height);

            for (var i = 0; i < rays.length; i++) {
                // Get the endpoints of the ray in view coordinates
                this.getRayEndpoints(rays[i], p0, p1);

                // Get the vector from p0 to p1
                vector.set(p1).sub(p0);

                // Get the length of one period in view coordinates
                var wavelength = this.mvt.modelToViewDeltaX(rays[i].getWavelength());

                // Find the number of waves (periods) in the line
                var periods = vector.length() / wavelength;
                var wholePeriods = Math.ceil(periods);

                // Make vector extend past p1 to a length that would cover all periods fully
                vector.scale(wholePeriods / periods);

                var beamColor = this.rgbaFromRay(rays[i]);
                var black = 'rgba(0, 0, 0, ' + this.alphaFromRay(rays[i]) + ')';

                var gradient = ctx.createLinearGradient(p0.x, p0.y, p0.x + vector.x, p0.y + vector.y);

                var percentForOnePeriod = 1 / wholePeriods;
                for (var p = 0; p < wholePeriods; p++) {
                    gradient.addColorStop(percentForOnePeriod * p,         black);
                    gradient.addColorStop(percentForOnePeriod * (p + 0.5), beamColor);
                }
                gradient.addColorStop(1, black);
                
                ctx.strokeStyle = gradient;
                ctx.lineWidth = this.mvt.modelToViewDeltaX(rays[i].getWaveWidth());

                ctx.beginPath();
                ctx.moveTo(p0.x, p0.y);
                ctx.lineTo(p1.x, p1.y);
                ctx.stroke();
            }

            // Render it to a texture to apply to the sprite
            var canvasTexture = PIXI.Texture.fromCanvas(this.wavesCanvas);
            this.wavesSprite.setTexture(canvasTexture);
        },

        rgbaFromRay: function(ray) {
            return Constants.wavelengthToRgba(
                ray.getLaserWavelength(), 
                this.alphaFromRay(ray)
            );
        },

        alphaFromRay: function(ray) {
            return Math.sqrt(ray.getPowerFraction()).toFixed(4);
        },

        /**
         * Converts ray's endpoints to view space and restricts them to the viewport.
         *   Returns false if no endpoint is within the viewport (roughly).
         */
        getRayEndpoints: function(ray, p0, p1) {
            var vec = this._checkVec;

            p0.set(this.mvt.modelToView(ray.getTip()));
            p1.set(this.mvt.modelToView(ray.getTail()));

            if (!this.pointVisible(p0) && !this.pointVisible(p1)) {
                // The line isn't visible at all, so don't draw it.
                return false;
            }
            else if (!this.pointVisible(p0)) {
                vec.set(p0).sub(p1);
                vec.scale(this.maxLineLength / vec.length());
                p0.set(p1.x + vec.x, p1.y + vec.y);
            }
            else if (!this.pointVisible(p1)) {
                vec.set(p1).sub(p0);
                vec.scale(this.maxLineLength / vec.length());
                p1.set(p0.x + vec.x, p0.y + vec.y);
            }

            return true;
        },

        pointVisible: function(point) {
            return this.viewportRect.contains(point);
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
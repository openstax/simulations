define(function(require) {

    'use strict';

    var PIXI       = require('pixi');
    var ClipperLib = require('clipper-lib');
    
    var PixiView  = require('common/v3/pixi/view');
    var Colors    = require('common/colors/colors');
    var Vector2   = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');

    var Constants = require('constants');

    var LaserBeamsView = PixiView.extend({

        initialize: function(options) {
            this.simulation = options.simulation;

            this.width = options.stageWidth;
            this.height = options.stageHeight;
            this.viewportRect = new Rectangle(0, 0, this.width, this.height);
            this.maxLineLength = (this.width > this.height) ? this.width : this.height;
            var m = 100;
            this.viewportClippingRect = new Rectangle(-m, -m, this.width + m * 2, this.height + m * 2);

            this.initGraphics();
            this.initWavesCanvas();
            this.initClipper();

            // Cached objects
            this._point0 = new Vector2();
            this._point1 = new Vector2();
            this._vector = new Vector2();
            this._checkVec = new Vector2();
            this._phaseOffset = new Vector2();

            this.updateMVT(options.mvt);
        },

        initGraphics: function() {
            this.raysGraphics = new PIXI.Graphics();
            this.wavesSprite = new PIXI.Sprite();

            this.displayObject.addChild(this.raysGraphics);
            this.displayObject.addChild(this.wavesSprite);
        },

        initWavesCanvas: function() {
            this.wavesCanvas = document.createElement('canvas');
            this.wavesCanvas.width = this.width;
            this.wavesCanvas.height = this.height;
            this.wavesContext = this.wavesCanvas.getContext("2d");
        },

        initClipper: function() {
            this._beamVec = new Vector2();
            this._endExtension = new Vector2();

            this.beamCorner0 = new Vector2();
            this.beamCorner1 = new Vector2();
            this.beamCorner2 = new Vector2();
            this.beamCorner3 = new Vector2();
            this.beamSubjectPath = [];
            this.beamClipPath = [];
            this.beamSolutionPaths = [];

            // Both the subject path and clip path have 4 points
            for (var i = 0; i < 4; i++) {
                this.beamSubjectPath.push({ X: 0, Y: 0 });
                this.beamClipPath.push({ X: 0, Y: 0 });
            }

            this.beamClipper = new ClipperLib.Clipper();
            
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

            var beamWidth = LaserBeamsView.LASER_BEAM_WIDTH;

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

                // Create the gradient
                var beamColor = this.rgbaFromRay(rays[i]);
                var black = 'rgba(0, 0, 0, ' + this.alphaFromRay(rays[i]) + ')';

                // The problem with translating the code for phase offsets from the original
                //   is that they have the cyclical gradients which automatically handle 
                //   repeating, so it doesn't matter where the offset is.  They use huge
                //   offsets that go off the screen, but we need to start at the right place.
                var partialPeriodOffset = (rays[i].getPhaseOffset() % (2 * Math.PI)) / (2 * Math.PI);
                var phaseOffset = this._phaseOffset
                    .set(vector)
                    .normalize()
                    .scale(this.mvt.modelToViewDeltaX((partialPeriodOffset - 1) * rays[i].getWavelength()));
                //console.log(partialPeriodOffset, this.mvt.modelToViewDeltaX(-partialPeriodOffset * rays[i].getWavelength()));
                var x0 = p0.x + phaseOffset.x;
                var y0 = p0.y + phaseOffset.y;
                var gradient = ctx.createLinearGradient(x0, y0, x0 + vector.x, y0 + vector.y);

                var percentForOnePeriod = 1 / wholePeriods;
                for (var p = 0; p < wholePeriods; p++) {
                    gradient.addColorStop(percentForOnePeriod * p,         black);
                    gradient.addColorStop(percentForOnePeriod * (p + 0.5), beamColor);
                }
                gradient.addColorStop(1, black);
                
                ctx.fillStyle = gradient;

                // Calculate and apply the wave shape
                var paths = this.getWaveShape(rays[i], p0, p1);
                var polygon = paths[0];
                
                if (polygon && polygon.length) {
                    ctx.beginPath();
                    ctx.moveTo(polygon[0].X, polygon[0].Y);
                    for (var j = 1; j < polygon.length; j++) {
                        ctx.lineTo(polygon[j].X, polygon[j].Y);
                    }
                    ctx.closePath();
                    ctx.fill();
                }
            }

            // Render it to a texture to apply to the sprite
            var canvasTexture = PIXI.Texture.fromCanvas(this.wavesCanvas);
            this.wavesSprite.texture = canvasTexture;
            this.wavesSprite.texture.baseTexture.update();
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

            var line = ray.extendBackwards ? ray.getExtendedLineBackwards() : ray.getExtendedLine();

            p0.set(this.mvt.modelToView(line.start));
            p1.set(this.mvt.modelToView(line.end));

            var points;

            // Clip any points that go off the screen
            if (!this.pointVisible(p0) && !this.pointVisible(p1)) {
                points = this.viewportClippingRect.lineIntersectionPoints(p0.x, p0.y, p1.x, p1.y);
                
                var dist00 = points[0].distance(p0);
                var dist01 = points[0].distance(p1);

                if (dist00 < dist01) {
                    p0.set(points[0]);
                    p1.set(points[1]);
                }
                else {
                    p0.set(points[1]);
                    p1.set(points[0]);
                }
            }
            else if (!this.pointVisible(p0)) {
                points = this.viewportClippingRect.lineIntersectionPoints(p0.x, p0.y, p1.x, p1.y);
                p0.set(points[0]);
            }
            else if (!this.pointVisible(p1)) {
                points = this.viewportClippingRect.lineIntersectionPoints(p0.x, p0.y, p1.x, p1.y);
                p1.set(points[0]);
            }
        },

        pointVisible: function(point) {
            return this.viewportRect.contains(point);
        },

        /**
         * Calculates the wave shape from a LightRay instance as a series
         *   of points that create a polygon that should be filled in.
         */
        getWaveShape: function(ray, p0, p1) {
            this.initBeamShape(ray, p0, p1);
            this.initClippingShape(ray);
            this.cutBeamShape(ray);

            return this.beamSolutionPaths;
        },

        setWavePathPoint: function(i, x, y) {
            this.beamSubjectPath[i].X = x;
            this.beamSubjectPath[i].Y = y;
        },

        setOppositeMediumPathPoint: function(i, x, y) {
            this.beamClipPath[i].X = this.mvt.modelToViewX(x);
            this.beamClipPath[i].Y = this.mvt.modelToViewY(y);
        },

        /**
         * Sets up the clip path with data from the oppositeMediumShape.
         */
        initClippingShape: function(ray) {
            // It's a rectangle, so just set the four corners
            var rect = ray.oppositeMediumShape;

            this.setOppositeMediumPathPoint(0, rect.left(),  rect.top());
            this.setOppositeMediumPathPoint(1, rect.right(), rect.top());
            this.setOppositeMediumPathPoint(2, rect.right(), rect.bottom());
            this.setOppositeMediumPathPoint(3, rect.left(),  rect.bottom());
        },

        /**
         * Sets up the subject path to represent the original beam.
         */
        initBeamShape: function(ray, p0, p1) {
            // We need to extend both ends a bit for drawing purposes
            var beamWidth = this.mvt.modelToViewDeltaX(ray.getWaveWidth());
            if (beamWidth > this.maxLineLength)
                beamWidth = this.maxLineLength;

            var beamVec = this._beamVec.set(p1).sub(p0);
            var beamLength = beamVec.length();
            var angle = beamVec.angle();

            // Set some points up as the corners of the rectangle that represents
            //   the beam as if it were at (0, 0) and pointing to the right.
            this.beamCorner0.set(0,          -beamWidth / 2);
            this.beamCorner1.set(beamLength, -beamWidth / 2);
            this.beamCorner2.set(beamLength,  beamWidth / 2);
            this.beamCorner3.set(0,           beamWidth / 2);

            // Rotate and then translate the points
            
            this.beamCorner0.rotate(angle).add(p0.x, p0.y);
            this.beamCorner1.rotate(angle).add(p0.x, p0.y);
            this.beamCorner2.rotate(angle).add(p0.x, p0.y);
            this.beamCorner3.rotate(angle).add(p0.x, p0.y);

            // Then put them in the clipper subject and convert to view coordinates
            this.setWavePathPoint(0, this.beamCorner0.x, this.beamCorner0.y);
            this.setWavePathPoint(1, this.beamCorner1.x, this.beamCorner1.y);
            this.setWavePathPoint(2, this.beamCorner2.x, this.beamCorner2.y);
            this.setWavePathPoint(3, this.beamCorner3.x, this.beamCorner3.y);
        },

        /**
         * The wave is wider than the ray and must be clipped against the opposite
         *   medium so it doesn't leak over.
         */
        cutBeamShape: function() {
            // ClipperLib only supports integers, so we need to scale everything up by a lot and then back down
            ClipperLib.JS.ScaleUpPath(this.beamSubjectPath, LaserBeamsView.CLIPPER_COORDINATE_SCALE);
            ClipperLib.JS.ScaleUpPath(this.beamClipPath,    LaserBeamsView.CLIPPER_COORDINATE_SCALE);

            this.beamClipper.Clear();
            this.beamClipper.AddPath(this.beamSubjectPath, ClipperLib.PolyType.ptSubject, true);
            this.beamClipper.AddPath(this.beamClipPath,    ClipperLib.PolyType.ptClip,    true);

            var succeeded = this.beamClipper.Execute(
                ClipperLib.ClipType.ctDifference, 
                this.beamSolutionPaths, 
                ClipperLib.PolyFillType.pftNonZero, 
                ClipperLib.PolyFillType.pftNonZero
            );

            // Scale the solution back down
            ClipperLib.JS.ScaleDownPaths(this.beamSolutionPaths, LaserBeamsView.CLIPPER_COORDINATE_SCALE);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.draw();
        }

    }, Constants.LaserBeamsView);

    return LaserBeamsView;
});
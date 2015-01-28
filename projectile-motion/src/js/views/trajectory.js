define(function(require) {

    'use strict';
    
    var PIXI = require('pixi');

    var PixiView = require('common/pixi/view');
    var Vector2  = require('common/math/vector2');
    var Colors   = require('common/colors/colors');

    var Projectile = require('models/projectile');

    var Assets = require('assets');

    var Constants = require('constants');

    var RADIANS_TO_DEGREES = 180 / Math.PI;
    var AIR_RESISTANCE_ENABLED_COLOR  = Colors.parseHex(Constants.TrajectoryView.AIR_RESISTANCE_ENABLED_COLOR);
    var AIR_RESISTANCE_DISABLED_COLOR = Colors.parseHex(Constants.TrajectoryView.AIR_RESISTANCE_DISABLED_COLOR);
    var SECOND_MARKER_COLOR = Colors.parseHex(Constants.TrajectoryView.SECOND_MARKER_COLOR);

    var TrajectoryView = PixiView.extend({

        initialize: function(options) {
            this.mvt = options.mvt;
            this.times = [];
            this.xPoints = [];
            this.yPoints = [];
            this.airResistanceHistory = [];
            this.secondMarksX = [];
            this.secondMarksY = [];

            this.initGraphics();

            this.listenTo(this.model, 'change:time', this.recordState);

            this.updateMVT(this.mvt);
        },

        /**
         * Override this to draw different kinds of projectiles.
         */
        initGraphics: function() {
            this.graphics = new PIXI.Graphics();

            this.times.push(0);
            this.xPoints.push(this.model.x); 
            this.yPoints.push(this.model.y);
            this.airResistanceHistory.push(this.model.get('airResistanceEnabled'));

            this.drawTrajectoryPath();

            this.displayObject.addChild(this.graphics);
        },

        recordState: function(trajectory, time) {
            var lastTime = this.times[this.times.length - 1];

            this.times.push(time);
            this.xPoints.push(this.model.x);
            this.yPoints.push(this.model.y);
            this.airResistanceHistory.push(this.model.get('airResistanceEnabled'));

            // See if we just rolled over a second mark
            if (Math.floor(lastTime) !== Math.floor(time)) {
                /* We know we just rolled over a second mark because
                 *   the last time rounds down to a different integer
                 *   than our current time.  Now we can use linear
                 *   interpolation to estimate the position (x, y) of
                 *   the projectile when the time was ON the second.
                 */
                var alpha = (Math.floor(time) - lastTime) / (time - lastTime);
                var lastX = this.xPoints[this.xPoints.length - 2];
                var lastY = this.yPoints[this.yPoints.length - 2];
                var currX = this.xPoints[this.xPoints.length - 1];
                var currY = this.yPoints[this.yPoints.length - 1];
                this.secondMarksX.push((1 - alpha) * lastX + alpha * currX);
                this.secondMarksY.push((1 - alpha) * lastY + alpha * currY);
            }

            this.drawTrajectoryPath();
        },

        drawTrajectoryPath: function() {
            var graphics = this.graphics;
            graphics.clear();
            graphics.moveTo(
                this.mvt.modelToViewX(this.xPoints[0]), 
                this.mvt.modelToViewY(this.yPoints[0])
            );

            var airResistanceEnabled;
            var airResistanceHistory = this.airResistanceHistory;
            var xPoints = this.xPoints;
            var yPoints = this.yPoints;
            for (var i = 1; i < this.xPoints.length; i++) {
                if (airResistanceEnabled !== airResistanceHistory[i]) {
                    airResistanceEnabled = airResistanceHistory[i];
                    if (airResistanceEnabled)
                        this.graphics.lineStyle(TrajectoryView.LINE_WIDTH, AIR_RESISTANCE_ENABLED_COLOR, 1);
                    else
                        this.graphics.lineStyle(TrajectoryView.LINE_WIDTH, AIR_RESISTANCE_DISABLED_COLOR, 1);
                }

                graphics.lineTo(
                    this.mvt.modelToViewX(xPoints[i]),
                    this.mvt.modelToViewY(yPoints[i])
                );
            }

            this.markSeconds();
        },

        markSeconds: function() {
            var graphics = this.graphics;
            var radius = TrajectoryView.SECOND_MARKER_WIDTH / 2;
            var x;
            var y;

            graphics.lineStyle(TrajectoryView.SECOND_MARKER_LINE_WIDTH, SECOND_MARKER_COLOR, TrajectoryView.SECOND_MARKER_ALPHA);
            for (var i = 0; i < this.secondMarksX.length; i++) {
                x = this.mvt.modelToViewX(this.secondMarksX[i]);
                y = this.mvt.modelToViewY(this.secondMarksY[i]);
                graphics.moveTo(x - radius, y);
                graphics.lineTo(x + radius, y);
                graphics.moveTo(x, y - radius);
                graphics.lineTo(x, y + radius);
            }
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.drawTrajectoryPath();
        }

    }, Constants.TrajectoryView);

    return TrajectoryView;
});
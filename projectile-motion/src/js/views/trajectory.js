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

    var TrajectoryView = PixiView.extend({

        initialize: function(options) {
            this.mvt = options.mvt;
            this.xPoints = [];
            this.yPoints = [];
            this.airResistanceHistory = [];

            this.initGraphics();

            this.listenTo(this.model, 'change:time', this.updateGraphics);

            this.updateMVT(this.mvt);
        },

        /**
         * Override this to draw different kinds of projectiles.
         */
        initGraphics: function() {
            this.graphics = new PIXI.Graphics();

            this.xPoints.push(this.model.x); 
            this.yPoints.push(this.model.y);
            this.airResistanceHistory.push(this.model.get('airResistanceEnabled'));

            this.drawTrajectoryPath();

            this.displayObject.addChild(this.graphics);
        },

        updateGraphics: function() {
            this.xPoints.push(this.model.x);
            this.yPoints.push(this.model.y);
            this.airResistanceHistory.push(this.model.get('airResistanceEnabled'));

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
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.drawTrajectoryPath();
        }

    }, Constants.TrajectoryView);

    return TrajectoryView;
});
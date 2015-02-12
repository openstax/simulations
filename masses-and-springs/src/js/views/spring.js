
define(function(require) {

    'use strict';

    // var PIXI = require('pixi');
    var PIXI = require('common/pixi/extensions');

    
    var PixiView = require('common/pixi/view');
    var Colors   = require('common/colors/colors');
    // var Vector2  = require('common/math/vector2');
    var PiecewiseCurve = require('common/math/piecewise-curve');

    var Assets = require('assets');

    var Constants = require('constants');

    /**
     * A view that represents a movable target model
     */
    var Spring = PixiView.extend({

        initialize: function(options) {
            this.mvt = options.mvt;

            this.sceneWidth = options.sceneWidth;
            this.sceneHeight = options.sceneHeight;

            this.scaleSpring();
            this.initGraphics();

            this.updateMVT(this.mvt);

            this.listenTo(this.model, 'change:y2', this.animateSpring);
            this.listenTo(this.model, 'change:k', this.animateSpring);
        },

        animateSpring: function(){
            this.scaleSpring();
            this.graphics.clear();

            this.drawSpring();
        },

        initGraphics: function() {
            this.graphics = new PIXI.Graphics();
            this.drawSpring();
            this.displayObject.addChild(this.graphics);
        },

        scaleSpring: function(){
            this.model.scaled = _.clone(this.model);

            this.model.scaled.x = this.model.scaled.x * this.sceneWidth;
            this.model.scaled.y1 = this.model.scaled.y1 * this.sceneHeight;
            this.model.scaled.y2 = this.model.scaled.y2 * this.sceneHeight;
            this.model.scaled.restL = this.model.scaled.restL * this.sceneHeight;
            this.model.scaled.thickness = this.model.scaled.k * Constants.SpringDefaults.THICKNESS_FACTOR;
        },

        drawSpring: function(){

            var points = this.makeCoilPoints();
            var curve = new PiecewiseCurve();

            // set a fill and line style
            this.graphics.lineStyle(this.model.scaled.thickness, Colors.parseHex(Constants.SpringDefaults.COLOR), 1);

            // draw curves for spring
            _.each(points, function(point, iter){
                if (iter === 0){
                    curve.moveTo.apply(curve, point);
                }else if (point.length > 4){
                    curve.curveTo.apply(curve, point);
                }else{
                    curve.lineTo.apply(curve, point);
                }
            }, this);

            this.graphics.drawPiecewiseCurve(curve, 0, 0);

        },

        makeCoilPoints: function(){

            var points = [];
            var coilCount = 0;

            this.makeCoilRing(points, this.model.scaled.x, this.model.scaled.y1);

            while(coilCount < Constants.SpringDefaults.COILS){
                this.makeBezierCoilPoint(points, this.model.scaled.x, this.model.scaled.y1 + 2 * Constants.SpringDefaults.RING_RADIUS, coilCount);
                coilCount ++;
            }

            this.makeCoilClose(points);

            return points;
        },

        makeCoilRing: function(points, x, y){

            var radius = Constants.SpringDefaults.RING_RADIUS;

            x = x - radius;
            y = y + 2 * radius;

            points.push([
                x + radius, y
            ]);
            points.push([
                x + (2 * radius), y,
                x + (2 * radius), y - (1.5 * radius),
                x + radius, y - (1.5 * radius)
            ]);
            points.push([
                x, y - (1.5 * radius),
                x, y,
                x + radius, y
            ]);
        },

        makeBezierCoilPoint: function(points, x, y, coilCount){
            var fromCenter = Constants.SpringDefaults.WIDTH/2;
            var coilHeight = (this.model.scaled.y2 - this.model.scaled.y1 - 3 * Constants.SpringDefaults.RING_RADIUS) / Constants.SpringDefaults.COILS;

            points.push([
                x, y + (coilCount + 0.25) * coilHeight,
                x + fromCenter, y + (coilCount + 0.25) * coilHeight,
                x + fromCenter, y + (coilCount + 0.5) * coilHeight
            ]);
            points.push([
                x, y + (coilCount + 0.75) * coilHeight,
                x - fromCenter, y + (coilCount + 0.75) * coilHeight,
                x - fromCenter, y + (coilCount + 1) * coilHeight
            ]);
        },

        makeCoilClose: function(points){
            points[points.length - 1] = [this.model.scaled.x, this.model.scaled.y2 - Constants.SpringDefaults.RING_RADIUS];
            points[points.length] = [this.model.scaled.x, this.model.scaled.y2];
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            // this.updatePosition();
            this.drawSpring();
        }

    });

    return Spring;
});

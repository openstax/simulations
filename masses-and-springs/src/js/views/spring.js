
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

    // TODO pull this out.
    var h = 620;

    /**
     * A view that represents a movable target model
     */
    var Spring = PixiView.extend({

        initialize: function(options) {
            this.mvt = options.mvt;

            this.initGraphics();

            // this.listenTo(this.model, 'change:state', this.updateState);

            this.updateMVT(this.mvt);
        },

        initGraphics: function() {
            this.graphics = new PIXI.Graphics();
            this.drawSpring();
            this.displayObject.addChild(this.graphics);
        },

        drawSpring : function(){

            var points = this.makeCoilPoints();
            var curve = new PiecewiseCurve();

            // set a fill and line style
            this.graphics.lineStyle(3, Colors.parseHex(Constants.SpringDefaults.COLOR), 1);

            // draw a shape
            _.each(points, function(point, iter){
                if(iter === 0){
                    curve.moveTo.apply(curve, point);
                }else if(point.length == 6){
                    curve.curveTo.apply(curve, point);
                }else{
                    curve.lineTo.apply(curve, point);
                }
            }, this);

            this.graphics.drawPiecewiseCurve(curve, 0, 0);

        },

        makeCoilPoints: function(){
            var points = [];
            var fromCenter = Constants.SpringDefaults.WIDTH/2;
            var coilHeight = this.model.restL * h / Constants.SpringDefaults.COILS;
            var coilCount = 0;
            var ringRadius = 10;

            this.makeCoilRing(points, this.model.x - ringRadius, this.model.y1 + 0.5 * ringRadius, ringRadius);

            while(coilCount <= Constants.SpringDefaults.COILS){
                this.makeBezierCoilPoint(points, this.model.x, this.model.y1, fromCenter, coilCount, coilHeight);
                coilCount ++;
            }

            points[points.length - 1] = [this.model.x, this.model.y1 + coilHeight * (coilCount - 0.5)];
            points[points.length] = [this.model.x, this.model.y1 + coilHeight * coilCount];

            return points;
        },

        makeCoilRing: function(points, x, y, radius){
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

        makeBezierCoilPoint: function(points, x, y, fromCenter, coilCount, coilHeight){
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

        updateMVT: function(mvt) {
            this.mvt = mvt;

            // this.updatePosition();
            this.drawSpring();
        }

    });

    return Spring;
});

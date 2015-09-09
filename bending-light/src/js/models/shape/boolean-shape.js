define(function (require) {

    'use strict';

    var _          = require('underscore');
    var ClipperLib = require('clipper-lib');

    var PiecewiseCurve = require('common/math/piecewise-curve');
    var Vector2        = require('common/math/vector2');

    var Shape = require('models/shape');

    var CLIPPER_SCALE = 1e13;

    /**
     * Base class for composite shapes that use boolean logic
     */
    var BooleanShape = function() {
        Shape.apply(this, arguments);
    };

    /**
     * Instance functions/properties
     */
    _.extend(BooleanShape.prototype, Shape.prototype, {

        clipPiecewiseCurves: function(aCurve, bCurve, clipperClipType) {
            var aPath = this.piecewiseCurveToClipperPath(aCurve);
            var bPath = this.piecewiseCurveToClipperPath(bCurve);
            var solutionPaths = [];

            var clipper = new ClipperLib.Clipper();
            clipper.AddPath(aPath, ClipperLib.PolyType.ptSubject, true);
            clipper.AddPath(bPath, ClipperLib.PolyType.ptClip,    true);

            var succeeded = clipper.Execute(
                clipperClipType, 
                solutionPaths, 
                ClipperLib.PolyFillType.pftNonZero, 
                ClipperLib.PolyFillType.pftNonZero
            );

            if (succeeded)
                return this.clipperPathToPiecewiseCurve(solutionPaths[0]);
            else
                console.error('Clipper difference failed! Paths: ', aPath, bPath);
        },

        piecewiseCurveToClipperPath: function(piecewiseCurve) {
            var X = piecewiseCurve.xPoints;
            var Y = piecewiseCurve.yPoints;
            var path = [];

            for (var i = 0; i < piecewiseCurve.length(); i++) {
                path.push({
                    X: X[i],
                    Y: Y[i]
                });
            }

            ClipperLib.JS.ScaleUpPath(path, CLIPPER_SCALE);

            return path;
        },

        clipperPathToPiecewiseCurve: function(clipperPath) {
            ClipperLib.JS.ScaleDownPath(clipperPath, CLIPPER_SCALE);

            var points = [];

            for (var i = 0; i < clipperPath.length; i++) {
                points.push(new Vector2(
                    clipperPath[i].X, 
                    clipperPath[i].Y
                ));
            }

            return PiecewiseCurve.fromPoints(points, false);
        }

    });

    return BooleanShape;
});

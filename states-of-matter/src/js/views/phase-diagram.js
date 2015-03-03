define(function(require) {

    'use strict';

    var _ = require('underscore');
    var $ = require('jquery');
    var PIXI = require('pixi');
    var Backbone = require('backbone');

    var PiecewiseCurve = require('common/math/piecewise-curve');
    var Vector2        = require('common/math/vector2');

    var Constants = require('constants');
    var C = Constants.PhaseDiagramView;

    /**
     * Draws a phase diagram on a canvas element.
     */
    var PhaseDiagramView = Backbone.View.extend({

        className: 'phase-diagram',

        initialize: function(options) {
            this.depictingWater = false;
        },

        render: function() {
            this.$canvas = $('<canvas>').appendTo(this.el);

            this.context = this.$canvas[0].getContext('2d');

            return this;
        },

        postRender: function() {
            this.resize();
        },

        resize: function() {
            this.width  = this.$el.width();
            this.height = this.$el.height();

            this.$canvas.width(this.width);
            this.$canvas.height(this.height);

            this.$canvas[0].width  = this.width;
            this.$canvas[0].height = this.height;

            this.drawDiagram();
        },

        drawDiagram: function() {
            var ctx = this.context;

            // Graph dimensions
            var gw = C.HORIZ_AXIS_SIZE_PROPORTION * this.width;  // Graph width
            var gh = C.VERT_AXIS_SIZE_PROPORTION  * this.height; // Graph height

            // Graph offsets
            var graphOffsetX = C.X_ORIGIN_POSITION * this.width;
            var graphOffsetY = C.Y_ORIGIN_POSITION * this.height;

            // Determine which graph to draw
            var topOfSolidLiquidLine;
            if (this.depictingWater) {
                topOfSolidLiquidLine = new Vector2(
                    C.DEFAULT_TOP_OF_SOLID_LIQUID_LINE.x * gw,
                    C.DEFAULT_TOP_OF_SOLID_LIQUID_LINE.y * -gh
                );
            }
            else {
                topOfSolidLiquidLine = new Vector2(
                    C.TOP_OF_SOLID_LIQUID_LINE_FOR_WATER.x * gw,
                    C.TOP_OF_SOLID_LIQUID_LINE_FOR_WATER.y * -gh
                );
            }

            // Calculate triple point, which is used in several places
            var triplePoint = new Vector2(
                C.DEFAULT_TRIPLE_POINT.x * gw,
                C.DEFAULT_TRIPLE_POINT.y * -gh
            );

            var solidGasBorder = new PiecewiseCurve()
                .moveTo(0, 0)
                .quadTo(0.2 * gw, -0.02 * gh, triplePoint.x, triplePoint.y)

            // Border that separates the solid and gas and the solid and liquid
            var solidBorder = solidGasBorder
                .clone()
                .lineTo(topOfSolidLiquidLine.x, topOfSolidLiquidLine.y);

            // The whole solid area, reusing some stuff info from solidBorder
            var solidArea = solidBorder
                .clone()
                .lineTo(0, -gh)
                .close();

            var criticalPoint = new Vector2(
                C.DEFAULT_CRITICAL_POINT.x * gw,
                C.DEFAULT_CRITICAL_POINT.y * -gh
            );

            // Curve that separates liquid and gas.
            var liquidBottomBorder = new PiecewiseCurve()
                .moveTo(triplePoint.x, triplePoint.y)
                .quadTo(
                    triplePoint.x + (criticalPoint.x - triplePoint.x) / 2, triplePoint.y,
                    criticalPoint.x, criticalPoint.y
                );

            var liquidArea = liquidBottomBorder
                .clone()
                .lineTo(gw, -gh)
                .lineTo(topOfSolidLiquidLine.x, topOfSolidLiquidLine.y)
                .close();

            var criticalArea = new PiecewiseCurve()
                .moveTo(criticalPoint.x, criticalPoint.y)
                .lineTo(gw, -gh)
                .lineTo(gw, 0)
                .close();

            var gasArea = solidGasBorder
                .clone()
                .quadTo(
                    triplePoint.x + (criticalPoint.x - triplePoint.x) / 2, triplePoint.y,
                    criticalPoint.x, criticalPoint.y
                )
                .lineTo(gw, 0)
                close();

            // Translate them to make space on the edges for the axes and axis labels
            _.each([
                solidBorder,
                solidArea,
                liquidBottomBorder,
                liquidArea,
                criticalArea,
                gasArea
            ], function(curve) {
                curve.translate(graphOffsetX, graphOffsetY);
            });
            
            // Paint the areas
            ctx.fillStyle = C.SOLID_COLOR;
            PIXI.drawPiecewiseCurve(ctx, solidArea, 0, 0, true, false);
            ctx.fillStyle = C.LIQUID_COLOR;
            PIXI.drawPiecewiseCurve(ctx, liquidArea, 0, 0, true, false);
            ctx.fillStyle = C.GAS_COLOR;
            PIXI.drawPiecewiseCurve(ctx, gasArea, 0, 0, true, false);
            ctx.fillStyle = C.CRITICAL_COLOR;
            PIXI.drawPiecewiseCurve(ctx, criticalArea, 0, 0, true, false);

            // Paint the lines

        },

        show: function() {
            this.$el.show();
        },

        hide: function() {
            this.$el.hide();
        },

        setWaterMode: function(depictingWater) {
            this.depictingWater = depictingWater;
            this.drawDiagram();
        },

    }, Constants.PhaseDiagramView);

    return PhaseDiagramView;
});
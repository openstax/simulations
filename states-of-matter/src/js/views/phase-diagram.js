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

    // CSS
    require('less!styles/phase-diagram');

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

            this.$solidLabel         = $('<label class="solid-label">solid</label>').appendTo(this.$el);
            this.$liquidLabel        = $('<label class="liquid-label">liquid</label>').appendTo(this.$el);
            this.$gasLabel           = $('<label class="gas-label">gas</label>').appendTo(this.$el);

            this.$triplePointLabel   = $('<label class="triple-point-label">triple point</label>').appendTo(this.$el);
            this.$criticalPointLabel = $('<label class="critical-point-label">critical point</label>').appendTo(this.$el);

            this.$temperatureLabel   = $('<label class="x-axis-label">Temperature</label>').appendTo(this.$el);
            this.$pressureLabel      = $('<label class="y-axis-label">Pressure</label>').appendTo(this.$el);

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
            var gw = this.width  - C.AXES_ARROW_HEAD_HEIGHT - C.X_ORIGIN_POSITION;
            var gh = this.height - C.AXES_ARROW_HEAD_HEIGHT - C.Y_ORIGIN_POSITION; 

            // Graph offsets
            var graphOffsetX = C.X_ORIGIN_POSITION;
            var graphOffsetY = this.height - C.Y_ORIGIN_POSITION;

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

            var xAxis = new PiecewiseCurve()
                .moveTo(0,  0)
                .lineTo(gw, 0);

            var yAxis = new PiecewiseCurve()
                .moveTo(0,   0)
                .lineTo(0, -gh);

            var xAxisArrow = new PiecewiseCurve()
                .moveTo(gw, -PhaseDiagramView.AXES_ARROW_HEAD_WIDTH / 2)
                .lineTo(gw + PhaseDiagramView.AXES_ARROW_HEAD_HEIGHT, 0)
                .lineTo(gw,  PhaseDiagramView.AXES_ARROW_HEAD_WIDTH / 2)
                .close();

            var yAxisArrow = new PiecewiseCurve()
                .moveTo(-PhaseDiagramView.AXES_ARROW_HEAD_WIDTH / 2, -gh)
                .lineTo(0, -gh - PhaseDiagramView.AXES_ARROW_HEAD_HEIGHT)
                .lineTo(PhaseDiagramView.AXES_ARROW_HEAD_WIDTH / 2, -gh)
                .close();

            // Translate everything to make space on the edges for the axis labels
            _.each([
                solidBorder,
                solidArea,
                liquidBottomBorder,
                liquidArea,
                criticalArea,
                gasArea,
                xAxis,
                yAxis,
                xAxisArrow,
                yAxisArrow
            ], function(curve) {
                curve.translate(graphOffsetX, graphOffsetY);
            });

            triplePoint.add(graphOffsetX, graphOffsetY);
            criticalPoint.add(graphOffsetX, graphOffsetY);
            
            // Paint the filled areas
            this.drawAreas(solidArea, liquidArea, gasArea, criticalArea);

            // Paint the lines
            this.drawLines(solidBorder, liquidBottomBorder);

            // Paint the dots
            this.drawDots(triplePoint, criticalPoint);

            // Paint the axes
            this.drawAxes(xAxis, yAxis, xAxisArrow, yAxisArrow);

            // Paint the labels
            this.positionLabels(graphOffsetX, graphOffsetY, gw, gh, triplePoint, criticalPoint);
        },

        drawAreas: function(solidArea, liquidArea, gasArea, criticalArea) {
            var ctx = this.context;

            ctx.fillStyle = C.SOLID_COLOR;
            PIXI.drawPiecewiseCurve(ctx, solidArea, 0, 0, true, false);
            ctx.fillStyle = C.LIQUID_COLOR;
            PIXI.drawPiecewiseCurve(ctx, liquidArea, 0, 0, true, false);
            ctx.fillStyle = C.GAS_COLOR;
            PIXI.drawPiecewiseCurve(ctx, gasArea, 0, 0, true, false);
            ctx.fillStyle = C.CRITICAL_COLOR;
            PIXI.drawPiecewiseCurve(ctx, criticalArea, 0, 0, true, false);
        },

        drawLines: function(solidBorder, liquidBottomBorder) {
            var ctx = this.context;

            ctx.strokeStyle = C.LINE_COLOR;
            ctx.lineWidth = 1;
            ctx.lineJoin = 'round';

            PIXI.drawPiecewiseCurve(ctx, solidBorder,        0, 0, false, true);
            PIXI.drawPiecewiseCurve(ctx, liquidBottomBorder, 0, 0, false, true);
        },

        drawDots: function(triplePoint, criticalPoint) {
            var ctx = this.context;

            ctx.fillStyle = C.LINE_COLOR;

            ctx.beginPath();
            ctx.arc(triplePoint.x + 0, triplePoint.y + 0, C.POINT_RADIUS, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();

            ctx.beginPath();
            ctx.arc(criticalPoint.x + 0, criticalPoint.y + 0, C.POINT_RADIUS, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        },

        drawAxes: function(xAxis, yAxis, xAxisArrow, yAxisArrow) {
            var ctx = this.context;

            ctx.fillStyle = C.LINE_COLOR;
            ctx.strokeStyle = C.LINE_COLOR;

            PIXI.drawPiecewiseCurve(ctx, xAxis, 0, 0, false, true);
            PIXI.drawPiecewiseCurve(ctx, yAxis, 0, 0, false, true);

            PIXI.drawPiecewiseCurve(ctx, xAxisArrow, 0, 0, true, false);
            PIXI.drawPiecewiseCurve(ctx, yAxisArrow, 0, 0, true, false);
        },

        positionLabels: function(x, y, gw, gh, triplePoint, criticalPoint) {
            this.$solidLabel.css({  left: C.SOLID_LABEL_LOCATION.x  * gw + x + 'px', top: C.SOLID_LABEL_LOCATION.y  * -gh + y + 'px' });
            this.$liquidLabel.css({ left: C.LIQUID_LABEL_LOCATION.x * gw + x + 'px', top: C.LIQUID_LABEL_LOCATION.y * -gh + y + 'px' });
            this.$gasLabel.css({    left: C.GAS_LABEL_LOCATION.x    * gw + x + 'px', top: C.GAS_LABEL_LOCATION.y    * -gh + y + 'px' });
            
            this.$triplePointLabel.css({   left: C.SOLID_LABEL_LOCATION.x  * gw + x + 'px', top: C.SOLID_LABEL_LOCATION.y  * -gh + y + 'px' });
            this.$criticalPointLabel.css({ left: C.SOLID_LABEL_LOCATION.x  * gw + x + 'px', top: C.SOLID_LABEL_LOCATION.y  * -gh + y + 'px' });

            _.each([
                this.$solidLabel,
                this.$liquidLabel,
                this.$gasLabel,

                this.$pressureLabel, 
                this.$temperatureLabel
            ], function($label) {
                $label.css({ 
                    'margin-left': (-$label.width() / 2) + 'px',
                    'margin-top':  (-$label.height() / 2) + 'px'
                });
            });

            this.$triplePointLabel
                .width(40)
                .css({
                    left: triplePoint.x + 'px',
                    top:  triplePoint.y + 'px',
                    'margin-left': (-this.$triplePointLabel.width() - 10) + 'px',
                    'margin-top':  -this.$triplePointLabel.height() + 'px'
                });

            this.$criticalPointLabel
                .width(40)
                .css({
                    left: criticalPoint.x + 'px',
                    top:  criticalPoint.y + 'px',
                    'margin-left': '7px',
                    'margin-top': (-this.$triplePointLabel.height() / 2) + 'px'
                });

            this.$pressureLabel.css({ top: (y - gh / 2) + 'px', left: '6px' });
            this.$temperatureLabel.css({ top: (y + 12) + 'px', left: (x + gw / 2) + 'px' });
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
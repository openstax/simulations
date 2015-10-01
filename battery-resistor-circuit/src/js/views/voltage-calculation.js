define(function(require) {

    'use strict';

    var PIXI = require('pixi');

                   require('common/v3/pixi/sprite-from-new-canvas-context');
    var PixiView = require('common/v3/pixi/view');
    var AppView  = require('common/v3/app/app');
    var Colors   = require('common/colors/colors');
    var Vector2  = require('common/math/vector2');
    
    var Assets = require('assets');

    var Constants = require('constants');
    var CONNECTOR_LINE_COLOR = Colors.parseHex(Constants.VoltageCalculationView.CONNECTOR_LINE_COLOR);
    var CALCULATION_COLOR    = Colors.parseHex(Constants.VoltageCalculationView.CALCULATION_COLOR);
    var ELLIPSE_COLOR        = Colors.parseHex(Constants.VoltageCalculationView.ELLIPSE_COLOR);

    /**
     * A view that represents an electron
     */
    var VoltageCalculationView = PixiView.extend({

        /**
         * Initializes the new VoltageCalculationView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.width = options.width;
            this.height = options.height;

            this._leftCenter  = new Vector2();
            this._rightCenter = new Vector2();

            this.initGraphics();
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.highlights = new PIXI.Graphics();
            this.calculation = new PIXI.Container();

            this.displayObject.addChild(this.highlights);
            this.displayObject.addChild(this.calculation);

            this.initCalculation();

            this.updateMVT(this.mvt);
        },

        initCalculation: function() {
            var settings = {
                font: '18px Helvetica Neue',
                fill: VoltageCalculationView.CALCULATION_COLOR
            };

            this.minuend    = new PIXI.Text(   '4', settings);
            this.subtrahend = new PIXI.Text('- 12', settings);
            this.difference = new PIXI.Text(  '-8', settings);
            var totalLine = new PIXI.Graphics();

            this.minuend.anchor.x = this.subtrahend.anchor.x = this.difference.anchor.x = 1;

            this.minuend.addChild(   new PIXI.Text('electrons', settings));
            this.subtrahend.addChild(new PIXI.Text('electrons', settings));
            this.difference.addChild(new PIXI.Text('"Volts"',   settings));

            var padding = 8;
            this.minuend.getChildAt(0).x    = padding;
            this.subtrahend.getChildAt(0).x = padding;
            this.difference.getChildAt(0).x = padding;

            this.calculation.addChild(this.minuend);
            this.calculation.addChild(this.subtrahend);
            this.calculation.addChild(this.difference);
            this.calculation.addChild(totalLine);

            var minuendYOffset     = VoltageCalculationView.MINUEND_Y_OFFSET;
            var subtrahendYOffset  = VoltageCalculationView.SUBTRAHEND_Y_OFFSET;
            var totalLineYOffset   = VoltageCalculationView.TOTAL_LINE_Y_OFFSET;
            var differenceYOffset  = VoltageCalculationView.DIFFERENCE_Y_OFFSET;
            var leftMargin         = VoltageCalculationView.CALCULATION_LEFT_MARGIN;
            var rightMargin        = VoltageCalculationView.CALCULATION_RIGHT_MARGIN;

            this.minuend.y    = Math.round(minuendYOffset - this.minuend.height / 2);
            this.subtrahend.y = Math.round(subtrahendYOffset - this.subtrahend.height / 2);
            this.difference.y = Math.round(differenceYOffset - this.difference.height / 2);
            totalLine.y = totalLineYOffset;
            totalLine.lineStyle(2, CALCULATION_COLOR, 1);
            totalLine.moveTo(-leftMargin + 12, 0);
            totalLine.lineTo(rightMargin - 12, 0);
        },

        drawHighlights: function() {
            var graphics = this.highlights;

            // Draw ellipses highlighting each side of the circuit
            var leftCenter  = this._leftCenter.set(this.mvt.modelToView(VoltageCalculationView.LEFT_CENTER)).round();
            var rightCenter = this._rightCenter.set(this.mvt.modelToView(VoltageCalculationView.RIGHT_CENTER)).round();
            var ellipseWidth  = Math.round(this.mvt.modelToViewDeltaX(VoltageCalculationView.ELLIPSE_WIDTH)  / 2);
            var ellipseHeight = Math.round(this.mvt.modelToViewDeltaY(VoltageCalculationView.ELLIPSE_HEIGHT) / 2);
            graphics.lineStyle(VoltageCalculationView.ELLIPSE_LINE_WIDTH, ELLIPSE_COLOR, 1);
            graphics.drawEllipse(leftCenter.x,  leftCenter.y,  ellipseWidth, ellipseHeight);
            graphics.drawEllipse(rightCenter.x, rightCenter.y, ellipseWidth, ellipseHeight);

            // Draw lines connecting to numbers
            var calculationTopY = AppView.windowIsShort() ? 
                Math.round(this.mvt.modelToViewY(VoltageCalculationView.SHORT_SCREEN_CALCULATION_TOP_Y)) :
                Math.round(this.mvt.modelToViewY(VoltageCalculationView.CALCULATION_TOP_Y));
            var calculationX       = Math.round(this.mvt.modelToViewX(VoltageCalculationView.CALCULATION_X));
            var leftMargin         = VoltageCalculationView.CALCULATION_LEFT_MARGIN;
            var rightMargin        = VoltageCalculationView.CALCULATION_RIGHT_MARGIN;
            var minuendYOffset     = VoltageCalculationView.MINUEND_Y_OFFSET;
            var subtrahendYOffset  = VoltageCalculationView.SUBTRAHEND_Y_OFFSET;
            var connectorMargin    = VoltageCalculationView.CONNECTOR_MARGIN;
            var connectorEndRadius = VoltageCalculationView.CONNECTOR_END_RADIUS;

            // Left connector line
            graphics.lineStyle(VoltageCalculationView.CONNECTOR_LINE_WIDTH, CONNECTOR_LINE_COLOR, 1);
            graphics.moveTo(leftCenter.x, leftCenter.y + ellipseHeight);
            graphics.lineTo(leftCenter.x, calculationTopY + subtrahendYOffset);
            graphics.lineTo(calculationX - leftMargin - connectorEndRadius, calculationTopY + subtrahendYOffset);
            if (graphics.currentPath && graphics.currentPath.shape)
                graphics.currentPath.shape.closed = false;
            graphics.drawCircle(calculationX - leftMargin, calculationTopY + subtrahendYOffset, connectorEndRadius);
            if (graphics.currentPath && graphics.currentPath.shape)
                graphics.currentPath.shape.closed = false;

            // Right connector line
            graphics.lineStyle(VoltageCalculationView.CONNECTOR_LINE_WIDTH, CONNECTOR_LINE_COLOR, 1);
            graphics.moveTo(rightCenter.x, rightCenter.y + ellipseHeight);
            graphics.lineTo(rightCenter.x, calculationTopY + minuendYOffset);
            graphics.lineTo(calculationX + rightMargin + connectorEndRadius, calculationTopY + minuendYOffset);
            if (graphics.currentPath && graphics.currentPath.shape)
                graphics.currentPath.shape.closed = false;
            graphics.drawCircle(calculationX + rightMargin, calculationTopY + minuendYOffset, connectorEndRadius);
            if (graphics.currentPath && graphics.currentPath.shape)
                graphics.currentPath.shape.closed = false;
        },

        updateCalculationPosition: function() {
            var calculationTopY = AppView.windowIsShort() ? 
                Math.round(this.mvt.modelToViewY(VoltageCalculationView.SHORT_SCREEN_CALCULATION_TOP_Y)) :
                Math.round(this.mvt.modelToViewY(VoltageCalculationView.CALCULATION_TOP_Y));
            var calculationX       = Math.round(this.mvt.modelToViewX(VoltageCalculationView.CALCULATION_X));

            this.calculation.x = calculationX;
            this.calculation.y = calculationTopY;
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.drawHighlights();
            this.updateCalculationPosition();

            this.update();
        },

        /**
         * Updates the actual text of the calculation
         */
        update: function() {
            
        },

        show: function() {
            this.displayObject.visible = true;
        },

        hide: function() {
            this.displayObject.visible = false;
        }

    }, Constants.VoltageCalculationView);


    return VoltageCalculationView;
});
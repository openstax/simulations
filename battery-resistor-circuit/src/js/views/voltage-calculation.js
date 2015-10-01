define(function(require) {

    'use strict';

    var PIXI = require('pixi');

                   require('common/v3/pixi/sprite-from-new-canvas-context');
    var PixiView = require('common/v3/pixi/view');
    var Colors   = require('common/colors/colors');
    var Vector2  = require('common/math/vector2');
    
    var Assets = require('assets');

    var Constants = require('constants');
    var HIGHLIGHT_COLOR   = Colors.parseHex(Constants.VoltageCalculationView.HIGHLIGHT_COLOR);
    var CALCULATION_COLOR = Colors.parseHex(Constants.VoltageCalculationView.CALCULATION_COLOR);
    var ELLIPSE_COLOR     = Colors.parseHex(Constants.VoltageCalculationView.ELLIPSE_COLOR);

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
            this.shadows = new PIXI.Container();

            this.displayObject.addChild(this.shadows);
            this.displayObject.addChild(this.highlights);

            this.updateMVT(this.mvt);
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


            var shadowBlur = 11;

            this.shadow = PIXI.Sprite.fromNewCanvasContext(this.width, this.height, function(ctx) {
                ctx.lineWidth = shadowBlur;
                ctx.strokeStyle = 'rgba(0,0,0,1)';
                ctx.fillStyle = 'rgba(0,0,0,1)';
                ctx.shadowBlur = shadowBlur;
                ctx.shadowColor = '#000';

                ctx.beginPath();
                ctx.ellipse(leftCenter.x,  leftCenter.y,  ellipseWidth, ellipseHeight, 0, 0, 2 * Math.PI);
                ctx.closePath();
                ctx.stroke();
                ctx.beginPath();
                ctx.ellipse(rightCenter.x, rightCenter.y, ellipseWidth, ellipseHeight, 0, 0, 2 * Math.PI);
                ctx.closePath();
                ctx.stroke();
            });

            //this.displayObject.removeChild(this.shadow);
            this.shadow.alpha = 0.2;
            this.shadows.addChild(this.shadow);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.drawHighlights();

            this.update();
        },

        update: function() {
            
        }

    }, Constants.VoltageCalculationView);


    return VoltageCalculationView;
});
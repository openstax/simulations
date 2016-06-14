define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView = require('common/v3/pixi/view');

    var Constants = require('constants');

    /**
     * 
     */
    var EFieldLinesView = PixiView.extend({

        /**
         * Overrides PixiView's initializeDisplayObject function
         */
        initializeDisplayObject: function() {
            this.displayObject = new PIXI.Graphics();
        },

        initialize: function(options) {
            this.mvt = options.mvt;
            this.maxEffectiveEField = options.maxEffectiveEField;

            // Initialize graphics
            this.updateMVT(this.mvt);

            this.listenTo(this.model, 'change:platesVoltage',   this.draw);
            this.listenTo(this.model, 'change:plateSeparation', this.draw);
            this.listenTo(this.model, 'change:plateDepth',      this.draw);
            this.listenTo(this.model, 'change:position',        this.updatePosition);
        },

        draw: function() {
            var capacitor = this.model;
            var graphics = this.displayObject;
            graphics.clear();

            // Compute density (spacing) of field lines
            var effectiveEField = capacitor.getEffectiveEField();
            var lineSpacing = this.getLineSpacing(effectiveEField);

            if (lineSpacing > 0) {
                // Relevant model values
                var plateWidth = capacitor.get('plateWidth');
                var plateDepth = plateWidth;
                var plateSeparation = capacitor.get('plateSeparation');

                /*
                 * Create field lines, working from the center outwards so that lines
                 *   appear/disappear at edges of plate as E_effective changes.
                 */
                var length = this.mvt.modelToViewDeltaY(plateSeparation);
                var pointDown = (effectiveEField >= 0);
                var x = lineSpacing / 2;
                while (x <= plateWidth / 2) {
                    var z = lineSpacing / 2;
                    while (z <= plateDepth / 2) {
                        // Draw 4 lines, one for each quadrant
                        var y = 0;
                        this.drawEFieldLine( x, y,  z, length, pointDown);
                        this.drawEFieldLine(-x, y,  z, length, pointDown);
                        this.drawEFieldLine( x, y, -z, length, pointDown);
                        this.drawEFieldLine(-x, y, -z, length, pointDown);

                        z += lineSpacing;
                    }

                    x += lineSpacing;
                }
            }
        },

        drawEFieldLine: function(x, y, z, length, pointDown) {
            var viewPoint = this.mvt.modelToViewDelta(x, y, z);
            var graphics = this.displayObject;
            var w = this.arrowWidth;
            var h = this.arrowHeight;

            // Draw line
            graphics.lineStyle(2, 0x000000, 1);
            graphics.moveTo(viewPoint.x, viewPoint.y - length / 2);
            graphics.lineTo(viewPoint.x, viewPoint.y + length / 2);

            // Draw arrow
            graphics.beginFill(0x000000, 1);
            if (pointDown) {
                graphics.moveTo(viewPoint.x,         viewPoint.y + h / 2); // Tip of the arrow
                graphics.lineTo(viewPoint.x + w / 2, viewPoint.y - h / 2);
                graphics.lineTo(viewPoint.x - w / 2, viewPoint.y - h / 2);
            }
            else {
                graphics.moveTo(viewPoint.x,         viewPoint.y - h / 2); // Tip of the arrow
                graphics.lineTo(viewPoint.x + w / 2, viewPoint.y + h / 2);
                graphics.lineTo(viewPoint.x - w / 2, viewPoint.y + h / 2);
            }
            graphics.endFill();
        },

        /**
         * Gets the spacing of E-field lines. Higher E-field results in higher
         *   density, therefore lower spacing. Density is computed for the
         *   minimum plate size.
         *
         * @param effectiveEField
         * @return spacing, in model coordinates
         */
        getLineSpacing: function(effectiveEField) {
            if (effectiveEField === 0) {
                return 0;
            }
            else {
                var numberOfLines = this.getNumberOfLines(effectiveEField);
                return Constants.PLATE_WIDTH_RANGE.min / Math.sqrt(numberOfLines);
            }
        },

        /**
         * Computes number of lines to put on the smallest plate, linearly proportional to plate charge.
         */
        getNumberOfLines: function(effectiveEField) {
            var absEField = Math.abs(effectiveEField);
            var numberOfLines = Math.floor(Constants.NUMBER_OF_EFIELD_LINES.max * absEField / this.maxEffectiveEField);

            if (absEField > 0 && numberOfLines < Constants.NUMBER_OF_EFIELD_LINES.min)
                numberOfLines = Constants.NUMBER_OF_EFIELD_LINES.min;

            return numberOfLines;
        },

        updatePosition: function() {
            var viewPos = this.mvt.modelToView(this.model.get('position'));
            this.displayObject.x = viewPos.x;
            this.displayObject.y = viewPos.y;
        },
 
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.arrowWidth  = this.mvt.modelToViewDeltaX(0.0005);
            this.arrowHeight = this.mvt.modelToViewDeltaY(0.0008);

            this.draw();
            this.updatePosition();
        },

        show: function() {
            this.displayObject.visible = true;
        },

        hide: function() {
            this.displayObject.visible = false;
        }

    });

    return EFieldLinesView;
});
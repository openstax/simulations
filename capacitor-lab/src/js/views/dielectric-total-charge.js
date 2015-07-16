define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var PixiView  = require('common/pixi/view');
    var Colors    = require('common/colors/colors');
    var Vector2   = require('common/math/vector2');
    var Vector3   = require('common/math/vector3');

    var CapacitorShapeCreator = require('shape-creators/capacitor');

    var Constants = require('constants');

    var LINE_WIDTH = Constants.DielectricTotalChargeView.LINE_WIDTH;
    var SYMBOL_WIDTH = Constants.DielectricTotalChargeView.SYMBOL_WIDTH;
    var POSITIVE_COLOR = Colors.parseHex(Constants.DielectricTotalChargeView.POSITIVE_COLOR);
    var NEGATIVE_COLOR = Colors.parseHex(Constants.DielectricTotalChargeView.NEGATIVE_COLOR);
    var SYMBOL_SPACING = Constants.DielectricTotalChargeView.SYMBOL_SPACING;
    var SYMBOL_SPACING_EXPONENT = Constants.DielectricTotalChargeView.SYMBOL_SPACING_EXPONENT;
    var NEGATIVE_CHARGE_OFFSET_RANGE = Constants.DielectricTotalChargeView.NEGATIVE_CHARGE_OFFSET_RANGE;

    var Polarity = Constants.Polarity;

    /**
     * Shows the total dielectric charge. Spacing of positive and negative charges
     *   remains constant, and they appear in positive/negative pairs. The spacing
     *   between the positive/negative pairs changes proportional to E_dielectric.
     *   Outside the capacitor, the spacing between the pairs is at a minimum to
     *   represent no charge.

     * All model coordinates are relative to the dielectric's local coordinate frame,
     * where the origin is at the 3D geometric center of the dielectric.
     */
    var DielectricTotalChargeView = PixiView.extend({

        initialize: function(options) {
            // options = _.extend({
                
            // }, options);

            this.mvt = options.mvt;
            this.maxDielectricEField = options.maxDielectricEField;

            // Cached objects
            this._vec3 = new Vector3();

            // Initialize graphics
            this.initGraphics();
            this.updateMVT(this.mvt);

            // Listen for model events
            this.listenTo(this.model, 'change:position',           this.updatePosition);
            this.listenTo(this.model, 'change:dielectricOffset',   this.updatePosition);
            this.listenTo(this.model, 'change:plateDepth',         this.draw);
            this.listenTo(this.model, 'change:plateSeparation',    this.draw);
            this.listenTo(this.model, 'change:dielectricMaterial', this.draw);
            this.listenTo(this.model, 'change:dielectricOffset',   this.draw);
            this.listenTo(this.model, 'change:platesVoltage',      this.draw);
        },

        initGraphics: function() {
            this.positiveCharges = new PIXI.Graphics();
            this.negativeCharges = new PIXI.Graphics();

            this.displayObject.addChild(this.positiveCharges);
            this.displayObject.addChild(this.negativeCharges);
        },

        draw: function() {
            this.positiveCharges.clear();
            this.negativeCharges.clear();

            this.positiveCharges.lineStyle(LINE_WIDTH, POSITIVE_COLOR, 1);
            this.negativeCharges.lineStyle(LINE_WIDTH, NEGATIVE_COLOR, 1);

            var capacitor = this.model;

            // Offset of negative charges
            var eField = capacitor.getDielectricEField();
            var negativeChargeOffset = this.getNegativeChargeOffset(eField);

            // Spacing between pairs
            var spacingBetweenPairs = SYMBOL_SPACING;

            // Rows and columns
            var dielectricWidth  = capacitor.getDielectricWidth();
            var dielectricHeight = capacitor.getDielectricHeight();
            var dielectricDepth  = capacitor.getDielectricDepth();
            var rows = parseInt(dielectricHeight / spacingBetweenPairs);
            var cols = parseInt(dielectricWidth  / spacingBetweenPairs);

            // Margins and offsets
            var xMargin = (dielectricWidth  - (cols * spacingBetweenPairs)) / 2;
            var yMargin = (dielectricHeight - (rows * spacingBetweenPairs)) / 2;
            var zMargin = xMargin;
            var offset = spacingBetweenPairs / 2;

            // Polarity
            var polarity = (eField >= 0) ? Polarity.NEGATIVE : Polarity.POSITIVE;

            var xPlateEdge = -(dielectricWidth / 2) + (dielectricWidth - capacitor.get('dielectricOffset'));

            var x, y, z;
            var pairNegativeChargeOffset;

            for (var row = 0; row < rows; row++) {
                for (var col = 0; col < cols; col++) {
                    // Front face
                    // Calculate center of the pair
                    x = -(dielectricWidth  / 2) + offset + xMargin + (col * spacingBetweenPairs);
                    y = -(dielectricHeight / 2) + offset + yMargin + (row * spacingBetweenPairs);
                    z = (-dielectricDepth  / 2);

                    // Spacing between charges
                    if (x <= xPlateEdge)
                        pairNegativeChargeOffset = negativeChargeOffset;
                    else
                        pairNegativeChargeOffset = NEGATIVE_CHARGE_OFFSET_RANGE.min;
                    pairNegativeChargeOffset *= (polarity === Polarity.POSITIVE) ? 1 : -1;

                    this.drawNegativeSymbol(x, y + pairNegativeChargeOffset, z);
                    this.drawPositiveSymbol(x, y, z);

                    // Side face
                    // Center of the pair
                    x =  (dielectricWidth  / 2);
                    y = -(dielectricHeight / 2) + offset + yMargin + (row * spacingBetweenPairs);
                    z = -(dielectricDepth  / 2) + offset + zMargin + (col * spacingBetweenPairs);

                    // Spacing between charges
                    if (capacitor.getDielectricOffset() === 0)
                        pairNegativeChargeOffset = negativeChargeOffset;
                    else
                        pairNegativeChargeOffset = NEGATIVE_CHARGE_OFFSET_RANGE.min;
                    pairNegativeChargeOffset *= (polarity === Polarity.POSITIVE) ? 1 : -1;

                    this.drawNegativeSymbol(x, y + pairNegativeChargeOffset, z);
                    this.drawPositiveSymbol(x, y, z);
                }
            }
        },

        drawNegativeSymbol: function(x, y, z) {
            var viewPoint = this.mvt.modelToViewDelta(x, y, z);
            this.negativeCharges.moveTo(viewPoint.x - SYMBOL_WIDTH / 2, viewPoint.y);
            this.negativeCharges.lineTo(viewPoint.x + SYMBOL_WIDTH / 2, viewPoint.y);
        },

        drawPositiveSymbol: function(x, y, z) {
            var viewPoint = this.mvt.modelToViewDelta(x, y, z);
            this.positiveCharges.moveTo(viewPoint.x - SYMBOL_WIDTH / 2, viewPoint.y);
            this.positiveCharges.lineTo(viewPoint.x + SYMBOL_WIDTH / 2, viewPoint.y);
            this.positiveCharges.moveTo(viewPoint.x, viewPoint.y - SYMBOL_WIDTH / 2);
            this.positiveCharges.lineTo(viewPoint.x, viewPoint.y + SYMBOL_WIDTH / 2);
        },

        getNegativeChargeOffset: function(eField) {
            var absEField = Math.abs(eField);
            var percent = Math.pow(absEField / this.maxDielectricEField, SYMBOL_SPACING_EXPONENT);
            return NEGATIVE_CHARGE_OFFSET_RANGE.min + (percent * NEGATIVE_CHARGE_OFFSET_RANGE.length());
        },

        updatePosition: function() {
            var modelPos = this._vec3.set(this.model.get('position'));
            modelPos.x += this.model.get('dielectricOffset');
            var viewPos = this.mvt.modelToView(modelPos);
            this.displayObject.x = viewPos.x;
            this.displayObject.y = viewPos.y;
        },
 
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.draw();
            this.updatePosition(this.model, this.model.get('position'));
        },

        show: function() {
            this.displayObject.visible = true;
        },

        hide: function() {
            this.displayObject.visible = false;
        }

    });

    return DielectricTotalChargeView;
});
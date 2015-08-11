define(function(require) {

    'use strict';

    var Vector3   = require('common/math/vector3');

    var ChargeView = require('views/charge');

    var Constants = require('constants');

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
    var DielectricTotalChargeView = ChargeView.extend({

        initialize: function(options) {
            this.maxDielectricEField = options.maxDielectricEField;
            
            // Cached objects
            this._vec3 = new Vector3();

            // Call parent initialize
            ChargeView.prototype.initialize.apply(this, [options]);

            // Listen for model events
            this.listenTo(this.model, 'change:position change:dielectricOffset', this.updatePosition);
            this.listenTo(this.model, 'change', this.draw);
        },

        draw: function() {
            ChargeView.prototype.draw.apply(this, arguments);

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
        }

    });

    return DielectricTotalChargeView;
});
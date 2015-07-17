define(function(require) {

    'use strict';

    var Vector2   = require('common/math/vector2');
    var Vector3   = require('common/math/vector3');

    var ChargeView        = require('views/charge');
    var calculateGridSize = require('views/calculate-grid-size');

    var Constants = require('constants');
    var Polarity = Constants.Polarity;

    /**
     * Shows the excess dielectric charge (Q_excess_dielectric). Charges appear on
     *   the surface of the dielectric where it contacts the plates, so charges
     *   appear on the right face only when the dielectric is fully inserted.
     * 
     * All model coordinates are relative to the dielectric's local coordinate
     *   frame, where the origin is at the 3D geometric center of the dielectric.
     */
    var DielectricExcessChargeView = ChargeView.extend({

        initialize: function(options) {
            this.maxExcessDielectricPlateCharge = options.maxExcessDielectricPlateCharge;
            
            // Cached objects
            this._vec3 = new Vector3();

            // Bind these functions because we want to use them by themselves
            this.drawNegativeSymbol = _.bind(this.drawNegativeSymbol, this);
            this.drawPositiveSymbol = _.bind(this.drawPositiveSymbol, this);

            // Call parent initialize
            ChargeView.prototype.initialize.apply(this, [options]);

            // Listen for model events
            this.listenTo(this.model, 'change:position',           this.updatePosition);
            this.listenTo(this.model, 'change:dielectricOffset',   this.updatePosition);
            this.listenTo(this.model, 'change:plateDepth',         this.draw);
            this.listenTo(this.model, 'change:plateSeparation',    this.draw);
            this.listenTo(this.model, 'change:dielectricMaterial', this.draw);
            this.listenTo(this.model, 'change:dielectricOffset',   this.draw);
            this.listenTo(this.model, 'change:platesVoltage',      this.draw);
        },

        /**
         * Updates the quantity and location of plate charges.
         */
        draw: function() {
            ChargeView.prototype.draw.apply(this, arguments);

            var capacitor = this.model;

            var excessCharge    = capacitor.getExcessDielectricPlateCharge();
            var dielectricWidth = capacitor.getDielectricWidth();
            var dielectricDepth = capacitor.getDielectricDepth();
            var dielectricOffset = capacitor.get('dielectricOffset');
            var contactWidth = Math.max(0, dielectricWidth - capacitor.get('dielectricOffset')); // Contact between plate and dielectric

            if (excessCharge !== 0 && contactWidth > 0) {
                // Compute the number excess charges
                var numberOfExcessCharges = this.getNumberOfCharges(excessCharge);

                // Margins
                var zMargin = this.mvt.viewToModelDeltaX(ChargeView.SYMBOL_WIDTH);

                // Compute the grid size
                var gridWidth = contactWidth;
                var gridDepth = dielectricDepth - (2 * zMargin);
                var gridDimensions = calculateGridSize(numberOfExcessCharges, gridWidth, gridDepth);
                var rows = gridDimensions.rows;
                var cols = gridDimensions.columns;

                // Distance between charges
                var dx = gridWidth / cols;
                var dz = gridDepth / rows;

                // Offset to move us to the center of columns
                var xOffset = dx / 2;
                var yOffset = this.mvt.viewToModelDeltaY(ChargeView.SYMBOL_WIDTH);
                var zOffset = dz / 2;

                // 
                var topOffset    = -capacitor.get('plateSeparation') / 2;
                var bottomOffset =  capacitor.get('plateSeparation') / 2;

                var x;
                var y;
                var z;

                var drawTopCharge    = (excessCharge > 0) ? this.drawNegativeSymbol : this.drawPositiveSymbol;
                var drawBottomCharge = (excessCharge > 0) ? this.drawPositiveSymbol : this.drawNegativeSymbol;

                // Draw a complete grid for the bottom face
                for (var row = 0; row < rows; row++) {
                    for (var col = 0; col < cols; col++) {
                        // Position the charge in a grid cell
                        x = -(dielectricWidth / 2) + xOffset + (col * dx) + dielectricOffset;
                        y = bottomOffset - yOffset;
                        z = -(dielectricDepth / 2) + zOffset + (row * dz);

                        drawBottomCharge(x, y, z);
                    }
                }

                // Draw front edge for top face
                x = 0;
                y = yOffset;
                z;
                for (var c = 0; c < cols; c++) {
                    // Position the charge
                    x = -(dielectricWidth / 2) + xOffset + (c * dx) + dielectricOffset;
                    z = -(dielectricDepth / 2);

                    drawTopCharge(x, y + topOffset, z);
                }

                // Draw right-side edge for top face
                x += xOffset; // Start from where we left off with the front edge
                for (var r = 0; r < rows; r++) {
                    // Position the charge
                    z = -(dielectricDepth / 2) + zOffset + (r * dz);

                    drawTopCharge(x, y + topOffset, z);
                }
            }
        },

        /**
         * Gets the number of charges on the part of each dielectric face (top and
         *   bottom) that contacts a capacitor plate. We use NUMBER_OF_PLATE_CHARGES
         *   as the range so that this view is related to the plate charges view.
         */
        getNumberOfCharges: function(excessCharge) {
            // Don't take sqrt of absCharge; it's something like 1E-14 and will result in a *larger* number
            var absCharge = Math.abs(excessCharge);
            var numberOfCharges = Math.floor(Constants.NUMBER_OF_PLATE_CHARGES.max * absCharge / this.maxExcessDielectricPlateCharge);

            if (absCharge > 0 && numberOfCharges < Constants.NUMBER_OF_PLATE_CHARGES.min)
                numberOfCharges = Constants.NUMBER_OF_PLATE_CHARGES.min;

            return numberOfCharges;
        },

        updatePosition: function() {
            var viewPos = this.mvt.modelToView(this.model.get('position'));
            this.displayObject.x = viewPos.x;
            this.displayObject.y = viewPos.y;
        },
 
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.draw();
            this.updatePosition();
        }

    });

    return DielectricExcessChargeView;
});
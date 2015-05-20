define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var PixiView = require('common/pixi/view');
    var Vector2  = require('common/math/vector2');
    var Colors   = require('common/colors/colors');

    var Constants = require('constants');

    /**
     * A view that represents a photon
     */
    var AtomicBondView = PixiView.extend({

        /**
         * Overrides PixiView's initializeDisplayObject function 
         *   make the displayObject a graphics object
         */
        initializeDisplayObject: function() {
            this.displayObject = new PIXI.Graphics();
        },

        /**
         * Initializes the new AtomicBondView.
         */
        initialize: function(options) {
            // Cached objects
            this._point1 = new Vector2();
            this._point2 = new Vector2();
            this._offset = new Vector2();

            this.color = Colors.parseHex(AtomicBondView.COLOR);

            this.listenTo(this.model.atom1, 'change:position', this.drawBond);
            this.listenTo(this.model.atom2, 'change:position', this.drawBond);

            this.updateMVT(options.mvt);
        },

        /**
         * Draws the bond
         */
        drawBond: function() {
            var bond = this.model;

            var averageAtomRadius = this.mvt.modelToViewDeltaX(
                (bond.getAtom1().get('radius') + bond.getAtom2().get('radius')) / 2
            );

            switch (bond.getBondCount()) {
                case 1:
                    // Single bond, so connect it from the center of one atom to the
                    //   center of the other.
                    var point1 = this._point1.set(this.mvt.modelToView(bond.getAtom1().get('position')));
                    var point2 = this._point2.set(this.mvt.modelToView(bond.getAtom2().get('position')));
                    var bondWidth = AtomicBondView.BOND_WIDTH_PROPORTION_SINGLE * averageAtomRadius;

                    this.drawSingleBond(this.color, point1, point2, bondWidth);

                    break;

                case 2:
                    // Double bond.
                    var transformedRadius = this.mvt.modelToViewDeltaX(
                        Math.min(bond.getAtom1().get('radius'), bond.getAtom2().get('radius'))
                    );

                    // Get the center points of the two atoms.
                    var point1 = this._point1.set(this.mvt.modelToView(bond.getAtom1().get('position')));
                    var point2 = this._point2.set(this.mvt.modelToView(bond.getAtom2().get('position')));
                    var angle = Math.atan2(point1.x - point2.x, point1.y - point2.y);

                    // Create a vector that will act as the offset from the center
                    //   point to the origin of the bond line.
                    var offsetVector = this._offset
                        .set(transformedRadius / 3, 0)
                        .rotate(angle);

                    // Draw the bonds.
                    var bondWidth = AtomicBondView.BOND_WIDTH_PROPORTION_DOUBLE * averageAtomRadius;
                    this.drawDoubleBond(this.color, point1, point2, bondWidth, offsetVector);

                    break;

                case 3:
                    // Triple bond.
                    var transformedRadius = this.mvt.modelToViewDeltaX(
                        Math.min(bond.getAtom1().get('radius'), bond.getAtom2().get('radius'))
                    );

                    // Get the center points of the two atoms.
                    var point1 = this._point1.set(this.mvt.modelToView(bond.getAtom1().get('position')));
                    var point2 = this._point2.set(this.mvt.modelToView(bond.getAtom2().get('position')));
                    var angle = Math.atan2(point1.x - point2.x, point1.y - point2.y);

                    // Create a vector that will act as the offset from the center
                    //   point to the origin of the bond line.
                    var offsetVector = this._offset
                        .set(transformedRadius * 0.6, 0)
                        .rotate(angle);

                    // Draw the bonds.
                    var bondWidth = AtomicBondView.BOND_WIDTH_PROPORTION_TRIPLE * averageAtomRadius;
                    this.drawTripleBond(this.color, point1, point2, bondWidth, offsetVector);

                    break;
            }
        },

        drawSingleBond: function(color, point1, point2, bondWidth) {
            var graphics = this.displayObject;
            graphics.lineStyle(bondWidth, color, 1);
            graphics.moveTo(point1.x, point1.y);
            graphics.lineTo(point2.x, point2.y);
        },

        drawDoubleBond: function(color, point1, point2, bondWidth, offsetVector) {
            var graphics = this.displayObject;
            graphics.lineStyle(bondWidth, color, 1);

            graphics.moveTo(point1.x + offsetVector.x, point1.y - offsetVector.y);
            graphics.lineTo(point2.x + offsetVector.x, point2.y - offsetVector.y);

            offsetVector.rotate(Math.PI);

            graphics.moveTo(point1.x + offsetVector.x, point1.y - offsetVector.y);
            graphics.lineTo(point2.x + offsetVector.x, point2.y - offsetVector.y);
        },

        drawTripleBond: function(color, point1, point2, bondWidth, offsetVector) {
            var graphics = this.displayObject;
            graphics.lineStyle(bondWidth, color, 1);

            graphics.moveTo(point1.x, point1.y);
            graphics.lineTo(point2.x, point2.y);

            graphics.moveTo(point1.x + offsetVector.x, point1.y - offsetVector.y);
            graphics.lineTo(point2.x + offsetVector.x, point2.y - offsetVector.y);

            offsetVector.rotate(Math.PI);

            graphics.moveTo(point1.x + offsetVector.x, point1.y - offsetVector.y);
            graphics.lineTo(point2.x + offsetVector.x, point2.y - offsetVector.y);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.drawBond();
        },

    }, Constants.AtomicBondView);

    return AtomicBondView;
});
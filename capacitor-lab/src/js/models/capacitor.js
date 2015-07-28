define(function (require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var PositionableObject3D = require('common/models/positionable-object-3d');
    var Vector3              = require('common/math/vector3');
    var Vector2              = require('common/math/vector2');
    var Rectangle            = require('common/math/rectangle');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * 
     */
    var Capacitor = PositionableObject3D.extend({

        defaults: _.extend({}, PositionableObject3D.prototype.defaults, {
            plateWidth: 0,                       // Width of the plate in meters
            plateHeight: Constants.PLATE_HEIGHT, // Height of the plate in meters
            plateDepth: 0,                       // Depth of plate in meters
            plateSeparation: 0,                  // Distance between plates in meters

            dielectricMaterial: null, // Insulator between plates
            dielectricOffset: 0,      // The x offset of the dielectric's center, relative to the capacitor's origin

            platesVoltage: 0 // Voltage across the plates in Volts
        }),

        initialize: function(attributes, options) {
            // Object caches
            this._topCenter    = new Vector3();
            this._bottomCenter = new Vector3();
            this._topPlate2D        = new Rectangle();
            this._bottomPlate2D     = new Rectangle();
            this._betweenPlatesArea = new Rectangle();

            PositionableObject3D.prototype.initialize.apply(this, [attributes, options]);

            this.on('change:plateWidth', this.plateWidthChanged);

            this.plateWidthChanged(this, this.get('plateWidth'));
        },


        /**
         * Resets the model to its original state
         */
        reset: function() {
            
        },

        /**
         * Updates every simulation step
         */
        update: function(time, deltaTime) {
            
        },

        //----------------------------------------------------------------------------------
        // Shape of the Capacitor Components
        //----------------------------------------------------------------------------------

        /**
         * Always keep the plate depth the same as width because it's supposed
         *   to be square on the xz plane.
         */
        plateWidthChanged: function(capacitor, plateWidth) {
            this.set('plateDepth', plateWidth);
        },

        /**
         * Convenience method, gets the area of the plate's top or bottom surface.
         */
        getPlateArea: function() {
            return this.get('plateWidth') * this.get('plateDepth');
        },

        /**
         * Convenience method for determining the outside center of the top plate.
         *   This is used for a wire attachment point.
         */
        getTopPlateCenter: function() {
            return this._topCenter.set(
                this.get('position').x,
                this.get('position').y - (this.get('plateSeparation') / 2) - this.get('plateHeight'),
                this.get('position').z
            );
        },

        /**
         * Convenience method for determining the outside center of the bottom plate.
         *   This is used for a wire attachment point.
         */
        getBottomPlateCenter: function() {
            return this._bottomCenter.set(
                this.get('position').x,
                this.get('position').y + (this.get('plateSeparation') / 2) + this.get('plateHeight'),
                this.get('position').z
            );
        },

        /**
         * Returns a 2D representation of the top plate.
         */
        getTopPlateRect: function() {
            return this._topPlate2D.set(
                this.get('position').x - this.get('plateWidth') / 2, 
                this.get('position').y - (this.get('plateSeparation') / 2) - this.get('plateHeight'), 
                this.get('plateWidth'), 
                this.get('plateHeight')
            );
        },

        /**
         * Returns a 2D representation of the bottom plate.
         */
        getBottomPlateRect: function() {
            return this._bottomPlate2D.set(
                this.get('position').x - this.get('plateWidth') / 2, 
                this.get('position').y + (this.get('plateSeparation') / 2), 
                this.get('plateWidth'), 
                this.get('plateHeight')
            );
        },

        //----------------------------------------------------------------------------------
        // Dielectric
        //----------------------------------------------------------------------------------

        /**
         * Convenience method for getting the dielectric constant of the current
         *   dielectric material.
         */
        getDielectricConstant: function() {
            return this.get('dielectricMaterial').get('dielectricConstant');
        },

        getDielectricWidth: function() {
            return this.get('plateWidth');
        },

        getDielectricHeight: function() {
            return this.get('plateSeparation');
        },

        getDielectricDepth: function() {
            return this.get('plateDepth');
        },

        getDielectricOffset: function() {
            return this.get('dielectricOffset');
        },

        /**
         * Gets the area of the contact between one of the plates and air.
         */
        getAirContactArea: function() {
            return this.getPlateArea() - this.getDielectricContactArea();
        },

        /**
         * Gets the area of the contact between one of the plates and the
         *   dielectric material.
         */
        getDielectricContactArea: function() {
            var absoluteOffset = Math.abs(this.get('dielectricOffset'));
            // Front * side
            var area = (this.get('plateWidth') - absoluteOffset) * this.get('plateDepth'); 
            if (area < 0)
                area = 0;
            return area;
        },

        //----------------------------------------------------------------------------------
        // Capacitance (C)
        //----------------------------------------------------------------------------------

        /**
         * In the "Multiple Capacitors" module, the user has direct control
         *   over capacitance, but no control over the capacitor's geometry
         *   or dielectric. Assume that plate width (and therefore area) is
         *   constant, and use capacitance to calculate the plate separation.
         */
        setTotalCapacitance: function(capacitance) {
            this.set('plateSeparation', Capacitor.calculatePlateSeparation(
                this.getDielectricConstant(), this.get('plateWidth'), capacitance
            ));
        },

        /**
         * Gets the total capacitance.  For the general case of a moveable
         *   dielectric, the capacitor is treated as 2 capacitors in parallel.
         *   One of the capacitors has the dielectric between its plates, the
         *   other has air.
         */
        getTotalCapacitance: function() {
             return this.getAirCapacitance() + this.getDielectricCapacitance();
        },

        /**
         * Gets the capacitance due to the part of the capacitor that is
         *   contacting air.
         */
        getAirCapacitance: function() {
            return Capacitor.getCapacitance(Constants.EPSILON_AIR, this.getAirContactArea(), this.get('plateSeparation'));
        },

        /**
         * Gets the capacitance due to the part of the capacitor that is
         *   contacting the dielectric.
         */
        getDielectricCapacitance: function() {
            return Capacitor.getCapacitance(this.getDielectricConstant(), this.getDielectricContactArea(), this.get('plateSeparation'));
        },

        /**
         * Returns whether a shape intersects the top plate shape.
         */
        intersectsTopPlate: function(shape) {
            throw 'Capacitor.intersectsTopPlate is deprecated. Use Capacitor.touchesTopPlate instead.';
        },

        /**
         * Returns whether a shape intersects the bottom plate shape.
         */
        intersectsBottomPlate: function(shape) {
            throw 'Capacitor.intersectsBottomPlate is deprecated. Use Capacitor.touchesBottomPlate instead.';
        },

        /**
         * Returns whether a circle (defined by a point and radius) is
         *   touching (on the edge of) the top plate.  It could also be
         *   thought of as whether a point is within a certain distance
         *   of the top plate.  This is a replacement for
         *   intersectsTopPlate.
         */
        touchesTopPlate: function(point, radius) {
            return this.getTopPlateRect().overlapsCircle(point.x, point.y, radius);
        },

        /**
         * Returns whether a circle (defined by a point and radius) is
         *   touching (on the edge of) the bottom plate.  It could also
         *   be thought of as whether a point is within a certain
         *   distance of the bottom plate.  This is a replacement for
         *   intersectsBottomPlate.
         */
        touchesBottomPlate: function(point, radius) {
            return this.getBottomPlateRect().overlapsCircle(point.x, point.y, radius);
        },

        /**
         * Returns whether a point is inside the Shape that is the 2D
         *   projection of the space between the capacitor plates.
         */
        isBetweenPlates: function(p) {
            return (this.isInsideDielectricBetweenPlates(p) || this.isInsideAirBetweenPlates(p));
        },

        /**
         * Returns whether a point is inside the Shape that is the 2D
         *   projection the portion of the dielectric that is between
         *   the plates.
         */
        isInsideDielectricBetweenPlates: function(p) {
            //return this.shapeCreator.createDielectricBetweenPlatesShapeOccluded().contains(this.mvt.modelToView(p));
            throw 'not yet implemented';
        },

        /**
         * Returns whether a point is inside the Shape that is the 2D
         *   projection of air between the plates
         */
        isInsideAirBetweenPlates(p) {
            //return this.shapeCreator.createAirBetweenPlatesShapeOccluded().contains(this.mvt.modelToView(p));
            throw 'not yet implemented';
        },

        //----------------------------------------------------------------------------------
        // Plate Voltage (V)
        //----------------------------------------------------------------------------------

        setPlatesVoltage: function(voltage) {
            this.set('platesVoltage', voltage);
        },

        getPlatesVoltage: function() {
            return this.get('platesVoltage');
        },

        //----------------------------------------------------------------------------------
        // Plate Charge (Q)
        //----------------------------------------------------------------------------------

        /**
         * Gets the charge for the portion of the top plate contacting the air.
         */
        getAirPlateCharge: function() {
            return this.getAirCapacitance() * this.get('platesVoltage');
        },

         /**
         * Gets the charge for the portion of the top plate contacting the dielectric.
         */
        getDielectricPlateCharge: function() {
            return this.getDielectricCapacitance() * this.getPlatesVoltage();
        },

        /**
         * Gets the total charge on the top plate.
         */
        getTotalPlateCharge: function() {
            return this.getDielectricPlateCharge() + this.getAirPlateCharge();
        },

        /**
         * Gets the excess plate charge due to plates contacting air.
         */
        getExcessAirPlateCharge: function() {
            return Capacitor.calculateExcessPlateCharge(Constants.EPSILON_AIR, this.getAirCapacitance(), this.getPlatesVoltage());
        },

        /**
         * Gets the excess plate charge due to plates contacting the dielectric.
         */
        getExcessDielectricPlateCharge: function() {
            return Capacitor.calculateExcessPlateCharge(this.getDielectricConstant(), this.getDielectricCapacitance(), this.getPlatesVoltage());
        },

        //----------------------------------------------------------------------------------
        // E-Field (E)
        //----------------------------------------------------------------------------------

        /**
         * Gets the effective (net) field between the plates.
         *   This is uniform everywhere between the plates.
         */
        getEffectiveEField: function() {
            return this.getPlatesVoltage() / this.get('plateSeparation');
        },

        /**
         * Gets the field due to the plates in the capacitor volume that contains air.
         */
        getPlatesAirEField: function() {
            return Capacitor.calculatePlatesEField(Constants.EPSILON_AIR, this.getPlatesVoltage(), this.get('plateSeparation'));
        },

        /**
         * Gets the field due to the plates in the capacitor volume that contains the dielectric.
         */
        getPlatesDielectricEField: function() {
            return Capacitor.calculatePlatesEField(this.getDielectricConstant(), this.getPlatesVoltage(), this.get('plateSeparation'));
        },

        /**
         * Gets the field due to air polarization.
         */
        getAirEField: function() {
            return this.getPlatesAirEField() - this.getEffectiveEField();
        },

        /**
         * Gets the field due to dielectric polarization.
         */
        getDielectricEField: function() {
            return this.getPlatesDielectricEField() - this.getEffectiveEField();
        }

    }, 

    /*************************************************************************
     **                                                                     **
     **                    Static Properties / Functions                    **
     **                                                                     **
     *************************************************************************/
    {

        /**
         * Calculates a plate separation from the dielectric constant, 
         *   plate width, and capacitance.
         */
        calculatePlateSeparation: function(dielectricConstant, plateWidth, capacitance) {
            return dielectricConstant * Constants.EPSILON_0 * plateWidth * plateWidth / capacitance;
        },

        /**
         * General formula for computing capacitance.
         */
        getCapacitance: function(epsilon, A, d) {
            return epsilon * Constants.EPSILON_0 * A / d;
        },

        /**
         * General solution for excess plate charge
         */
        calculateExcessPlateCharge: function(dielectricConstant, capacitance, platesVoltage) {
            if (dielectricConstant <= 0)
                throw 'Capacitor.calculateExcessPlateCharge requires dielectric constant greater than zero.';

            return ((dielectricConstant - Constants.EPSILON_VACUUM) / dielectricConstant) * capacitance * platesVoltage;
        },

        /**
         * General solution for the E-field due to some dielectric.
         */
        calculatePlatesEField: function(dielectricConstant, platesVoltage, plateSeparation) {
            if (plateSeparation <= 0)
                throw 'Plate separation must be greater than zero to calculate plates\' E-field.';

            return dielectricConstant * platesVoltage / plateSeparation;
        }


    });

    return Capacitor;
});
define(function (require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var ThreeDPositionableObject = require('common/models/positionable-object-3d');

    var Vector3 = require('common/math/vector3');
    var Vector2 = require('common/math/vector2');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * 
     */
    var Capacitor = ThreeDPositionableObject.extend({

        defaults: {
            plateWidth: 0,      // Width of the plate in meters
            plateHeight: 0,     // Height of the plate in meters
            plateDepth: 0,      // Depth of plate in meters
            plateSeparation: 0, // Distance between plates in meters

            dielectricMaterial: null, // Insulator between plates
            dielectricOffset: 0,      // The x offset of the dielectric's center, relative to the capacitor's origin

            platesVoltage: 0 // Voltage across the plates in Volts
        },

        initialize: function(attributes, options) {
            // Object caches
            this._topCenter = new Vector3();
            this._bottomCenter = new Vector3();

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
        getTopPlateCenter: function() {
            return this._bottomCenter.set(
                this.get('position').x,
                this.get('position').y + (this.get('plateSeparation') / 2) - this.get('plateHeight'),
                this.get('position').z
            );
        },

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

        /**
         * In the "Multiple Capacitors" module, the user has direct control
         *   over capacitance, but no control over the capacitor's geometry
         *   or dielectric. Assume that plate width (and therefore area) is
         *   constant, and use capacitance to calculate the plate separation.
         */
        setTotalCapacitance: function(capacitance) {
            this.set('plateSeparation', Capacitor.calculatePlateSeparation(
                this.get('dielectricConstant'), this.get('plateWidth'), capacitance
            );
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
            return Capacitor.getCapacitance(this.get('dielectricConstant'), this.getDielectricContactArea(), this.get('plateSeparation'));
        },

        /**
         * Returns whether a shape intersects the top plate shape.
         */
        intersectsTopPlate: function(shape) {
            return ShapeUtils.intersects( shape, shapeCreator.createTopPlateShapeOccluded() );
        },

        /**
         * Returns whether a shape intersects the bottom plate shape.
         */
        intersectsBottomPlate: function(shape) {
            return ShapeUtils.intersects( shape, shapeCreator.createBottomPlateShapeOccluded() );
        },

        /**
         * Returns whether a point is inside the Shape that is the 2D
         *   projection of the space between the capacitor plates.
         */
        isBetweenPlates: function(p) {
            return (this.isInsideDielectricBetweenPlates(p) || this.isInsideAirBetweenPlates(p));
        }

        /**
         * Returns whether a point is inside the Shape that is the 2D
         *   projection the portion of the dielectric that is between
         *   the plates.
         */
        isInsideDielectricBetweenPlates: function(p) {
            return shapeCreator.createDielectricBetweenPlatesShapeOccluded().contains( mvt.modelToView( p ) );
        },

        /**
         * Returns whether a point is inside the Shape that is the 2D
         *   projection of air between the plates
         */
        isInsideAirBetweenPlates(p) {
            return shapeCreator.createAirBetweenPlatesShapeOccluded().contains( mvt.modelToView( p ) );
        }

// NOT FINISHED

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
            return dielectricConstant * CLConstants.EPSILON_0 * plateWidth * plateWidth / capacitance;
        },

        /**
         * General formula for computing capacitance.
         */
        getCapacitance: function(epsilon, A, d) {
            return epsilon * Constants.EPSILON_0 * A / d;
        }

    });

    return Capacitor;
});
define(function (require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var ThreeDPositionableObject = require('common/models/positionable-object-3d');

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
        }


    });

    return Capacitor;
});
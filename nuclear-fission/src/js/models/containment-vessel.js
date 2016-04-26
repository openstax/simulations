define(function (require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var Vector2   = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');

    var Constants = require('constants');

    /**
     * This class is meant to represent a vessel in which nuclear reactions can
     *   be contained.  It is intended to be a part of the model, and have a
     *   separate view component display it to the user.
     */
    var ContainmentVessel = Backbone.Model.extend({

        defaults: {
            // Radius of the containment vessel, in femtometers.
            radius: Constants.ContainmentVessel.MINIMUM_RADIUS,
            // Boolean that controls whether it is on or off.
            enabled: false,
            // State variable that tracks if explosion has occurred.
            exploded: false
        },

        initialize: function(attributes, options) {
            // Save the original radius
            this.originalRadius = this.get('radius');

            // Number of impacts that have occurred, used to decide whether to explode.
            this.cumulativeImpactAmount = 0;

            // A rectangle that represents the location of the aperture.
            this.apertureRect = new Rectangle();
            this.updateApertureRect();

            // Cached objects
            this._nearestPoint = new Vector2();

            this.on('change:radius', this.radiusChanged);
            this.on('change:enabled', this.enabledChanged);
        },

        reset: function() {
            this.set('enabled', false);
            this.resetImpactAccumulation();
            this.set('radius', this.originalRadius);
            this.set('exploded', false);
        },

        resetImpactAccumulation: function() {
            this.cumulativeImpactAmount = 0;
        },

        /**
         * Records the impact of a nucleus or nucleon with the containment vessel.
         * If enough impacts occur, the containment vessel explodes.
         */
        recordImpact: function(impact) {
            this.cumulativeImpactAmount += impact;
            
            if (!this.get('exploded') && (this.cumulativeImpactAmount > ContainmentVessel.CONTAINMENT_EXPLOSION_THRESHOLD)) {
                this.explode();
            }
        },

        explode: function() {
            this.set('exploded', true);
            this.trigger('explode');
        },

        /**
         * This method tests whether the provided position is at the boundary of
         *   the containment vessel and not in the aperture, and thus essentially
         *   'contained'.
         */
        isPositionContained: function(x, y) {
            if (x instanceof Vector2) {
                y = x.y;
                x = x.x;
            }

            if (this.get('enabled') && !this.get('exploded')) {
                var distSqr = x * x + y * y;
                var radius = this.get('radius');

                if (distSqr >= Math.pow(radius, 2) &&
                    distSqr < Math.pow(radius + Constants.ContainmentVessel.CONTAINMENT_RANGE, 2) &&
                    !this.apertureRect.contains(x, y)
                ) {
                    return true;
                }
            }

            return false;
        },

        /**
         * Locate the nearest point at the containment radius to the provided point.
         */
        getNearestContainmentPoint: function(point){
            var angle = Math.atan2(point.y, point.x);
            return this._nearestPoint.set(
                Math.cos(angle) * this.get('radius'), 
                Math.sin(angle) * this.get('radius')
            );
        },

        getApertureHeight: function() {
            return ContainmentVessel.APERTURE_HEIGHT;
        },

        /**
         * Update the location of the aperture based on the radius of the vessel.
         *   The location of the aperture is assumed to be on the left side of
         *   the containment vessel.
         */
        updateApertureRect: function() {
            this.apertureRect.set(
                -this.get('radius') - (ContainmentVessel.APERTURE_WIDTH / 2), 
                -ContainmentVessel.APERTURE_HEIGHT / 2, 
                ContainmentVessel.APERTURE_WIDTH, 
                ContainmentVessel.APERTURE_HEIGHT
            );
        },

        enabledChanged: function(model, enabled) {
            if (enabled) {
                // The vessel is being enabled.  Reset local data.
                this.resetImpactAccumulation();
                this.set('radius', this.originalRadius);
                this.set('exploded', false);
            }
        },

        radiusChanged: function(model, radius) {
            if (radius < ContainmentVessel.MINIMUM_RADIUS) {
                this.set('radius', ContainmentVessel.MINIMUM_RADIUS);
                return;
            }

            this.updateApertureRect();
        }

    }, Constants.ContainmentVessel);

    return ContainmentVessel;
});
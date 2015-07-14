define(function (require) {

    'use strict';

    var _ = require('underscore');

    var PositionableObject3D = require('common/models/positionable-object-3d');

    /**
     * Constants
     */
    var Constants = require('constants');
    var Polarity = Constants.Polarity;

    /**
     * 
     */
    var Battery = PositionableObject3D.extend({

        defaults: _.extend({}, PositionableObject3D.prototype.defaults, {
            voltage: 0,
            polarity: 0
        }),

        initialize: function(attributes, options) {
            PositionableObject3D.prototype.initialize.apply(this, [attributes, options]);

            this.on('change:voltage', this.voltageChanged);

            this.voltageChanged(this, this.get('voltage'));
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
         * Respond to changes in voltage and update the polarity.
         */
        voltageChanged: function(battery, voltage) {
            this.set('polarity', Battery.calculatePolarity(voltage));
        },

        /**
         * Returns whether a shape intersects the top plate shape.
         */
        intersectsTopTerminal: function(shape) {
            throw 'Battery.intersectsTopTerminal is deprecated. Use Battery.touchesTopTerminal instead.';
        },

        /**
         * Returns whether a shape intersects the bottom plate shape.
         */
        intersectsBottomTerminal: function(shape) {
            throw 'Battery.intersectsBottomTerminal is deprecated. Use Battery.touchesBottomTerminal instead.';
        },

        /**
         * Returns whether a circle (defined by a point and radius) is
         *   touching the top terminal.  It could also be thought of as
         *   whether a point is within a certain distance of the top
         *   terminal. This is a replacement for intersectsTopTerminal.
         */
        touchesTopTerminal: function(point, radius) {
            return this.getTopPlateRect().overlapsCircle(point.x, point.y, radius);
        },

        /**
         * Returns whether a circle (defined by a point and radius) is
         *   touching the bottom terminal.  It could also be thought of
         *   as whether a point is within a certain distance of the
         *   bottom terminal.  This is a replacement for
         *   intersectsBottomTerminal.
         */
        touchesBottomTerminal: function(point, radius) {
            return this.getBottomPlateRect().overlapsCircle(point.x, point.y, radius);
        },

        getBodyWidth: function() {
            return Battery.BODY_WIDTH;
        },

        getBodyHeight: function() {
            return Battery.BODY_HEIGHT;
        },

        getPositiveTerminalCylinderHeight: function() {
            return Battery.POSITIVE_TERMINAL_CYLINDER_HEIGHT;
        },

        getPositiveTerminalEllipseSize: function() {
            return Battery.POSITIVE_TERMINAL_ELLIPSE_SIZE;
        },

        getNegativeTerminalSize: function() {
            return Battery.NEGATIVE_TERMINAL_ELLIPSE_SIZE;
        },

        /*
         * Gets the offset of the top terminal from the battery's origin, in model coordinates (meters).
         * This offset depends on the polarity.
         */
        getTopTerminalYOffset: function() {
            if (this.get('polarity') === Polarity.POSITIVE)
                return Battery.POSITIVE_TERMINAL_Y_OFFSET;
            else
                return Battery.NEGATIVE_TERMINAL_Y_OFFSET;
        },

        /*
         * Gets the offset of the bottom terminal from the battery's origin, in model coordinates (meters).
         * We don't need to account for the polarity since the bottom terminal is never visible.
         */
        getBottomTerminalYOffset: function() {
            return Battery.BODY_HEIGHT / 2;
        }

    }, 

    /*************************************************************************
     **                                                                     **
     **                    Static Properties / Functions                    **
     **                                                                     **
     *************************************************************************/
    _.extend({

        calculatePolarity: function(voltage) {
            return (voltage >= 0) ? Polarity.POSITIVE : Polarity.NEGATIVE;
        }

    }, Constants.Battery));

    return Battery;
});
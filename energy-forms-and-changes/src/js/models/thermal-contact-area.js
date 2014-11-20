define(function (require) {

    'use strict';

    var _         = require('underscore');
    var Rectangle = require('rectangle-node');

    Rectangle.prototype.intersection = require('common/math/rectangle-intersection');

    /**
     * Constants
     */
    // Threshold of distance for determining whether two areas are in contact.
    var TOUCH_DISTANCE_THRESHOLD = 0.001; // In meters.

    /**
     * Create a new ThermalConcactArea object
     */
    var ThermalContactArea = function(bounds, supportsImmersion) {
        this.bounds = new Rectangle(bounds);
        this.supportsImmersion = supportsImmersion;
    };

    /**
     * Functions
     */
    _.extend(ThermalContactArea.prototype, {

        /**
         * Returns a rectangle
         */
        getBounds: function() {
            return this.bounds;
        },

        /**
         * Takes either a rectangle or x
         */
        setBounds: function(x, y, w, h) {
            if (x instanceof Rectangle) {
                this.x = x.x;
                this.y = x.y;
                this.w = x.w;
                this.h = x.h;
            }
            else {
                this.x = x;
                this.y = y;
                this.w = w;
                this.h = h;
            }
        },

        /**
         * Get the amount of thermal contact that exists between this and another
         * thermal area.  Since thermal contact areas are 2D, the amount of
         * contact is a 1D quantity.  For example, when a rectangle is sitting
         * on top of another that is the same width, the contact length is the
         * width of the shared edge.
         *
         * @param that Other thermal contact area.
         * @return Length of contact
         */
        getThermalContactLength: function(that) {
            var xOverlap = this.getHorizontalOverlap(this.bounds, that.bounds);
            var yOverlap = this.getVerticalOverlap(  this.bounds, that.bounds);

            var contactLength = 0;
            if (xOverlap > 0 && yOverlap > 0) {
                // One of the areas is overlapping another.  This should be an
                //   'immersion' situation, i.e. one is all or partially immersed in
                //   the other.
                if (this.supportsImmersion || that.supportsImmersion) {
                    contactLength = this._getImmersedThermalContactLength(that);
                }
                else if (yOverlap > 1E-6 && xOverlap > 1E-6) {
                    // This shouldn't occur, but it practice it sometimes does due
                    //   to floating point tolerances.  Print out an error if a
                    //   threshold is exceeded.  The threshold value was determined
                    //   by testing.
                    console.error('ThermalContactArea - Error: Double overlap detected in case where neither energy container supports immersion.  Ignoring.');
                    console.error('yOverlap = ' + yOverlap);
                    console.error('xOverlap = ' + xOverlap);
                }
            }
            // There is overlap in one dimension but not the other, so test to
            //   see if the two containers are touching.
            else if (xOverlap > 0 &&
                Math.abs(this.bounds.top() - that.bounds.bottom()) < TOUCH_DISTANCE_THRESHOLD ||
                Math.abs(this.bounds.bottom() - that.bounds.top()) < TOUCH_DISTANCE_THRESHOLD) {
                contactLength = xOverlap;
            }
            else if (yOverlap > 0 &&
                     Math.abs(this.bounds.right() - that.bounds.left()) < TOUCH_DISTANCE_THRESHOLD ||
                     Math.abs(this.bounds.left() - that.bounds.right()) < TOUCH_DISTANCE_THRESHOLD) {
                contactLength = xOverlap;
            }

            return contactLength;
        },

        _getImmersedThermalContactLength: function(that) {
            var immersionRect = this.bounds.intersection(that.bounds);
            var contactLength = immersionRect.w * 2 + immersionRect.h * 2;

            if (immersionRect.w !== this.bounds.w && immersionRect.w !== that.bounds.w) {
                // Not fully overlapping in X direction, so adjust contact length accordingly.
                contactLength -= immersionRect.h;
            }
            if (immersionRect.h !== this.bounds.h && immersionRect.h !== that.bounds.h) {
                // Not fully overlapping in Y direction, so adjust contact length accordingly.
                contactLength -= immersionRect.w;
            }

            return contactLength;
        },

        // Convenience method for determining overlap of rectangles in X dimension.
        getHorizontalOverlap: function(r1, r2) {
            var lowestMax = Math.min( r1.right(), r2.right() );
            var highestMin = Math.max( r1.left(), r2.left() );
            return Math.max(lowestMax - highestMin, 0);
        },

        // Convenience method for determining overlap of rectangles in X dimension.
        getVerticalOverlap: function(r1, r2) {
            var lowestMax = Math.min(r1.top(), r2.top());
            var highestMin = Math.max(r1.bottom(), r2.bottom());
            return Math.max(lowestMax - highestMin, 0);
        }

    });

    return ThermalContactArea;
});

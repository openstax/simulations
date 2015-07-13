define(function(require) {

    'use strict';
    
    var WireView = require('views/wire');

    /**
     * The top wire that connects the battery to the capacitors.
     */
    var BatteryToCapacitorsBottomWireView = WireView.extend({

        /**
         * Returns the y-value that should be used for sorting. Calculates the
         *   maximum y for all segment endpoints.
         */
        getYSortValue: function() {
            var maxY = Numbers.NEGATIVE_INFINITY;
            this.models.segments.each(function(segment) {
                maxY = Math.max(maxY, segment.get('startY'));
                maxY = Math.max(maxY, segment.get('endY'));
            });
            return maxY;
        }

    });

    return BatteryToCapacitorsBottomWireView;
});
define(function(require) {

    'use strict';
    
    var WireView = require('views/wire');

    /**
     * The top wire that connects the battery to the capacitors.
     */
    var BatteryToCapacitorsTopWireView = WireView.extend({

        /**
         * Returns the y-value that should be used for sorting. Calculates the
         *   minimum y for all segment endpoints.
         */
        getYSortValue: function() {
            var minY = Numbers.POSITIVE_INFINITY;
            this.models.segments.each(function(segment) {
                minY = Math.min(minY, segment.get('startY'));
                minY = Math.min(minY, segment.get('endY'));
            });
            return minY;
        }

    });

    return BatteryToCapacitorsTopWireView;
});
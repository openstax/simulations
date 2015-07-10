define(function (require) {

    'use strict';

    var BatteryToCapacitorsWire = require('models/wire/battery-to-capacitors');

    /**
     * Constants
     */
    var Constants = require('constants');
    var ConnectionPoint = Constants.ConnectionPoint;
    
    /*
     * Connects the bottom of the battery (B) to the bottoms of N capacitors (C1...Cn).
     *   Constructor args are described in superclass constructor.
     */
    var BatteryToCapacitorsBottomWire = BatteryToCapacitorsWire.extend({

        initialize: function(attributes, options) {
            options.connectionPoint = ConnectionPoint.BOTTOM;

            BatteryToCapacitorsWire.prototype.initialize.apply(this, [attributes, options]);

            /* Note: there was additional functionality in the original where it listened
             *   for changes in the capacitor plate size and recalculated the shape of
             *   the wire segment, but because I'm not using the projected shapes in the
             *   model, I'm omitting it.  They wanted to make the wire shape smaller
             *   because of occlusion of the bottom plate, but I don't care about that
             *   because I will just layer the bottom plate over it in the view.
             */ 
        }

    });


    return BatteryToCapacitorsBottomWire;
});
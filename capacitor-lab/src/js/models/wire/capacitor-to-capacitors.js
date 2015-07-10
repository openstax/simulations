define(function (require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var Vector2 = require('common/math/vector2');

    var Wire = require('models/wire');
    var WireSegment = require('models/wire-segment');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * A specialized wire, found in all of our circuits, that connects the bottom plate
     *   of one capacitor (C1) to the top plates of N other capacitors (C2,C3,...,Cn).
     * 
     *   C1
     *   |
     *   |-----|--...--|
     *   |     |       |
     *   C2   C3      Cn
     * 
     */
    var CapacitorToCapacitorsWire = Wire.extend({

        /**
         * Initializes a new BatteryToCapacitorsWires object.  
         *
         *   Required options: {
         *      topCapacitor:     capacitor object,
         *      bottomCapacitors: array of capacitor objects
         *   }
         *   
         */
        initialize: function(attributes, options) {
            Wire.prototype.initialize.apply(this, [attributes, options]);

            var topCapacitor = options.topCapacitor;
            var bottomCapacitors = options.bottomCapacitors;

            // Vertical segment connecting top capacitor (C1) to leftmost bottom capacitor (C2)
            this.addSegment(new WireSegment.CapacitorToCapacitorWireSegment({
                topCapacitor: topCapacitor,
                bottomCapacitors: bottomCapacitors
            }));

            if (bottomCapacitors.length > 1) {
                // Horizontal segment above leftmost (C2) to rightmost (Cn) bottom capacitors
                var xStart = topCapacitor.getX();
                var xEnd = bottomCapacitors[bottomCapacitors.length - 1].getX();
                var y = topCapacitor.getY() + (bottomCapacitors[0].getY() - topCapacitor.getY()) / 2;
                
                this.addSegment(new WireSegment({
                    startX: xStart,
                    startY: y,
                    endX: xEnd,
                    endY: y
                }));

                // Vertical segments from horizontal segment down to each bottom capacitor (C2...Cn)
                for (var i = 1; i < bottomCapacitors.length; i++) {
                    var x = bottomCapacitors[i].getX();
                    this.addSegment(new WireSegment.CapacitorTopWireSegment({
                        capacitor: bottomCapacitors[i],
                        endX: x,
                        endY: y
                    }));
                }
            }
        },

    });


    return CapacitorToCapacitorsWire;
});
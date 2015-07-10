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
    var ConnectionPoint = {
        TOP: 1,
        BOTTOM: 2
    };

    /**
     * Base class for any wire that connects a battery (B) to one of more capacitors (C1...Cn).
     * 
     * For the "top" subclass, the wire looks like this:
     * 
     *   |-----|------|--...--|
     *   |     |      |       |
     *   B     C1    C2       Cn
     * 
     * For the "bottom" subclass, the wire looks like this:
     * 
     *   B     C1    C2       Cn
     *   |     |      |       |
     *   |-----|------|--...--|
     * 
     */
    var BatteryToCapacitorsWire = Wire.extend({

        /**
         * Initializes a new BatteryToCapacitorsWires object.  
         *
         *   Required options: {
         *      connectionPoint: either ConnectionPoint.TOP or ConnectionPoint.BOTTOM,
         *      wireExtent:      number,
         *      battery:         battery object,
         *      capacitors:      array of capacitor objects
         *   }
         *   
         */
        initialize: function(attributes, options) {
            Wire.prototype.initialize.apply(this, [attributes, options]);

            var connectionPoint = options.connectionPoint;
            var wireExtent      = options.wireExtent;
            var battery         = options.battery;
            var capacitors      = options.capacitors;

            // Y coordinates of the horizontal wire
            var horizontalY = BatteryToCapacitorsWire.getHorizontalY(connectionPoint, wireExtent, battery, capacitors);

            // Horizontal segment connecting battery (B) to the rightmost capacitor (Cn)
            var rightmostCapacitor = capacitors[capacitors.length - 1];
            var leftCorner = new Vector2(battery.x, horizontalY);
            var rightCorner = new Vector2(rightmostCapacitor.getX(), leftCorner.y);

            this.addSegment(BatteryToCapacitorsWire.getBatteryWireSegment(connectionPoint, battery, leftCorner));
            this.addSegment(new WireSegment({ startX: leftCorner.x, startY: leftCorner.y, endX: rightCorner.x, endY: rightCorner.y }));
            this.addSegment(BatteryToCapacitorsWire.getCapacitorWireSegment(connectionPoint, rightmostCapacitor, rightCorner));

            // Add vertical segments for all capacitors (C1...Cn-1) in between the
            //   battery (B) and rightmost capacitor (Cn)
            for (var i = 0; i < capacitors.length - 1; i++) {
                var capacitor = capacitors[i];
                var startPoint = new Vector2(capacitor.getX(), horizontalY);
                this.addSegment(BatteryToCapacitorsWire.getCapacitorWireSegment(connectionPoint, capacitor, startPoint));
            }
        },

    }, {

        /**
         * Gets the Y coordinate of the horizontal wire. It extends wireExtent
         *   distance above/below the capacitor that is closest to the wire.
         */
        getHorizontalY: function(connectionPoint, capacitors, wireExtent) {
            var y = capacitors[0].getY();
            if (connectionPoint === ConnectionPoint.TOP) {
                for (var i = 0; i < capacitors.length; i++)
                    y = Math.min(y, capacitors[i].getY() - wireExtent);
            }
            else {
                for (var i = 0; i < capacitors.length; i++)
                    y = Math.min(y, capacitors[i].getY() + wireExtent);
            }
            return y;
        },

        /**
         * Gets a wire segment that attaches to the specified terminal (top or
         *   bottom) of a battery.
         */
        getBatteryWireSegment: function(connectionPoint, battery, endPoint) {
            if (connectionPoint === ConnectionPoint.TOP) {
                return new WireSegment.BatteryTopWireSegment({
                    battery: battery,
                    endX: endPoint.x,
                    endY: endPoint.y
                });
            }
            else {
                return new WireSegment.BatteryBottomWireSegment({
                    battery: battery,
                    endX: endPoint.x,
                    endY: endPoint.y
                });
            }
        },

        /**
         * Gets a wire segment that attaches to the specified plate (top or
         *   bottom) of a capacitor.
         */
        getCapacitorWireSegment: function(connectionPoint, capacitor, endPoint) {
            if (connectionPoint === ConnectionPoint.TOP) {
                return new WireSegment.CapacitorTopWireSegment({
                    capacitor: capacitor,
                    endX: endPoint.x,
                    endY: endPoint.y
                });
            }
            else {
                return new WireSegment.CapacitorBottomWireSegment({
                    capacitor: capacitor,
                    endX: endPoint.x,
                    endY: endPoint.y
                });
            }
        }

    });

    /**
     * Connects the top of the battery (B) to the tops of N capacitors (C1...Cn).
     *   Constructor args are described in superclass constructor.
     */
    BatteryToCapacitorsWire.WireBatteryToCapacitorsTop = BatteryToCapacitorsWire.extend({

        initialize: function(attributes, options) {
            options.connectionPoint = ConnectionPoint.TOP;

        	BatteryToCapacitorsWire.prototype.initialize.apply(this, [attributes, options]);
        }

    });

    /*
     * Connects the bottom of the battery (B) to the bottoms of N capacitors (C1...Cn).
     *   Constructor args are described in superclass constructor.
     */
    BatteryToCapacitorsWire.WireBatteryToCapacitorsBottom = BatteryToCapacitorsWire.extend({

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


    return BatteryToCapacitorsWire;
});
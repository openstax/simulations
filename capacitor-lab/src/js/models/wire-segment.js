define(function (require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var Vector2 = require('common/math/vector2');

    /**
     * Constants
     */
    var Constants = require('constants');
    var Polarity = Constants.Polarity;

    /**
     * Represents a straight segment of wire. One or more segments are joined to
     *   create a wire.
     */
    var WireSegment = Backbone.Model.extend({

        defaults: {
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 0
        },

        touches: function(point, radius) {
            throw 'Not yet implemented.';
        }

    });

    /**
     * Any wire segment that is connected to a battery.
     */
    WireSegment.BatteryWireSegment = WireSegment.extend({

        defaults: _.extend({}, WireSegment.prototype.defaults, {
            battery: null,
            startYOffset: 0
        }),

        initialize: function(attributes, options) {
            this.listenTo(this.get('battery'), 'change:polarity', this.update);
            this.update();
        },

        update: function() {}

    });

    /**
     * Wire segment whose start point is connected to the top terminal of a
     *   battery. Adjusts the start point when the battery's polarity changes.
     */
    WireSegment.BatteryTopWireSegment = BatteryWireSegment.extend({

        update: function() {
            this.set('startX', this.get('battery').getX());
            this.set('startY', 
                this.get('battery').getY() + 
                this.get('battery').getTopTerminalYOffset() - 
                this.get('startYOffset')
            );
        }

    });

    /**
     * Wire segment whose start point is connected to the bottom terminal of
     *   a battery.  Adjusts the start point when the battery's polarity
     *   changes.
     */
    WireSegment.BatteryBottomWireSegment = BatteryWireSegment.extend({

        update: function() {
            this.set('startX', this.get('battery').getX());
            this.set('startY', 
                this.get('battery').getY() + 
                this.get('battery').getTopTerminalYOffset() + 
                this.get('startYOffset')
            );
        }

    });

    /**
     * Any wire segment that is connected to one capacitor.
     */
    WireSegment.CapacitorWireSegment = WireSegment.extend({

        defaults: _.extend({}, WireSegment.prototype.defaults, {
            capacitor: null
        }),

        initialize: function(attributes, options) {
            this.listenTo(this.get('capacitor'), 'change:plateSeparation', this.update);
            this.update();
        },

        update: function() {}

    });

    /**
     * Wire segment whose start point is connected to the top plate of a
     *   capacitor. Adjusts the start point when the plate separation changes.
     */
    WireSegment.CapacitorTopWireSegment = CapacitorWireSegment.extend({

        update: function() {
            this.set('startX', this.get('capacitor').getTopPlateCenter().x);
            this.set('startY', this.get('capacitor').getTopPlateCenter().y);
        }

    });

    /**
     * Wire segment whose start point is connected to the bottom plate of a
     *   capacitor. Adjusts the start point when the plate separation changes.
     */
    WireSegment.CapacitorBottomWireSegment = CapacitorWireSegment.extend({

        update: function() {
            this.set('startX', this.get('capacitor').getBottomPlateCenter().x);
            this.set('startY', this.get('capacitor').getBottomPlateCenter().y);
        }

    });

    /**
     * Wire segment that connects the bottom plate of one capacitor to the top
     *   plate of another capacitor. Adjusts the start and end points when the
     *   plate separations change.
     */
    WireSegment.CapacitorToCapacitorWireSegment = WireSegment.extend({

        defaults: _.extend({}, WireSegment.prototype.defaults, {
            topCapacitor: null,
            bottomCapacitor: null
        }),

        initialize: function(attributes, options) {
            this.listenTo(this.get('topCapacitor'),    'change:plateSeparation', this.update);
            this.listenTo(this.get('bottomCapacitor'), 'change:plateSeparation', this.update);
            this.update();
        },

        update: function() {
            this.set('startX', this.get('topCapacitor').getBottomPlateCenter().x);
            this.set('startY', this.get('topCapacitor').getBottomPlateCenter().y);
            this.set('endX', this.get('bottomCapacitor').getTopPlateCenter().x);
            this.set('endY', this.get('bottomCapacitor').getTopPlateCenter().y);
        }

    });


    return WireSegment;
});
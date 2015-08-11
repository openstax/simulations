define(function (require) {

    'use strict';

    var _   = require('underscore');
    var SAT = require('sat');

    var BoxShapeCreator = require('shape-creators/box');

    var Battery = require('models/battery');


    var BatteryShapeCreator = function(battery, mvt) {
        BoxShapeCreator.apply(this, [mvt]);

        this.battery = battery;
    };

    /**
     * Instance functions
     */
    _.extend(BatteryShapeCreator.prototype, BoxShapeCreator.prototype, {

        createTopTerminalSilhouette: function() {
            var pos = this.battery.get('position');
            
            var w = Battery.TOP_TERMINAL_WIDTH;
            var h = Battery.TOP_TERMINAL_HEIGHT;

            var p0 = this._p0.set(this.mvt.modelToView(pos.x - w / 2, pos.y + Battery.TOP_TERMINAL_Y_OFFSET - (h / 2), 0));
            var p1 = this._p1.set(this.mvt.modelToView(pos.x + w / 2, pos.y + Battery.TOP_TERMINAL_Y_OFFSET - (h / 2), 0));
            var p2 = this._p2.set(this.mvt.modelToView(pos.x + w / 2, pos.y + Battery.TOP_TERMINAL_Y_OFFSET + (h / 2), 0));
            var p3 = this._p3.set(this.mvt.modelToView(pos.x - w / 2, pos.y + Battery.TOP_TERMINAL_Y_OFFSET + (h / 2), 0));
            
            var polygon = new SAT.Polygon(new SAT.Vector(), [
                new SAT.Vector(p0.x, p0.y),
                new SAT.Vector(p1.x, p1.y),
                new SAT.Vector(p2.x, p2.y),
                new SAT.Vector(p3.x, p3.y)
            ]);

            return polygon;
        }

    });

    return BatteryShapeCreator;
});


define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2        = require('common/math/vector2');
    var PiecewiseCurve = require('common/math/piecewise-curve');

    var PathBranch = require('models/components/path-branch');

    var Constants = require('constants');

    /**
     * The filament in a light bulb
     */
    var Filament = PathBranch.extend({

        defaults: _.extend({}, PathBranch.prototype.defaults, {
            pivotToResistorDY: undefined, // The pin is the assumed origin.
            resistorWidth: undefined,
            connectAtRight: true
        }),

        initialize: function(attributes, options) {
            this.northDir = new Vector2();
            this.eastDir  = new Vector2();
            this.pin      = new Vector2();

            // Cached objects
            this._e = new Vector2();
            this._n = new Vector2();

            PathBranch.prototype.initialize.apply(this, [attributes, options]);

            this.recompute();
        },

        startJunctionChanged: function(models, startJunction) {
            PathBranch.prototype.startJunctionChanged.apply(this, arguments);
            this.recompute();
        },

        endJunctionChanged: function(models, endJunction) {
            PathBranch.prototype.endJunctionChanged.apply(this, arguments);
            this.recompute();
        },

        getPoint: function(east, north) {
            var e = this._e.set(this.eastDir).scale(east);
            var n = this._n.set(this.northDir).scale(north);
            var sum = e.add(n);
            return sum.add(this.pin);
        },

        getVector: function(east, north) {
            var e = this._e.set(this.eastDir).scale(east);
            var n = this._n.set(this.northDir).scale(north);
            return e.add(n);
        },

        getPath: function() {
            var curve = new PiecewiseCurve();
            curve.moveTo(this.segments[0].start);

            for (var i = 0; i < this.segments.length; i++)
                curve.lineTo(this.segments[i].end.x, this.segments[i].end.y);
            
            return curve;
        },

        isNaN: function(vector) {
            return isNaN(vector.x) || isNaN(vector.y);
        },

        recompute: function() {
            if (!this.get('startJunction') || !this.get('endJunction'))
                return;
            
            var tilt = Constants.TILT;
            if (!this.get('connectAtRight'))
                tilt = -tilt;
            
            this.northDir
                .set(this.get('endJunction').get('position'))
                .sub(this.get('startJunction').get('position'))
                .normalize()
                .rotate(-tilt);

            this.eastDir
                .set(this.northDir.y, -this.northDir.x) // Perpendicular to northDir
                .normalize();

            if (!this.get('connectAtRight'))
                this.eastDir.scale(-1);
            
            if (this.isNaN(this.northDir) || this.isNaN(this.eastDir)) {
                console.error('Bulb basis set is not a number.');
                return;
            }

            this.pin.set(this.get('endJunction').get('position'));

            var firstPoint = new Vector2(this.getPoint(-this.get('resistorWidth') * 0.35, Constants.BULB_DIMENSION.height * 0.4));
            if (isNaN(firstPoint.x) || isNaN(firstPoint.y))
                throw 'Point was nan: ' + firstPoint;
            
            var origin = this.get('startJunction').get('position');
            this.reset(this.getVector(0.01, 0.04).add(origin), firstPoint);
            this.appendPointFromVector(this.getVector(-this.get('resistorWidth') * 0.15,  Constants.BULB_DIMENSION.height * 0.25));
            this.appendPointFromVector(this.getVector( this.get('resistorWidth') * 0.68, -Constants.BULB_DIMENSION.height * 0.05));
            this.appendPointFromVector(this.getVector(-this.get('resistorWidth') * 0.35, -Constants.BULB_DIMENSION.height * 0.58));
            this.appendPoint(this.pin);

            this.trigger('recomputed');
        },

        indexOf: function(seg) {
            return this.segments.indexOf(seg);
        }

    });


    return Filament;
});
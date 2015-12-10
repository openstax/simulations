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
            shellJunction: undefined,
            tailJunction: undefined,
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
            this.get('tailJunction').set(startJunction);
            this.recompute();
        },

        endJunctionChanged: function(models, endJunction) {
            PathBranch.prototype.endJunctionChanged.apply(this, arguments);
            this.get('shellJunction').set(endJunction);
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
            if (!this.get('tailJunction') || !this.get('shellJunction'))
                return;
            
            var tilt = Constants.TILT;
            if (!this.get('connectAtRight'))
                tilt = -tilt;
            
            this.northDir
                .set(this.get('shellJunction').get('position'))
                .sub(this.get('tailJunction').get('position'))
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

            this.pin.set(this.get('shellJunction').get('position'));

            var pt = this.getPoint(-this.get('resistorWidth') / 2, this.get('pivotToResistorDY'));
            if (isNaN(pt.x) || isNaN(pt.y))
                throw 'Point was nan: ' + pt;
            
            this.reset(this.get('tailJunction').get('position'), pt);
            this.addPoint(this.getVector(-this.get('resistorWidth') / 4, Constants.BULB_DIMENSION.height * 0.2));
            this.addPoint(this.getVector(this.get('resistorWidth') * 0.68, 0));
            this.addPoint(this.pin);
        },

        indexOf: function(seg) {
            return this.segments.indexOf(seg);
        }

    });


    return Filament;
});
define(function (require) {

    'use strict';

    var Body = require('models/body');

    var Disk = Body.extend({

        defaults: _.extend({}, Body.prototype.defaults, {
            radius: 0
        }),

        /**
         * Returns center of mass of the disk.
         */
        getCenterOfMass: function() {
            return this.get('position');
        },

        /**
         * Calculates and returns the moment of inertia.
         */
        getMomentOfInertia: function() {
            // PhET: MR^2 / 2. We assume mass is equal to area
            var radius = this.get('radius');
            var mass = radius * radius * Math.PI;
            return radius * radius * mass / 2;
        }

    });

    return Disk;
});

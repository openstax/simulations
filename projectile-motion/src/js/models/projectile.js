define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    var Projectile = Backbone.Model.extend({

        defaults: {
            mass: 2,
            diameter: 0.3,
            dragCoefficient: 1,
            x: 0,
            y: 0,
            rotation: 0,   // In radians
            atRest: false  // Whether the projectile has been launched and is now at rest
        },

        initialize: function(attributes, options) {
            // Set area based on cross-sectional diameter
            this.set('area', Math.PI * this.get('diameter') * this.get('diameter') / 4);
        },

        reset: function() {
            this.set('x', 0);
            this.set('y', 0);
            this.set('rotation', 0);
            this.set('atRest', false);
        }

    }, {
        getName: function() { return 'generic projectile'; }
    });

    return Projectile;
});

define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    var Projectile = Backbone.Model.extend({

        defaults: {
            mass: 2,
            diameter: 0.3,
            dragCoefficient: 1,
            x: 0,
            y: 0
        },

        initialize: function(attributes, options) {
            // Set area based on cross-sectional diameter
            this.set('area', Math.PI * this.get('diameter') * this.get('diameter') / 4);
        }

    }, {
        getName: function() { return 'generic projectile'; }
    });

    return Projectile;
});

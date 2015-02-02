define(function (require) {

    'use strict';

    var Backbone = require('backbone');
    var Rectangle = require('common/math/rectangle');

    var Projectile = Backbone.Model.extend({

        defaults: {
            mass: 2,
            diameter: 0.1,
            dragCoefficient: 1,
            x: 0,
            y: 0,
            rotation: 0,   // In radians
            atRest: false  // Whether the projectile has been launched and is now at rest
        },

        initialize: function(attributes, options) {
            // Set area based on cross-sectional diameter
            this.set('area', Math.PI * this.get('diameter') * this.get('diameter') / 4);
            this._boundingRect = new Rectangle();
        },

        reset: function() {
            this.set('x', 0);
            this.set('y', 0);
            this.set('rotation', 0);
            this.set('atRest', false);
        },

        bounds: function() {
            var radius = this.get('diameter') / 2;
            return this._boundingRect.set(
                this.get('x') - radius,
                this.get('y') - radius,
                this.get('diameter'),
                this.get('diameter')
            );
        }

    }, {
        getName: function() { return 'generic projectile'; }
    });

    return Projectile;
});

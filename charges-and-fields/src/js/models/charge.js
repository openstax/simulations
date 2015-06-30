define(function (require) {

    'use strict';

    var _ = require('underscore');

    var PositionableObject = require('common/models/positionable-object');

    var Charge = PositionableObject.extend({

        defaults: _.extend({}, PositionableObject.prototype.defaults, {
            q: 0,         // Value of charge
            magnitude: 1, // Magnitude of charge
            sign: 1       // Sign is +1 (positive) or -1 (negative)
        }),

        initialize: function(attributes, options) {
            PositionableObject.prototype.initialize.apply(this, arguments);

            this.on('change:q', this.chargeChanged);
        },

        setCharge: function(q) {
            this.set('q', q);
        },

        changeSign: function() {
            this.set('q', -1 * this.get('q'));
        },

        chargeChanged: function(model, q) {
            this.set('magnitude', Math.abs(q));
            this.set('sign', (q === 0) ? 0 : q / this.get('magnitude'));
        }

    });

    return Charge;
});

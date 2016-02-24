define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var Particle = require('./particle');

    /**
     * An electrode is a line between two endpoints. Its location is considered to be
     *   the midpoint between the two endpoints.
     * 
     * An electrode has potential and can notify listeners when its potential changes.
     */
    var Electrode = Particle.extend({

        defaults: _.extend({}, Particle.prototype.defaults, {
            potential: 0,
            point1: undefined,
            point2: undefined
        }),

        initialize: function(attributes, options) {
            Particle.prototype.initialize.apply(this, [attributes, options]);

            this.set('point1', new Vector2(this.get('point1')));
            this.set('point2', new Vector2(this.get('point2')));
        },

        

    });

    return Electrode;
});
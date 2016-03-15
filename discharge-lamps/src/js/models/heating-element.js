define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Particle = require('common/mechanics/models/particle');

    /**
     * A heating element
     */
    var HeatingElement = Particle.extend({

        defaults: _.extend({}, Particle.prototype.defaults, {
            enabled: true,
            temperature: 0
        })

    });


    return HeatingElement;
});

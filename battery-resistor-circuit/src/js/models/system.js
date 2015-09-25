define(function (require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    /**
     * Class for holding info about a system
     */
    var System = Backbone.Model.extend({

        initialize: function(attributes, options) {
            // Particles that hold charge and can move around in the system
            this.particles = [];

            // Laws
            this.laws = [];
        },

        addParticle: function(particle) {
            this.particles.push(particle);
        },

        addLaw: function(law) {
            this.laws.push(law);
        }

    });

    return System;
});

define(function (require) {

    'use strict';

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
        },

        update: function(deltaTime) {
            for (var i = 0; i < this.laws.length; i++)
                this.laws[i].update(deltaTime, this);
        }

    });

    return System;
});

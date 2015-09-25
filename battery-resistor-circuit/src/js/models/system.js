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

        removeParticle: function(particle) {
            for (var i = this.particles.length - 1; i >= 0; i--) {
                if (this.particles[i] === particle) {
                    this.particles.splice(i, 1);
                    return;
                }
            }
        },

        addLaw: function(law) {
            this.laws.push(law);
        },

        removeLaw: function(law) {
            for (var i = this.laws.length - 1; i >= 0; i--) {
                if (this.laws[i] === law) {
                    this.laws.splice(i, 1);
                    return;
                }
            }
        },

        update: function(deltaTime) {
            for (var i = 0; i < this.laws.length; i++)
                this.laws[i].update(deltaTime, this);
        }

    });

    return System;
});

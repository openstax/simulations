define(function (require) {

    'use strict';

    var Backbone = require('backbone');
    var Constants = require('constants');

    var RayGun = Backbone.Model.extend({

        defaults: {
            on: false,
            dtSinceGunFired: 0,
            dtPerGunFired: 0,
            particles: []
        },

        initialize: function(attributes, options) {

        },

        reset: function() {

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

        update: function(deltaTime) {


        }


    }, Constants.RayGun);

    return RayGun;
});

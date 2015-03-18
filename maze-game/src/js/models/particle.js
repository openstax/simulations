define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * The player character that looks like a generic round particle
     */
    var Particle = Backbone.Model.extend({

        defaults: {
            x: 0,
            y: 0,

            vx: 0,
            vy: 0,
            
            ax: 0,
            ay: 0,

            radius: Constants.PARTICLE_RADIUS,

            colliding: false
        },

        initialize: function(attributes, options) {
    
        },

    });

    return Particle;
});

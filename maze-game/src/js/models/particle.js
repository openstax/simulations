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

            mode: 0,

            colliding: false
        },

        initialize: function(attributes, options) {
    
        },

        update: function(time, deltaTime) {
            if (this.get('mode') === Particle.MODE_VELOCITY) {
                this.set('x', this.get('x') + this.get('vx') * deltaTime);
                this.set('y', this.get('y') + this.get('vy') * deltaTime);
            }
            else if (this.get('mode') === Particle.MODE_ACCELERATION) {
                var vx = this.get('vx') + this.get('ax') * deltaTime;
                var vy = this.get('vy') + this.get('ay') * deltaTime;
                this.set('x', this.get('x') + vx * deltaTime + 0.5 * this.get('ax') * deltaTime * deltaTime);
                this.set('y', this.get('y') + vy * deltaTime + 0.5 * this.get('ay') * deltaTime * deltaTime);
                this.set('vx', vx);
                this.set('vy', vy); 
            }
        }

    }, {

        MODE_POSITION: 0,
        MODE_VELOCITY: 1,
        MODE_ACCELERATION: 2

    });

    return Particle;
});

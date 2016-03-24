define(function (require) {

    'use strict';

    var Backbone = require('backbone');
    var Constants = require('constants');
    var Vector2 = require('common/math/vector2');

    var RayGun = Backbone.Model.extend({

        defaults: {
            on: false,
            dtSinceGunFired: 0,
            center: {
                x: 0,
                y: 0
            }
        },

        initialize: function(attributes, options) {
            Backbone.Model.prototype.initialize.apply(this, [attributes, options]);
            this.alphaParticles = attributes.alphaParticles;
        },

        update: function(deltaTime, bounds, alphaParticleEnergy) {

            var initialSpeed = alphaParticleEnergy;
            var dtPerGunFired = ( bounds.width / initialSpeed ) / Constants.MAX_PARTICLES;
            var previousDtSinceGunFired = this.get('dtSinceGunFired');

            var dtSinceGunFired = previousDtSinceGunFired + Constants.GUN_INTENSITY * deltaTime;
            this.set('dtSinceGunFired', dtSinceGunFired);


            if (this.get('on') && dtSinceGunFired >= dtPerGunFired ) {

                var ySign = ( Math.random() < 0.5 ? 1 : -1 );

                // random position withing model bounds
                var particleX = ySign * ( Constants.X0_MIN + ( Math.random() * ( ( bounds.width / 2 ) - Constants.X0_MIN ) ) );
                var particleY = bounds.minY;

                var initialPosition = new Vector2( particleX, particleY );

                this.alphaParticles.add({
                    speed: initialSpeed,
                    defaultSpeed: initialSpeed,
                    position: initialPosition
                });

                this.set('dtSinceGunFired', dtSinceGunFired % dtPerGunFired);
            }
        }

    }, {});

    return RayGun;
});

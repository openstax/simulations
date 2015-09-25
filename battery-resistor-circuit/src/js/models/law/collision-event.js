define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Law = require('models/law');

    /**
     * 
     */
    var CollisionEvent = function(distThreshold, amplitudeThreshold, oscillateFactory) {
        this.velocityToZero = Number.POSITIVE_INFINITY;
        this.oscillateFactory = oscillateFactory;
        this.distThreshold = distThreshold;
        this.amplitudeThreshold = amplitudeThreshold;
        this.time = 0;
    };

    /**
     * Instance functions/properties
     */
    _.extend(CollisionEvent.prototype, Law.prototype, {

        update: function(deltaTime, system) {
            this.time += deltaTime;
        },

        collide: function(core, waveParticle) {
            var dx = core.get('scalarPosition') - waveParticle.position;
            var osc = core.get('propagator');

            if (Math.abs(dx) < this.distThreshold) {
                if (osc.getAmplitude() < this.amplitudeThreshold) {
                    if (waveParticle.getLastCollision() !== core) {
                        var newOscillatePropagator = this.oscillateFactory.create(waveParticle.velocity, core);
                        core.set('propagator', newOscillatePropagator);

                        waveParticle.setCollided( true );
                        waveParticle.setLastCollision( core, this.time );
                    }
                }
                else if (waveParticle.velocity >= this.velocityToZero) {
                    waveParticle.setCollided( true );
                }
            }
        },

        currentTime: function() {
            return this.time;
        }

    });

    return CollisionEvent;
});

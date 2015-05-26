define(function (require) {

    'use strict';

    var Simulation = require('./simulation');

    /**
     * Wraps the update function in 
     */
    var FixedIntervalSimulation = Simulation.extend({

        /**
         * Initialization code for new FixedIntervalSimulation objects.
         *   Sets the frame duration and initializes the frame 
         *   accumulator to zero.
         */
        initialize: function(attributes, options) {
            Simulation.prototype.initialize.apply(this, [attributes, options]);

            options = options || {};
            var fps = options.framesPerSecond || 30;

            this.frameDuration = options.frameDuration || (1 / fps); // Seconds
            this.deltaTimePerFrame = options.deltaTimePerFrame || this.frameDuration; // Seconds
            this.frameAccumulator = 0;
        },

        /**
         * Because we need to update the simulation on a fixed interval
         *   for accuracy--especially since the propagator isn't based
         *   off of time but acts in discrete steps--we need a way to
         *   keep track of step intervals independent of the varying
         *   intervals created by window.requestAnimationFrame. This 
         *   clever solution was found here: 
         *
         *   http://gamesfromwithin.com/casey-and-the-clearly-deterministic-contraptions
         */
        update: function(time, delta) {

            if (!this.paused) {
                delta = (delta / 1000) * this.get('timeScale');
                this.frameAccumulator += delta;

                while (this.frameAccumulator >= this.frameDuration) {
                    this.time += this.frameDuration;

                    this._update(this.time, this.deltaTimePerFrame);
                    
                    this.frameAccumulator -= this.frameDuration;
                }    
            }
            
        }

    });

    return FixedIntervalSimulation;
});

define(function (require) {

    'use strict';

    var _ = require('underscore');

    /**
     * 
     */
    var WaveMedium = function() {
        this.wavefronts = [];
    };

    /**
     * Instance functions/properties
     */
    _.extend(WaveMedium.prototype, {

        /**
         * Adds a wavefront to the medium.
         */
        addWavefront: function(wavefront) {
            this.wavefronts.push(wavefront);
        },

        /**
         * Removes a wavefront from the medium.
         */
        removeWavefront: function(wavefront) {
            for (var i = this.wavefronts.length - 1; i >= 0; i--) {
                if (this.wavefronts[i] == wavefront)
                    this.wavefronts.splice(i, 1);
            }
        },

        /**
         * Returns how much of the original amplitude there should be at
         *   a given point (x, y).
         */
        attenuationFunction: function(x, y) {
            return 1;
        },

        /**
         * Calls the object's attenuation function to get the proportion
         *   of original amplitude at point (x, y).  A value of 1 would
         *   mean no attenuation.
         */
        getAttenuation: function(x, y) {
            if (_.isObject(x))
                return this.attenuationFunction(x.x, x.y);
            else
                return this.attenuationFunction(x, y);
        },

        /**
         * Returns the length of the longest wavefront in the medium.
         */
        getMaxX: function() {
            var maxX = Number.MAX_VALUE;
            for (var i = 0; i < this.wavefronts.length; i++)
                maxX = Math.min(maxX, this.wavefronts[i].getAmplitude().length);
            return maxX;
        },

        /**
         * Returns the combined amplitude of all wavefronts in the
         *   medium at a specified point in the medium.
         */
        getAmplitudeAt: function(x) {
            var amplitude = 0;
            var wavefrontCount = 0;
            var wavefront;
            for (var i = 0; i < this.wavefronts.length; i++) {
                wavefront = this.wavefronts[i];
                if (wavefront.get('enabled')) {
                    wavefrontCount++;
                    amplitude += wavefront.getAmplitudeAt(x);
                }
            }
            amplitude /= wavefrontCount;
            return amplitude;
        },

        /**
         * Updates all of this wave medium's wavefronts.
         */
        update: function(deltaTime) {
            for (var i = 0; i < this.wavefronts.length; i++)
                this.wavefronts[i].update(deltaTime, this.attenuationFunction);
        }

    });

    return WaveMedium;
});
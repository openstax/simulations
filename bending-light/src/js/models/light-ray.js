define(function (require) {

    'use strict';

    var Backbone = require('backbone');
    var Pool     = require('object-pool');

    var Vector2 = require('common/math/vector2');
    
    var pool = Pool({
        init: function() {
            return new LightRay();
        }
    });

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * The original PhET version of the simulation model was creating
     *   new instances of the light ray on each frame, and we need to
     *   avoid that for performance reasons.  This class has been set
     *   up to use an object pool so we can reuse instances but also
     *   be able to work on its own normally.  To create a new
     *   instance that is managed by the pool, use LightRay.create(),
     *   and pass the normal constructor arguments.
     *
     *  Constructor parameters:
     *    tail, tip, indexOfRefraction, wavelength, powerFraction,
     *    laserWavelength, waveWidth, numWavelengthsPhaseOffset, oppositeMedium,
     *    extend, extendBackwards
     *
     */
    var LightRay = function() {
        this.tip        = new Vector2();
        this.tail       = new Vector2();
        this.vector     = new Vector2();
        this.unitVector = new Vector2();
        this._vec       = new Vector2();

        this._line = {
            start: new Vector2(),
            end:   new Vector2()
        };

        // Call init with any arguments passed to the constructor
        this.init.call(this, arguments);
    };

    /**
     * Instance functions/properties
     */
    _.extend(LightRay.prototype, {

        /**
         * Initializes the LightRay's properties with provided initial values
         */
        init: function(tail, tip, indexOfRefraction, wavelength, powerFraction, laserWavelength, waveWidth, numWavelengthsPhaseOffset, oppositeMedium, extend, extendBackwards) {
            this.tip.set(tip);
            this.tail.set(tail);
            this.vector.set(tip).sub(tail);
            this.unitVector.set(this.vector).normalize();

            this.indexOfRefraction = indexOfRefraction;
            this.wavelength = wavelength;
            this.powerFraction = powerFraction;
            this.laserWavelength = laserWavelength;
            this.waveWidth = waveWidth;
            //This number indicates how many wavelengths have passed before this light ray
            //   begins; it is zero for the light coming out of the laser.
            this.numWavelengthsPhaseOffset = numWavelengthsPhaseOffset;
            this.oppositeMediumShape = oppositeMediumShape;
            this.extend = extend;
            // Light must be extended backwards for the transmitted wave shape to be correct
            this.extendBackwards = extendBackwards;

            this.zIndex = 0;
        },

        /**
         * Releases this instance to the object pool.
         */
        destroy: function() {
            pool.remove(this);
        },

        /**
         * Sets this light ray's zIndex value to the highest in the pool so far.
         *   Note that this function will only work correctly if this object is
         *   in the pool.
         */
        moveToFront: function() {
            var highestZIndex = getMaxZIndex();
            this.zIndex = highestZIndex + 1;
        },

        getSpeed: function() {
            return Constants.SPEED_OF_LIGHT / this.indexOfRefraction;
        },

        getPowerFraction: function() {
            return this.powerFraction;
        },

        toLine: function() {
            this._line.start.set(this.tail);
            this._line.end.set(this.tail);
            return this._line;
        },

        getVector: function() {
            return this.vector;
        },

        getLength: function() {
            return this.vector.length();
        },

        getWavelength: function() {
            return this.wavelength;
        },

        getLaserWavelength: function() {
            return this.laserWavelength;
        },

        getColor: function() {
            throw 'Use getLaserWavelength.';
        },

        /**
         * Fill in the triangular chip near y=0 even for truncated beams, if it is
         *   the transmitted beam
         */
        getExtensionFactor: function() {
            if (this.extendBackwards || this.extend)
                return this.wavelength * 1E6;
            else
                return 0;
        },

        /**
         * The wave is wider than the ray, and must be clipped against the opposite
         *   medium so it doesn't leak over
         */
        getWaveShape: function() {
            throw 'Not yet implemented.';
        },

        /**
         * Have to extend the line so that it can be clipped against the opposite
         *   medium, so it will won't show any missing triangular chips.
         */
        getExtendedLine: function() {
            this._line.start.set(this.tail);
            this._line.end
                .set(this.tip)
                .add(this._vec
                    .set(this.unitVector)
                    .scale(this.getExtensionFactor())
                );
            return this._line;
        },

        /**
         * Use this one for the transmitted beam
         */
        getExtendedLineBackwards: function() {
            this._line.start
                .set(this.tail)
                .add(this._vec
                    .set(this.unitVector)
                    .scale(-this.getExtensionFactor())
                );
            this._line.end.set(this.tip);

            return this._line;
        },

        getUnitVector: function() {
            return this.unitVector;
        },

        getAngle: function() {
            return this.vector.angle();
        },

        /**
         * Update the time and notify wave listeners so they can update the phase of the wave graphic
         */
        setTime: function(time) {
            this.time = time;
        },

        getWaveWidth: function() {
            return this.waveWidth;
        },

        getNumberOfWavelengths: function() {
            return this.getLength() / this.wavelength;
        },

        getNumWavelengthsPhaseOffset: function() {
            return this.numWavelengthsPhaseOffset;
        },

        getOppositeMedium: function() {
            return this.oppositeMedium;
        },

        /**
         * Determine if the light ray contains the specified position, accounting
         *   for whether it is shown as a thin light ray or wide wave
         */
        contains: function(position, waveMode) {
            throw 'Not yet implemented.';
        },

        getRayWidth: function() {
            // PhET note: At the default transform, this yields a 4 pixel wide stroke
            // Patrick: This will need to change.
            return 1.5992063492063494E-7;
        },

        getVelocityVector: function() {
            return this._vec
                .set(this.unitVector)
                .scale(this.getSpeed());
        },

        getFrequency: function() {
            return this.getSpeed() / this.getWavelength();
        },

        getAngularFrequency: function() {
            return this.getFrequency() * Math.PI * 2;
        },

        getPhaseOffset: function() {
            return this.getAngularFrequency() * this.time - 2 * Math.PI * this.numWavelengthsPhaseOffset;
        },

        /**
         * Get the total argument to the cosine for the wave
         *   function (k * x - omega * t + phase)
         */
        getCosArg: function(distanceAlongRay) {
            var w = this.getAngularFrequency();
            var k = 2 * Math.PI / this.getWavelength();
            var x = distanceAlongRay;
            var t = this.time;

            return k * x - w * t - 2 * Math.PI * this.numWavelengthsPhaseOffset;
        },

        getTime: function() {
            return this.time;
        }

    });

    /**
     * Static functions/properties
     */
    _.extend(LightRay, {

        /**
         * Initializes and returns a new LightRay instance from the object pool.
         *   Accepts the normal constructor parameters and passes them on to
         *   the created instance.
         */
        create: function() {
            var lightRay = pool.create();
            lightRay.init.call(lightRay, arguments);
            return lightRay;
        }

    });

    /**
     * moveToFront stuff
     */
    var maxZIndex = 0;
    var calculateMaxZIndexCallback = function(lightRay) {
        maxZIndex = Math.max(maxZIndex, lightRay.zIndex);
    };

    /**
     * Calculates and returns the max zIndex of all LightRay instances in the pool.
     */
    var getMaxZIndex = function() {
        pool.each(calculateMaxZIndexCallback);
        return maxZIndex;
    };



    return LightRay;
});
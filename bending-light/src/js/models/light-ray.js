define(function (require) {

    'use strict';

    var Backbone = require('backbone');
    var Pool     = require('object-pool');
    var SAT      = require('sat');

    var Vector2          = require('common/math/vector2');
    var PiecewiseCurve   = require('common/math/piecewise-curve');
    var LineIntersection = require('common/math/line-intersection');
    
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
     *    laserWavelength, waveWidth, numWavelengthsPhaseOffset, oppositeMediumShape,
     *    extend, extendBackwards
     *
     */
    var LightRay = function() {
        this.tip        = new Vector2();
        this.tail       = new Vector2();
        this.vector     = new Vector2();
        this.unitVector = new Vector2();
        this.velocity   = new Vector2();
        this._vec       = new Vector2();

        this._line = {
            start: new Vector2(),
            end:   new Vector2()
        };

        // SAT variables
        this._linePolygon = new SAT.Polygon(new SAT.Vector(), [ new SAT.Vector(), new SAT.Vector() ]);
        this._circle = new SAT.Circle(new SAT.Vector(), 1);
        this._satResponse = new SAT.Response();

        // Call init with any arguments passed to the constructor
        this.init.apply(this, arguments);
    };

    /**
     * Instance functions/properties
     */
    _.extend(LightRay.prototype, {

        /**
         * Initializes the LightRay's properties with provided initial values
         */
        init: function(tail, tip, indexOfRefraction, wavelength, powerFraction, laserWavelength, waveWidth, numWavelengthsPhaseOffset, oppositeMediumShape, extend, extendBackwards) {
            if (tip)
                this.tip.set(tip);
            else
                this.tip.set(0, 0);

            if (tail)
                this.tail.set(tail);
            else
                this.tail.set(0, 0);

            this.vector.set(this.tip).sub(this.tail);
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

        getTip: function() {
            return this.tip;
        },

        getTail: function() {
            return this.tail;
        },

        getSpeed: function() {
            return Constants.SPEED_OF_LIGHT / this.indexOfRefraction;
        },

        getPowerFraction: function() {
            return this.powerFraction;
        },

        toLine: function() {
            this._line.start.set(this.tail);
            this._line.end.set(this.tip);
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

        getRayWidth: function() {
            return 1.5992063492063494E-7;
        },

        getNumberOfWavelengths: function() {
            return this.getLength() / this.wavelength;
        },

        getNumWavelengthsPhaseOffset: function() {
            return this.numWavelengthsPhaseOffset;
        },

        getOppositeMedium: function() {
            return this.oppositeMediumShape;
        },

        /**
         * Determine if the light ray contains the specified position, accounting
         *   for whether it is shown as a thin light ray or wide wave
         */
        contains: function(position, waveMode) {
            // If it's in the opposite medium, it's not valid anyway
            if (this.oppositeMediumShape.contains(position))
                return false;
            
            // Otherwise, we just check to make sure it's on the line (or within 
            //   its thickness as a distance)
            var line = this.toLine();
            return LineIntersection.lineAndCircleIntersect(
                line.start.x, 
                line.start.y, 
                line.end.x, 
                line.end.y, 
                position.x, 
                position.y, 
                waveMode ? this.getWaveWidth() / 2 : this.getRayWidth() / 2
            );
        },

        intersectsCircle: function(x, y, radius) {
            this._linePolygon.points[0].x = this.tail.x;
            this._linePolygon.points[0].y = this.tail.y;
            this._linePolygon.points[1].x = this.tip.x;
            this._linePolygon.points[1].y = this.tip.y;
            this._linePolygon.setPoints(this._linePolygon.points);

            this._circle.pos.x = x;
            this._circle.pos.y = y;
            this._circle.r = radius;

            this._satResponse.clear();

            return SAT.testPolygonCircle(this._linePolygon, this._circle, this._satResponse);
        },

        getLastIntersectionWithCircle: function() {
            return this._satResponse;
        },

        getRayWidth: function() {
            // PhET note: At the default transform, this yields a 4 pixel wide stroke
            // Patrick: This will need to change.
            return 1.5992063492063494E-7;
        },

        getVelocityVector: function() {
            return this.velocity
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
            lightRay.init.apply(lightRay, arguments);
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
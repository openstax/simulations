define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');
    var clamp   = require('common/math/clamp');

    var AbstractCoil         = require('models/coil');
    var SamplePointsStrategy = require('models/sample-points-strategy');

    var Constants = require('constants');

    var DEBUG_CALIBRATION = true;

    /**
     * PickupCoil is the model of a pickup coil.
     * Its behavior follows Faraday's Law for electromagnetic induction.
     */
    var PickupCoil = AbstractCoil.extend({

        defaults: _.extend({}, AbstractCoil.prototype.defaults, {
            samplePointsStrategy: new SamplePointsStrategy.ConstantNumberOfSamplePointsStrategy(9),
            // This is used to scale the B-field for sample points inside the magnet, eliminating
            //   abrupt transitions at the left and right edges of the magnet.  For any sample
            //   point inside the magnet, the B field sample is multiplied by this value.
            transitionSmoothingScale: 1 // no smoothing
        }),

        initialize: function(attributes, options) {
            AbstractCoil.prototype.initialize.apply(this, arguments);

            this.magnetModel              = options.magnetModel;
            this.averageBx                = 0; // in Gauss
            this.flux                     = 0; // in webers
            this.deltaFlux                = 0; // in webers
            this.emf                      = 0; // in volts
            this.biggestAbsEmf            = 0; // in volts
            this.samplePoints             = null; // B-field sample points
            this.calibrationEmf           = options.calibrationEmf;

            // loosely packed loops
            this.set('loopSpacing', 1.5 * this.get('wireWidth'));

            // Cached objects
            this._samplePoint = new Vector2();

            this.on('change:radius change:samplePointsStrategy', this.updateSamplePoints);

            this.updateSamplePoints();
        },

        getFlux: function() {
            return this.flux;
        },

        getDeltaFlux: function() {
            return this.deltaFlux;
        },

        getAverageBx: function() {
            return this.averageBx;
        },

        getEmf: function() {
            return this.emf;
        },

        getBiggestEmf: function() {
            return this.biggestAbsEmf;
        },

        getSamplePoints: function() {
            return this.samplePoints;
        },

        /*
         * Updates the sample points for the coil.
         * The samples points are used to measure the B-field in the calculation of emf.
         */
        updateSamplePoints: function() {
            this.get('samplePointsStrategy').destroySamplePoints(this);
            this.samplePoints = this.get('samplePointsStrategy').createSamplePoints(this);
        },

        /**
         * 
         */

        /**
         * Handles ticks of the simulation clock.
         * Calculates the induced emf using Faraday's Law.
         */
        update: function(time, deltaTime) {
            if (this.get('enabled'))
                this.updateEmf(deltaTime);
        },

        /**
         * Updates the induced emf (and other related instance data), using Faraday's Law.
         */
        updateEmf: function(deltaTime) {
            // Sum the B-field sample points.
            var sumBx = this.getSumBx();

            // Average the B-field sample points.
            this.averageBx = sumBx / this.samplePoints.length;

            // Flux in one loop.
            var A = this.getEffectiveLoopArea();
            var loopFlux = A * this.averageBx;

            // Flux in the coil.
            var flux = this.get('numberOfLoops') * loopFlux;

            // Change in flux.
            this.deltaFlux = flux - this.flux;
            this.flux = flux;

            // Induced emf.
            var emf = -(this.deltaFlux / deltaTime);

            // If the emf has changed, set the current in the coil and notify observers.
            if (emf != this.emf) {
                this.emf = emf;

                // Current amplitude is proportional to emf amplitude.
                var amplitude = clamp(-1, emf / this.calibrationEmf, +1);
                this.set('currentAmplitude', amplitude);
                //console.log(amplitude)
            }

            if (DEBUG_CALIBRATION)
                this.calibrateEmf();
        },

        /*
         * Gets the sum of Bx at the coil's sample points.
         */
        getSumBx: function() {
            var magnetStrength = this.magnetModel.get('strength');

            // Sum the B-field sample points.
            var sumBx = 0;
            var samplePoint = this._samplePoint;
            for (var i = 0; i < this.samplePoints.length; i++) {
                samplePoint.x = this.get('position').x + this.samplePoints[i].x; 
                samplePoint.y = this.get('position').y + this.samplePoints[i].y;

                if (this.get('direction') !== 0) {
                    // Adjust for rotation.
                    var x = this.get('position').x;
                    var y = this.get('position').y;
                    samplePoint.sub(x, y);
                    samplePoint.rotate(this.get('direction'));
                    samplePoint.add(x, y);
                }

                // Find the B-field vector at that point.
                var bField = this.magnetModel.getBField(samplePoint);

                /*
                 * If the B-field x component is equal to the magnet strength, then our B-field sample
                 * was inside the magnet. Use the fudge factor to scale the sample so that the transitions
                 * between inside and outside are not abrupt. See Unfuddle #248.
                 */
                var Bx = bField.x;
                if (Math.abs(Bx) === magnetStrength)
                    Bx *= this.get('transitionSmoothingScale');

                // Accumulate a sum of the sample points.
                sumBx += Bx;
            }

            return sumBx;
        },

        /*
         * When the magnet is in the center of the coil, increasing the loop size should
         *   decrease the EMF.  But since we are averaging sample points on a vertical line,
         *   multiplying by the actual area would (incorrectly) result in an EMF increase.
         *   The best solution would be to take sample points across the entire coil,
         *   but that requires many changes, so Mike Dubson came up with this workaround.
         *   By fudging the area using a thin vertical rectangle, the results are qualitatively
         *   (but not quantitatively) correct.
         */
        getEffectiveLoopArea: function() {
            var width = Constants.MIN_PICKUP_LOOP_RADIUS;
            var height = 2 * this.get('radius');
            return width * height;
        },

        /**
         * Provides assistance for calibrating this coil.
         * The easiest way to calibrate is to run the sim in developer mode,
         * then follow these steps for each module that has a pickup coil.
         *
         * 1. Set the "Pickup calibration EMF" developer control to its smallest value.
         * 2. Set the model parameters to their maximums, so that maximum emf will be generated.
         * 3. Do whatever is required to generate emf (move magnet through coil, run generator, etc.)
         * 4. Watch System.out for a message that tells you what value to use.
         * 5. Change the value of the module's CALIBRATION_EMF constant.
         */
        calibrateEmf: function() {
            var absEmf = Math.abs(this.emf);

            /*
            * Keeps track of the biggest emf seen by the pickup coil.
            * This is useful for determining the desired value of calibrationEmf.
            * Set DEBUG_CALIBRATION=true, run the sim, set model controls to
            * their max values, then observe this debug output.  The largest
            * value that you see is what you should use for calibrationEmf.
            */
            if (absEmf > this.biggestAbsEmf) {
                this.biggestAbsEmf = absEmf;
                console.log('PickupCoil.updateEmf: biggestEmf = ' + this.biggestAbsEmf);

                /*
                * If this prints, you have calibrationEmf set too low.
                * This will cause view components to exhibit responses that are less then their maximums.
                * For example, the voltmeter won't fully deflect, and the lightbulb won't fully light.
                */
                if (this.biggestAbsEmf > this.calibrationEmf)
                    console.log('PickupCoil.updateEmf: you should recalibrate');
            }

            /*
             * The coil could theoretically be self-calibrating. If we notice that we've exceeded calibrationEmf,
             * then adjust calibrationEmf.  This would be OK as long as we started with a value that was in the ballpark,
             * because we don't want the user to perceive a noticeable change in the sim's behavior.
             */
        }

    });

    return PickupCoil;
});

define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2      = require('common/math/vector2');
    var MotionObject = require('common/models/motion-object');

    var HalfLifeInfo = require('models/half-life-info');
    var NucleusType  = require('models/nucleus-type');

    var Constants = require('constants');

    /**
     * Base class for all atomic nuclei
     */
    var AtomicNucleus = MotionObject.extend({

        defaults: _.extend({}, MotionObject.prototype.defaults, {
            // Number of neutrons and protons in this nucleus.
            numNeutrons: undefined,
            numProtons: undefined,

            // Used for deciding where particles tunnel to and how far they need
            // to go to tunnel out.
            tunnelingRegionRadius: Constants.AtomicNucleus.DEFAULT_TUNNELING_REGION_RADIUS,

            // Diameter of the atom, calculated at init and when changes occur. 
            diameter: undefined,

            // Variables that describe and control the decay of the nucleus.
            
            halfLife: 0,
            decayTimeScalingFactor: 1
        }),
        
        initialize: function(attributes, options) {
            MotionObject.prototype.initialize.apply(this, [attributes, options]);

            // Original position
            this.originalPosition = new Vector2(this.get('position'));
            // Original number of neutrons and protons, needed for resets and possibly
            //   for determining whether decay has occurred.
            this.originalNumProtons = this.get('numProtons');
            this.originalNumNeutrons = this.get('numNeutrons');

            // Variables that describe and control the decay of the nucleus.
            this.decayTime = 0;              // Time at which nucleus should decay - in sim time.
            this.activatedLifetime = 0;      // Duration of activation (moving towards decay) in sim time.
            this.totalUndecayedLifetime = 0; // Time, in real time, that this nucleus will live or did live.

            // Calculate our diameter.
            this.updateDiameter();

            // Set the initial half life based on the nucleus' configuration.  It
            //   can be changed through a setter method if needed.
            this.set('halfLife', HalfLifeInfo.getHalfLifeForNucleusConfig(this.get('numProtons'), this.get('numNeutrons')));

            // Bind event listeners
            this.on('change:tunnelingRegionRadius', this.tunnelingRegionRadiusChanged);
        },

        /**
         * Reset the nucleus to its original state.
         */
        reset: function() {
            // Reset the decay time to 0, indicating that it shouldn't occur
            //   until something changes.
            this.decayTime = 0;
            this.activatedLifetime = 0;
        },

        getAtomicWeight: function() {
            return this.get('numNeutrons') + this.get('numProtons');
        },

        update: function(time, deltaTime) {
            // Move
            this.updateVelocity(deltaTime);
            this.updatePositionFromVelocity(deltaTime);

            // Take any action necessary related to decay.
            if (this.isDecayActive()) {
                // See if decay should occur.
                if (this.isTimeToDecay(time)) {
                    // It is time to decay.
                    this.decay(deltaTime);
                }
                else {
                    // Not decaying yet, so updated the activated lifetime.
                    this.activatedLifetime += deltaTime;
                }
            }
        },

        /**
         * Recalculate the diameter of this nucleus based on the number of protons
         * and neutrons that comprise it.
         */
        updateDiameter: function() {
            var diameter;
            // This calculation is based on an empirically derived formula that
            //   seems to give pretty reasonable values.  It has been hacked at
            //   bit to work for the purpose of this family of sims.
            switch (this.getAtomicWeight()) {
                case 1:
                    diameter = Constants.NUCLEON_DIAMETER;
                    break;
                case 2:
                    diameter = 2 * Constants.NUCLEON_DIAMETER;
                    break;
                case 3:
                    diameter = 2 * Constants.NUCLEON_DIAMETER;  // Not correct, but works better.
                    break;
                case 4:
                    diameter = 3.5 * Constants.NUCLEON_DIAMETER;
                    break;
                default:
                    diameter = (1.6 * Math.pow(this.getAtomicWeight(), 0.362));
                    break;
            }

            this.set('diameter', diameter);
        },

        /**
         * This method starts the nucleus moving towards decay.
         */
        activateDecay: function(simulationTime) {
            // Only allow activation if the nucleus hasn't already decayed.
            if (!this.hasDecayed()) {
                this.totalUndecayedLifetime = this.calculateDecayTime();
                this.decayTime = simulationTime + (this.totalUndecayedLifetime * this.get('decayTimeScalingFactor'));
            }
        },

        /**
         * Returns a boolean value indicating whether the nucleus has decayed.
         *   This will return false if the nucleus has not been activated.
         */
        hasDecayed: function() {
            // Not sure if this default implementation will apply to all types of
            //   decay, but it works for those implemented by the sim as of this
            //   writing.
            if (this.get('numProtons') !== this.originalNumProtons)
                return true;
            else
                return false;
        },

        /**
         * Return true if decay is currently active and false if not.  Note that
         * this will return false if the nucleus has already decayed.
         */
        isDecayActive: function() {
            if (this.decayTime !== 0)
                return true;
            else
                return false;
        },

        /**
         * Returns a value indicating the amount of adjusted time that the nucleus
         *   has been active without decaying.  Adjusted time is based on the time
         *   adjustment factor that is used to scale the amount of time that a
         *   model element has experienced such that it will generally decay in a
         *   reasonable time frame (so that users aren't waiting around for
         *   thousands of years for decay to occur).
         *
         * @return Adjusted time in milliseconds for which this nucleus has been
         *         activated, i.e. progressing towards decay.
         */
        getAdjustedActivatedTime: function() {
            return this.activatedLifetime / this.get('decayTimeScalingFactor');
        },

        /**
         * Give the nucleus a chance to capture a (presumably) free particle.
         *
         * @param particle - The particle that could potentially be captured.
         * @return true if particle captured, false if not.
         */
        captureParticle: function(particle) {
            // Does nothing in base class.
            return false;
        },

        /**
         * This method is called when decay occurs, and it defines the behavior
         *   exhibited by the nucleus when it decays.  This method should be
         *   implemented by all subclasses that exhibit decay behavior..
         */
        decay: function(deltaTime) {
            // Set the final value of the time that this nucleus existed prior to
            // decaying.
            this.activatedLifetime += deltaTime;

            // Set the decay time to 0 to indicate that decay has occurred and
            // should not occur again.
            this.decayTime = 0;
        },

        /**
         * This method generates a value indicating the number of milliseconds for
         *   a nucleus decay based on the half life.  This calculation is based on
         *   the exponential decay formula.
         *
         * @return - a time value in milliseconds
         */
        calculateDecayTime: function() {
            var decayTime;

            if (this.get('halfLife') <= 0) {
                decayTime = 0;
            }
            else if (this.get('halfLife') === Number.POSITIVE_INFINITY) {
                decayTime = Number.POSITIVE_INFINITY;
            }
            else {
                var decayConstant = 0.693 / this.get('halfLife');
                var randomValue = Math.random();
                if (randomValue > 0.999) {
                    // Limit the maximum time for decay so that the user isn't waiting
                    // around forever.
                    randomValue = 0.999;
                }
                decayTime = -(Math.log(1 - randomValue) / decayConstant);
            }

            return decayTime;
        },

        /**
         * Returns true if it is time to decay, false if not.  Generally, this is
         *   true if the nucleus has existed longer than the decay time.  It may
         *   need to be overridden in cases where simulation time is not linear.
         */
        isTimeToDecay: function(simulationTime) {
            return simulationTime >= this.decayTime;
        },

        tunnelingRegionRadiusChanged: function(model, tunnelingRegionRadius) {
            if (tunnelingRegionRadius >= this.get('diameter') / 2)
                this.set('tunnelingRegionRadius', Math.min(tunnelingRegionRadius, AtomicNucleus.MAX_TUNNELING_REGION_RADIUS));
        },

        /**
         * Notify all listeners that our atomic weight has changed.
         */
        triggerNucleusChange: function(byProducts) {
            // First recalculate the diameter, since it likely has changed.
            this.updateDiameter();

            // Do the notification.
            this.trigger('nucleus-change', this, byProducts);
        }

    }, _.extend({

        /**
         * Convenience method for obtaining the nucleus or nuclei that the specified
         *   nucleus type will decay into.  Note that the return values are NOT 
         *   NECESSARILY what always happens in the real world - they represent the
         *   way this simulation behaves, which is a simplification of real-world
         *   behavior.  Also note that this method may sometimes consider something
         *   like an alpha particle as a helium nucleus and list it here, or
         *   sometimes as and emitted particle, and thus NOT list it here.  It all
         *   depends on the needs of the other portions of the sim.
         */
        getPostDecayNuclei: function(preDecayNucleusType) {
            var decayProducts = [];

            switch (preDecayNucleusType) {

                case NucleusType.HYDROGEN_3:
                    decayProducts.push(NucleusType.HELIUM_3);
                    break;

                case NucleusType.CARBON_14:
                    decayProducts.push(NucleusType.NITROGEN_14);
                    break;

                case NucleusType.URANIUM_238:
                    decayProducts.push(NucleusType.LEAD_206);
                    break;

                case NucleusType.POLONIUM_211:
                    decayProducts.push(NucleusType.LEAD_207);
                    break;

                case NucleusType.LIGHT_CUSTOM:
                    decayProducts.push(NucleusType.LIGHT_CUSTOM_POST_DECAY);
                    break;

                case NucleusType.HEAVY_CUSTOM:
                    decayProducts.push(NucleusType.HEAVY_CUSTOM_POST_DECAY);
                    break;

                default:
                    console.warning('Warning: No decay product information available for requested nucleus, returning original value, nucleus = ', preDecayNucleus);
                    decayProducts.push(preDecayNucleus);
                    break;
            }

            return decayProducts;
        },

        getPostDecayNucleusType: function(preDecayNucleusType) {
            return AtomicNucleus.getPostDecayNuclei(preDecayNucleusType)[0];
        }

    }, Constants.AtomicNucleus));

    return AtomicNucleus;
});
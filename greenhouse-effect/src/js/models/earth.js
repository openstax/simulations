define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Disk                  = require('models/disk');
    var CircularPhotonEmitter = require('models/photon-emitter/circular');
    var PhotonAbsorber        = require('models/photon-absorber');

    var Constants = require('constants');

    var Earth = Disk.extend({

        defaults: _.extend({}, Disk.prototype.defaults, {
            mass:   Number.MAX_VALUE, 
            radius: Constants.Earth.RADIUS,

            emissivity:      Constants.Earth.DEFAULT_EMISSIVITY,
            temperature:     Constants.Earth.BASE_TEMPERATURE,
            baseTemperature: Constants.Earth.BASE_TEMPERATURE
        }),

        /**
         * Initializes the model instance. Requires 'alpha' and
         *   'beta' values to be specified in the options.
         */
        initialize: function(attributes, options) {
            Disk.prototype.initialize.apply(this, [attributes, options]);

            this.timeSinceEmission = 0;
            this.netEnergy = 0;

            if (options === undefined || options.alpha === undefined || options.beta === undefined)
                throw 'Earth constructor requires options for alpha and beta values';

            this.photonSource = new CircularPhotonEmitter({
                center: this.get('position'),
                radius: this.get('radius'),
                wavelength: Constants.IR_WAVELENGTH,
                alpha: options.alpha,
                beta:  options.beta
            });
            this.listenTo(this.photonSource, 'photon-emitted', this.photonEmitted);

            this.photonAbsorber = new PhotonAbsorber();
            this.reflectivityAssessor = null;

            this.temperatureHistoryLength = 200;
            this.temperatureHistory = [];
            this.resetTemperatureHistory();
        },

        /**
         * 
         */
        reset: function() {
            this.resetTemperatureHistory();
            this.netEnergy = 0;
        },

        /**
         * Sets all the temperature history values to the base temp.
         */
        resetTemperatureHistory: function() {
            var baseTemperature = this.get('baseTemperature');
            for (var i = 0; i < this.temperatureHistoryLength; i++)
                this.temperatureHistory[i] = baseTemperature;
        },

        /**
         * 
         */
        update: function(deltaTime) {
            Disk.prototype.update.apply(this, arguments);

            this.timeSinceEmission += deltaTime;
            if (this.timeSinceEmission >= Earth.PHOTON_EMISSION_TIME) {
                this.timeSinceEmission = 0;

                this.set('temperature', this.computeTemperature());

                while (this.netEnergy > 0)
                    this.photonSource.emitPhoton();
            }
        },

        /**
         * Computes the current temperature from the history of past
         *   temperatures and the current net energy and returns it.
         */
        computeTemperature: function() {
            // Calculate the average of the historical temperatures
            var sum = 0; // Sum of historical temperature values
            for (var i = this.temperatureHistoryLength - 2; i >= 0; i--) {
                sum += this.temperatureHistory[i];
                this.temperatureHistory[i + 1] = this.temperatureHistory[i];
            }
            this.temperatureHistory[0] = this.get('baseTemperature') - 9 + 3 * Math.pow(this.netEnergy / Constants.k, 0.25);
            sum += this.temperatureHistory[0];

            return sum / this.temperatureHistoryLength;
        },

        /*
         * Note: There was something called a "jimmy array" in the
         *   original source that was used to modify the temperature
         *   for the Glass Layers version of the simulation.  I've
         *   removed it from this base class and will extend it in
         *   Glass Layer's own version to add the functionality of
         *   the hack.
         */

        /**
         * Makes the photon absorber absorb a photon and increases
         *   the earth's net energy by the photon's energy.
         */
        absorbPhoton: function(photon) {
            this.photonAbsorber.absorbPhoton(photon);
            this.netEnergy += photon.get('energy');
        },

        /**
         * Makes the photon source emit a photon.
         */
        emitPhoton: function() {
            this.photonSource.emitPhoton();
        },

        /**
         * Changes the earth's net energy to account for the release
         *   of a given photon.
         */
        photonEmitted: function(photon) {
            this.netEnergy = Math.max(0, this.netEnergy - photon.get('energy'));
            this.trigger('photon-emitted', photon);
        },

        /**
         * Sets the earth object's ReflectivityAssessor object.
         */
        setReflectivityAssessor: function(reflectivityAssessor) {

            /******************************** TODO *********************************
             *
             * I've been thinking about this reflectivity assessor object a lot, and
             *   I think I've come to a decision.  In the original simulation, they
             *   make the EarthGraphic (view for the Earth model) and implement this
             *   ReflectivityAssessor interface on it so it can grab pixel data from
             *   the scene and use it to determine the reflectivity of the Earth's
             *   surface at the current position of the photon.  While I initially
             *   objected to this as a violation between the separation of the model
             *   and the view, I eventually settled on the fact that it's much
             *   simpler and more sustainable (more flexible if we want to change
             *   the graphics in the future) if we just do it that way.  Because it
             *   doesn't need to be used by the simulation right away--because 
             *   photons starting at the top are in no danger of getting to a
             *   potentially reflective surface at the moment of their birth--we can
             *   create an object that waits patiently until the assets have been
             *   loaded and then switches from default reflectivity behavior to an
             *   image-data-informed reflectivity decision.
             *
             ***********************************************************************/

            this.reflectivityAssessor = reflectivityAssessor;
        },

        /**
         * Returns the reflectivity for a specific photon.
         */
        getReflectivity: function(photon) {
            if (this.reflectivityAssessor)
                return this.reflectivityAssessor.getReflectivity(photon);
            else
                return 0;
        },

        /**
         * 
         */
        setProductionRate: function(productionRate) {
            this.photonSource.set('productionRate', productionRate);
        },

        /**
         * 
         */
        getProductionRate: function() {
            return this.photonSource.get('productionRate');
        }

    }, Constants.Earth);

    return Earth;
});

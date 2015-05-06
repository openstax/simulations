define(function (require) {

    'use strict';

    var Disk = require('models/disk');

    var Constants = require('constants');

    var Earth = Disk.extend({

        defaults: _.extend({}, Disk.prototype.defaults, {
            mass:   Number.MAX_VALUE, 
            radius: 6370,

            emissivity:      Constants.Earth.DEFAULT_EMISSIVITY,
            temperature:     Constants.Earth.BASE_TEMPERATURE,
            baseTemperature: Constants.Earth.BASE_TEMPERATURE,

            reflectivityAssessor: null
        }),

        initialize: function(attributes, options) {
            Disk.prototype.initialize.apply(this, [attributes, options]);

            this.timeSinceEmission = 0;
            this.netEnergy = 0;

            this.photonSource = null; // new CircularPhotonEmitter(center, radius, )
            this.photonAbsorber = null; // new BasicPhotonAbsorber();

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
         * Returns the reflectivity for a specific photon.
         */
        getReflectivity: function(photon) {
            if (this.get('reflectivityAssessor'))
                return this.get('reflectivityAssessor').getReflectivity(photon);
            else
                return 0;
        }

    }, Constants.Earth);

    return Earth;
});

define(function (require) {

    'use strict';

    /**
     * Constants
     */

    // Planck's constant J-s
    var PLANCK = 6.626E-34;
    // Speed of light - m/s
    var LIGHT_SPEED = 2.9979E8;
    // Electron rest mass - kg
    var ELECTRON_MASS = 9.109E-31;
    // Joules per EV, EV per Joule
    var JOULES_PER_EV = 1.6022E-19;
    var EV_PER_JOULE = 1 / JOULES_PER_EV;
    // nanometers per meter
    var NM_PER_M = 1E9;
    // Avogadro's number
    var AVOGADRO = 6.022E23;


    /**
     * A collection of utilities having to do with physical constants and phenomena
     */
    var PhysicsUtil = {

        /**
         * Determines the energy, in EV, of radiation with a specified wavelength
         *
         * @param wavelength in nm
         * @return energy in EV
         */
        wavelengthToEnergy: function(wavelength) {
            return PLANCK * LIGHT_SPEED / wavelength / JOULES_PER_EV * NM_PER_M;
        },

        /**
         * Determines the wavelength, in nm, of radiation with a specified energy
         *
         * @param ev energy of the radiation, in ev
         * @return wavelength in nm
         */
        energyToWavelength: function(ev) {
            return (PLANCK * LIGHT_SPEED / ev) * EV_PER_JOULE * NM_PER_M;
        },

        /**
         * Returns the frequency of EM radiation of a specified wavelength
         *
         * @param wavelength Wavelength, in nm
         * @return frequency in Hz
         */
        wavelengthToFrequency: function(wavelength) {
            return LIGHT_SPEED * NM_PER_M / wavelength;
        },

        /**
         * Returns the wavelength, in nm, of EM radiation of a specified
         * frequency
         *
         * @param frequency in Hz
         * @return wavelength in nm
         */
        frequencyToWavelength: function(frequency) {
            return LIGHT_SPEED * NM_PER_M / frequency;
        },

        /**
         * Returns the energy, in EV, of EM radiation of a specified frequency
         *
         * @param frequency in Hz
         * @return energy in EV
         */
        frequencyToEnergy: function(frequency) {
            return this.wavelengthToEnergy(this.frequencyToWavelength(frequency));
        },

        /**
         * Returns the frequency, in Hz, of EM radiation of a specified energy
         *
         * @param energy
         * @return frequency in Hz
         */
        energyToFrequency: function(energy) {
            return this.wavelengthToFrequency(this.energyToWavelength(energy));
        }

    };

    return PhysicsUtil;
});

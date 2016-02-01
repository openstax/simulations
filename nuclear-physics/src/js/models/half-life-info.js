define(function (require) {

    'use strict';

    var NucleusType = require('models/nucleus-type');

    var HalfLifeInfo = {

        /**
         * Get the half life for the specified nucleus type.
         *
         * @param nucleusType
         * @return half life in milliseconds (might be a really big number)
         */
        getHalfLifeForNucleusType: function(nucleusType) {
            if (!nucleusType)
                return Number.POSITIVE_INFINITY;

            var halfLife;

            switch (nucleusType) {

                case HYDROGEN_3:
                    halfLife = HalfLifeInfo.convertDaysToMs( 4500 );
                    break;

                case CARBON_14:
                    halfLife = HalfLifeInfo.convertYearsToMs( 5730 );
                    break;

                case LIGHT_CUSTOM:
                    halfLife = HalfLifeInfo.convertYearsToMs( 11 ); // Arbitrary value for sake of this sim.
                    break;

                case POLONIUM_211:
                    halfLife = 516;
                    break;

                case URANIUM_235:
                    halfLife = HalfLifeInfo.convertYearsToMs( 703800000 );
                    break;

                case URANIUM_238:
                    halfLife = HalfLifeInfo.convertYearsToMs( 4.46E9 );
                    break;

                case HEAVY_CUSTOM:
                    halfLife = 900;
                    break;

                default:
                    console.error('Warning: No half life info for nucleus type ' + nucleusType);
                    halfLife = 0;
                    break;
            }

            return halfLife;
        },

        getHalfLifeForNucleusConfig: function(numProtons, numNeutrons) {
            return this.getHalfLifeForNucleusType(NucleusType.identifyNucleus(numProtons, numNeutrons));
        },

        /**
         * Convenience method for converting years to milliseconds, since
         *   milliseconds is used throughout the simulation for timing.
         */
        convertYearsToMs: function(years) {
            return years * 3.1556926E10;
        },

        /**
         * Convenience method for converting milliseconds to years, since
         *   milliseconds is used throughout the simulation for timing.
         */
        convertMsToYears: function(milliseconds) {
            return milliseconds * 3.16887646E-11;
        },

        /**
         * Convenience method for converting days to milliseconds, since
         *   milliseconds is used throughout the simulation for timing.
         */
        convertDaysToMs: function(days) {
            return days * 86400000;
        },

        /**
         * Convenience method for converting hours to milliseconds, since
         *   milliseconds is used throughout the simulation for timing.
         */
        convertHoursToMs: function(hours) {
            return hours * 3600000;
        }

    };

    return HalfLifeInfo;
});
define(function (require) {

    'use strict';

    var NucleusType = {

        HYDROGEN_3:              1,
        HELIUM_3:                2,
        CARBON_14:               3,
        NITROGEN_14:             4,
        LIGHT_CUSTOM:            5,
        LIGHT_CUSTOM_POST_DECAY: 6,
        LEAD_206:                7,
        LEAD_207:                8,
        POLONIUM_211:            9,
        URANIUM_235:             10,
        URANIUM_236:             11,
        URANIUM_238:             12,
        URANIUM_239:             13,
        HEAVY_CUSTOM:            14,
        HEAVY_CUSTOM_POST_DECAY: 15, 

        /**
         * Convenience method for identifying a nucleus based on its configuration.
         *
         * @param numProtons
         * @param numNeutrons
         * @return
         */
        identifyNucleus: function(numProtons, numNeutrons) {

            var nucleusType;

            // Note that (obviously) not every nucleus that exists in nature is
            //   handled here - just those needed by the sim.  Feel free to add
            //   more if needed.
            switch (numProtons) {
                case 1:
                    // Hydrogen.
                    nucleusType = NucleusType.HYDROGEN_3;
                    break;

                case 2:
                    // Helium.
                    nucleusType = NucleusType.HELIUM_3;
                    break;

                case 6:
                    // Carbon 14.
                    nucleusType = NucleusType.CARBON_14;
                    break;

                case 7:
                    // Nitrogen 14.
                    nucleusType = NucleusType.NITROGEN_14;
                    break;

                case 8:
                    // Oxygen, which is used in this sim as the light custom nucleus.
                    nucleusType = NucleusType.LIGHT_CUSTOM;
                    break;

                case 9:
                    // Flourine, which is used in this sim as the decayed light custom nucleus.
                    nucleusType = NucleusType.LIGHT_CUSTOM_POST_DECAY;
                    break;

                case 81:
                    // This is thallium, which we use as the post-decay custom nucleus.
                    nucleusType = NucleusType.HEAVY_CUSTOM_POST_DECAY;
                    break;

                case 82:
                    // Lead.
                    if (numNeutrons == 124) {
                        // Lead 206
                        nucleusType = NucleusType.LEAD_206;
                    }
                    else if (numNeutrons == 125) {
                        // Lead 207
                        nucleusType = NucleusType.LEAD_207;
                    }
                    else {
                        console.error('Error: Unrecognized isotope for Lead, using Lead 207.');
                        nucleusType = NucleusType.LEAD_207;
                    }
                    break;

                case 83:
                    // This nucleus is bismuth, which we use as the pre-decay custom
                    // nucleus.
                    nucleusType = NucleusType.HEAVY_CUSTOM;
                    break;

                case 84:
                    // Polonium.
                    nucleusType = NucleusType.POLONIUM_211;
                    break;

                case 92:
                    switch (numNeutrons) {
                        case 143:
                            // U235.
                            nucleusType = NucleusType.URANIUM_235;
                            break;

                        case 144:
                            // U236.
                            nucleusType = NucleusType.URANIUM_236;
                            break;

                        case 146:
                            // U238.
                            nucleusType = NucleusType.URANIUM_238;
                            break;

                        case 147:
                            // U239.
                            nucleusType = NucleusType.URANIUM_239;
                            break;

                        default:
                            // Unrecognized.
                            console.log('Error: Unrecognized uranium isotop, using U238.');
                            nucleusType = NucleusType.URANIUM_238;
                            break;
                    }
                    break;

                default:
                    // This is not a nucleus type that we are familiar with.  This is
                    // okay, we just return null.
                    nucleusType = null;
                    break;
            }

            return nucleusType;
        }

    };

    return NucleusType;
});
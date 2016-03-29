define(function (require) {

    'use strict';

    var _ = require('underscore');

    var AtomicNucleus = require('models/atomic-nucleus');

    var Constants = require('constants');

    /**
     * 
     */
    var Uranium238Nucleus = AtomicNucleus.extend({

        defaults: _.extend({}, AtomicNucleus.prototype.defaults, {
            // Number of neutrons and protons in this nucleus.
            numProtons:  Constants.Uranium238Nucleus.PROTONS,
            numNeutrons: Constants.Uranium238Nucleus.NEUTRONS,
            // Uranium-238 half-life
            halfLife:    Constants.Uranium238Nucleus.HALF_LIFE,
            // Different decay-time scaling factor for uranium-238
            decayTimeScalingFactor: Constants.Uranium238Nucleus.DECAY_TIME_SCALING_FACTOR
        })

    });

    return Uranium238Nucleus;
});
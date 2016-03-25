define(function (require, exports, module) {

    'use strict';

    var RutherfordScatteringSimulation = require('rutherford-scattering/models/simulation');
    var RutherfordParticles  = require('rutherford-scattering/collections/rutherford-particles');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Wraps the update function in 
     */
    var RutherfordAtomSimulation = RutherfordScatteringSimulation.extend({
        
        initialize: function(attributes, options) {
            this.boundWidth = Constants.RUTHERFORD_ACTUAL;
            RutherfordScatteringSimulation.prototype.initialize.apply(this, arguments);
        },

        initAlphaParticles: function() {
            this.alphaParticles = new RutherfordParticles(null, {bounds: this.bounds});
        }

    });

    return RutherfordAtomSimulation;
});

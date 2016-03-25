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

        initAlphaParticles: function() {
            this.alphaParticles = new RutherfordParticles(null, {bounds: {x: -75, y: -75, w: 150, h: 150}});
        }

    });

    return RutherfordAtomSimulation;
});

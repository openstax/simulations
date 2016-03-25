define(function (require, exports, module) {

    'use strict';

    var RutherfordScatteringSimulation = require('rutherford-scattering/models/simulation');
    var AlphaParticles  = require('rutherford-scattering/collections/alpha-particles');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Wraps the update function in 
     */
    var PlumPuddingSimulation = RutherfordScatteringSimulation.extend({

        initAlphaParticles: function() {
            this.alphaParticles = new AlphaParticles(null, {bounds: {x: -150, y: -150, w: 300, h: 300}});
        }

    });

    return PlumPuddingSimulation;
});

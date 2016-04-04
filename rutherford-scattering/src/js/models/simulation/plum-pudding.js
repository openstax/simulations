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
        
        initialize: function(attributes, options) {
            this.boundWidth = Constants.PUDDING_ACTUAL;
            RutherfordScatteringSimulation.prototype.initialize.apply(this, arguments);
        },

        initAlphaParticles: function() {
            this.alphaParticles = new AlphaParticles(null, {bounds: this.bounds});
        }

    });

    return PlumPuddingSimulation;
});

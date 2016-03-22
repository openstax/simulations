define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Simulation = require('common/simulation/simulation');

    var RayGun = require('./gun');
    var AlphaParticles  = require('rutherford-scattering/collections/alpha-particles');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Wraps the update function in 
     */
    var RutherfordScatteringSimulation = Simulation.extend({

        defaults: _.extend(Simulation.prototype.defaults, {

        }),
        
        initialize: function(attributes, options) {
            Simulation.prototype.initialize.apply(this, [attributes, options]);

        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            this.rayGun = new RayGun();

            this.initAlphaParticles();
        },

        resetComponents: function() {

        },

        _update: function(time, deltaTime) {
            
        },

        initAlphaParticles: function() {
            this.alphaParticles = new AlphaParticles();
        }

    });

    return RutherfordScatteringSimulation;
});

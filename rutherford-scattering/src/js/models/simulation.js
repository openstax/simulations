define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Simulation = require('common/simulation/simulation');

    var RayGun = require('./gun');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Wraps the update function in 
     */
    var RutherfordScatteringSimulation = Simulation.extend({

        defaults: _.extend(Simulation.prototype.defaults, {
            alphaEnergy: Constants.DEFAULT_ALPHA_ENERGY,
            protonCount: Constants.DEFAULT_PROTON_COUNT,
            neutronCount: Constants.DEFAULT_NEUTRON_COUNT
        }),

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            this.initBounds();
            this.initAlphaParticles();
            this.rayGun = new RayGun({alphaParticles: this.alphaParticles});
        },

        resetComponents: function() {

        },

        _update: function(time, deltaTime) {
            this.alphaParticles.cullParticles();

            this.alphaParticles.moveParticles(deltaTime, this.get('protonCount'));

            this.rayGun.update(deltaTime, this.boundWidth, this.get('alphaEnergy'));
        },

        initBounds: function() {
            this.bounds = {
                x: - this.boundWidth/2,
                y: - this.boundWidth/2,
                w: this.boundWidth,
                h: this.boundWidth
            };
        },

        initAlphaParticles: function() {},

        resetAlphaParticles: function() {
            this.alphaParticles.reset();
        },

        pauseRayGun: function() {
            this.rayGun.set('hold', true);
            this.resetAlphaParticles();
        },

        restartRayGun: function() {
            if(this.rayGun.get('hold')){
                this.rayGun.set('hold', false);                
            }
        }

    });

    return RutherfordScatteringSimulation;
});

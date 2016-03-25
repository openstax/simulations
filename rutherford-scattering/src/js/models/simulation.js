define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Simulation = require('common/simulation/simulation');

    var RayGun = require('./gun');
    var AlphaParticles  = require('rutherford-scattering/collections/alpha-particles');
    var RutherfordParticles  = require('rutherford-scattering/collections/rutherford-particles');

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
        
        initialize: function(attributes, options) {
            Simulation.prototype.initialize.apply(this, [attributes, options]);

        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            this.initAlphaParticles();
            this.rayGun = new RayGun({alphaParticles: this.alphaParticles});
        },

        resetComponents: function() {

        },

        _update: function(time, deltaTime) {
            this.alphaParticles.each(function(alphaParticle){
                if(alphaParticle){
                    alphaParticle.move(deltaTime, this.get('protonCount'));                    
                }
            }, this);

            this.rayGun.update(deltaTime, {width: 150, minY: -75}, this.get('alphaEnergy'));
        },

        initAlphaParticles: function() {
            this.alphaParticles = new AlphaParticles(null, {bounds: {x: -75, y: -75, w: 150, h: 150}});
        }

    });

    return RutherfordScatteringSimulation;
});

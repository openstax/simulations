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
            alphaEnergy: Constants.DEFAULT_ALPHA_ENERGY
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
                    alphaParticle.move(deltaTime);                    
                }
            });

            this.rayGun.update(deltaTime, {width: 300, minY: -150}, this.get('alphaEnergy'));
        },

        initAlphaParticles: function() {
            this.alphaParticles = new AlphaParticles(null, {bounds: {x: -150, y: -150, w: 300, h: 300}});
        }

    });

    return RutherfordScatteringSimulation;
});

define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Simulation = require('common/simulation/simulation');

    var ElectricForceLaw = require('models/law/electric-force');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Contains all the logic for the model of the simulation.  It has a mixture of
     *   functionality from various classes in the original PhET version, including:
     *
     *     - core.RandomSystemFactory
     *     - phys2d_efield.System2D
     *
     * Note: I've stripped out all the random stuff from RandomSystemFactory because
     *   it wasn't actually utilized in their finished product.
     */
    var EFDSimulation = Simulation.extend({

        defaults: _.extend(Simulation.prototype.defaults, {

        }),
        
        initialize: function(attributes, options) {
            Simulation.prototype.initialize.apply(this, [attributes, options]);

        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            // TODO: See RandomSystemFactory to:
            //  - Set up bounds
            //  - Do velocity update and position update

            // Electric force law (found in EFieldSimulationPanel in the original)
            this.fieldLaw = new ElectricForceLaw();
        },

        resetComponents: function() {

            // Electric force law
            this.fieldLaw.setField(0, 0);
        },

        _update: function(time, deltaTime) {
            
        }

    });

    return EFDSimulation;
});

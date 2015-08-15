define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Simulation = require('common/simulation/simulation');

    var Antenna                     = require('models/antenna');
    var PositionConstrainedElectron = require('models/electron/position-constrained');
    var EmfSensingElectron          = require('models/electron/emf-sensing');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Wraps the update function in 
     */
    var RadioWavesSimulation = Simulation.extend({

        defaults: _.extend(Simulation.prototype.defaults, {

        }),
        
        initialize: function(attributes, options) {
            this.origin = new Vector2(125, 300);

            Simulation.prototype.initialize.apply(this, [attributes, options]);
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            // Create the transmitting antenna
            this.transmittingAntenna = new Antenna(
                new Vector2(this.origin.x, this.origin.y - 100), 
                new Vector2(this.origin.x, this.origin.y + 250)
            );

            // Create the transmitting antenna's electron
            this.transmittingElectron = new PositionConstrainedElectron({
                position: new Vector2(this.origin.x, this.origin.y)
            }, {
                positionConstraint: this.transmittingAntenna
            });

            // Create the receiving antenna
            this.receivingAntenna = new Antenna(
                new Vector2(this.origin.x + 679, this.transmittingElectron.getStartPosition().y - 50), 
                new Vector2(this.origin.x + 679, this.transmittingElectron.getStartPosition().y + 75)
            );

            // Create the receiving antenna's atom
            this.receivingElectron = new EmfSensingElectron({
                position: new Vector2(this.origin.x + 680, this.transmittingElectron.getStartPosition().y)
            }, {
                positionConstraint: this.receivingAntenna
            });
        },

        _update: function(time, deltaTime) {
            
        },

        setTransmittingElectronMovementStrategyToManual: function() {

        },

        setTransmittingElectronMovementStrategyToSinusoidal: function(frequency, amplitude) {
            // The original one had us creating a new MovementType object each time and
            //   passing it to setTransmittingElectronMovementStrategy, but here I'm 
            //   creating two separate functions instead
            //this.transmittingElectron.
        }

    });

    return RadioWavesSimulation;
});

define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var FixedIntervalSimulation = require('common/simulation/fixed-interval-simulation');
    var Vector2    = require('common/math/vector2');

    var Antenna                     = require('models/antenna');
    var PositionConstrainedElectron = require('models/electron/position-constrained');
    var EmfSensingElectron          = require('models/electron/emf-sensing');
    var ManualMovementStrategy      = require('models/movement-strategy/manual');
    var SinusoidalMovementStrategy  = require('models/movement-strategy/sinusoidal');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Wraps the update function in 
     */
    var RadioWavesSimulation = FixedIntervalSimulation.extend({

        defaults: _.extend(FixedIntervalSimulation.prototype.defaults, {

        }),
        
        initialize: function(attributes, options) {
            options = _.extend({
                frameDuration: Constants.FRAME_DURATION,
                deltaTimePerFrame: Constants.DT_PER_FRAME
            }, options);

            this.origin = new Vector2(Constants.SIMULATION_ORIGIN.x, Constants.SIMULATION_ORIGIN.y);

            FixedIntervalSimulation.prototype.initialize.apply(this, [attributes, options]);
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
            var receivingXOffset = 625;
            this.receivingAntenna = new Antenna(
                new Vector2(this.origin.x + receivingXOffset, this.transmittingElectron.getStartPosition().y - 50), 
                new Vector2(this.origin.x + receivingXOffset, this.transmittingElectron.getStartPosition().y + 75)
            );

            // Create the receiving antenna's atom
            this.receivingElectron = new EmfSensingElectron({
                position: new Vector2(this.origin.x + 680, this.transmittingElectron.getStartPosition().y)
            }, {
                positionConstraint: this.receivingAntenna,
                sourceElectron: this.transmittingElectron
            });

            // Create movement strategies
            this.manualMovement     = new ManualMovementStrategy(this.transmittingElectron);
            this.sinusoidalMovement = new SinusoidalMovementStrategy(this.transmittingElectron, Constants.DEFAULT_FREQUENCY, Constants.DEFAULT_AMPLITUDE);
        },

        _update: function(time, deltaTime) {
            this.transmittingElectron.update(time, deltaTime);
            this.receivingElectron.update(time, deltaTime);
        },

        setTransmittingElectronMovementStrategyToManual: function() {
            this.transmittingElectron.setMovementStrategy(this.manualMovement);
        },

        setTransmittingElectronMovementStrategyToSinusoidal: function() {
            this.transmittingElectron.setMovementStrategy(this.sinusoidalMovement);
        }

    });

    return RadioWavesSimulation;
});

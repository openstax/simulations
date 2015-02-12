define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Simulation = require('common/simulation/simulation');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Wraps the update function in 
     */
    var SOMSimulation = Simulation.extend({

        defaults: _.extend(Simulation.prototype.defaults, {
            isExploded: false,
            particleContainerHeight: Constants.SOMSimulation.PARTICLE_CONTAINER_INITIAL_HEIGHT,
            heatingCoolingAmount: 0
        }),
        
        initialize: function(attributes, options) {
            Simulation.prototype.initialize.apply(this, [attributes, options]);

            // Strategy patterns that are applied to the data set in order to create
            // the overall behavior of the simulation.
            this.atomPositionUpdater;
            this.moleculeForceAndMotionCalculator = new NullMoleculeForceAndMotionCalculator();
            this.phaseStateChanger;
            this.isoKineticThermostat;
            this.andersenThermostat;

            // Attributes of the container and simulation as a whole.
            this.minAllowableContainerHeight;
            this.particles = [];

            // Data set containing the atom and molecule position, motion, and force information.
            this.moleculeDataSet;

            this.normalizedContainerWidth;
            this.normalizedContainerHeight;
            this.temperatureSetPoint;
            this.gravitationalAcceleration;
            this.tempAdjustTickCounter;
            this.currentMolecule;
            this.particleDiameter;
            this.thermostatType;
            this.heightChangeCounter;
            this.minModelTemperature;
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            
        },

        resetContainerSize: function() {
            this.set('particleContainerHeight', SOMSimulation.PARTICLE_CONTAINER_INITIAL_HEIGHT);
            this.set('targetContainerHeight',   SOMSimulation.PARTICLE_CONTAINER_INITIAL_HEIGHT);
            this.normalizedContainerHeight = this.get('particleContainerHeight') / this.particleDiameter;
            this.normalizedContainerWidth  = SOMSimulation.PARTICLE_CONTAINER_WIDTH / this.particleDiameter;
        },

        _update: function(time, deltaTime) {
            
        }

    }, Constants.SOMSimulation);

    return SOMSimulation;
});

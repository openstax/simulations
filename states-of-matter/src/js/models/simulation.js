define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Simulation = require('common/simulation/simulation');

    var Atom = require('models/atom');

    /**
     * Constants
     */
    var Constants = require('constants');
    var MoleculeTypes = Constants.MoleculeTypes;
    var S = Constants.SOMSimulation;

    /**
     * Wraps the update function in 
     */
    var SOMSimulation = Simulation.extend({

        defaults: _.extend(Simulation.prototype.defaults, {
            isExploded: false,
            particleContainerHeight: S.PARTICLE_CONTAINER_INITIAL_HEIGHT,
            heatingCoolingAmount: 0,
            moleculeType: MoleculeTypes.NEON
        }),

        // this.atomPositionUpdater;
        // this.moleculeForceAndMotionCalculator = new NullMoleculeForceAndMotionCalculator();
        // this.phaseStateChanger;
        // this.isoKineticThermostat;
        // this.andersenThermostat;

        // // Attributes of the container and simulation as a whole.
        // this.minAllowableContainerHeight;
        // this.particles = [];

        // // Data set containing the atom and molecule position, motion, and force information.
        // this.moleculeDataSet;

        // this.normalizedContainerWidth;
        // this.normalizedContainerHeight;
        // this.temperatureSetPoint;
        // this.gravitationalAcceleration;
        // this.tempAdjustTickCounter;
        // this.currentMolecule;
        // this.particleDiameter;
        // this.thermostatType;
        // this.heightChangeCounter;
        // this.minModelTemperature;
        
        initialize: function(attributes, options) {
            Simulation.prototype.initialize.apply(this, [attributes, options]);


            this.currentMolecule = S.DEFAULT_MOLECULE;
            this.particleDiameter = 1;
            this.thermostatType = S.ADAPTIVE_THERMOSTAT;
            this.heightChangeCounter = 0;



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
            
            this.minModelTemperature;

            this.on('change:moleculeType', this.moleculeTypeChanged);
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            this.gravitationalAcceleration = S.INITIAL_GRAVITATIONAL_ACCEL;
            this.tempAdjustTickCounter = 0;
            this.temperatureSetPoint = S.INITIAL_TEMPERATURE;

            this.set({
                isExploded: false,
                heatingCoolingAmount: 0
            });

            resetContainerSize();
        },

        /**
         * Sets the container size to defaults.  Called at the start and
         *   when the lid is returned after being blown away.
         */
        resetContainerSize: function() {
            this.set('particleContainerHeight', S.PARTICLE_CONTAINER_INITIAL_HEIGHT);
            this.set('targetContainerHeight',   S.PARTICLE_CONTAINER_INITIAL_HEIGHT);
            this.normalizedContainerHeight = this.get('particleContainerHeight') / this.particleDiameter;
            this.normalizedContainerWidth  = S.PARTICLE_CONTAINER_WIDTH / this.particleDiameter;
        },

        /**
         * Initialize the particles by calling the appropriate initialization
         *   routine, which will set their positions, velocities, etc.
         */
        initializeParticles: function(phase) {

            // Initialize the particles
            switch(this.currentMolecule) {
                case MoleculeTypes.DIATOMIC_OXYGEN:
                    this.initializeDiatomic(this.currentMolecule, phase);
                    break;
                case MoleculeTypes.NEON:
                    this.initializeMonatomic(this.currentMolecule, phase);
                    break;
                case MoleculeTypes.ARGON:
                    this.initializeMonatomic(this.currentMolecule, phase);
                    break;
                case MoleculeTypes.USER_DEFINED_MOLECULE:
                    this.initializeMonatomic(this.currentMolecule, phase);
                    break;
                case MoleculeTypes.WATER:
                    this.initializeTriatomic(this.currentMolecule, phase);
                    break;
                default:
                    console.error('ERROR: Unrecognized particle type, using default.');
                    break;
            }

            // This is needed in case we were switching from another 
            //   molecule that was under pressure.
            this.trigger('pressure-changed'); 
           
            this.calculateMinAllowableContainerHeight();
        },

        /**
         * Initialize the various model components to handle a simulation in which
         *   all the molecules are single atoms.
         */
        initMonatomic: function(moleculeType, phase) {
            // Verify that a valid molecule type was provided.
            if (!(
                moleculeType === MoleculeTypes.NEON ||
                moleculeType === MoleculeTypes.ARGON ||
                moleculeType === MoleculeTypes.USER_DEFINED
            ) {
                throw 'Molecule specified is not monatomic';
            }

            // Determine the number of atoms/molecules to create.  This will be a cube
            //   (really a square, since it's 2D, but you get the idea) that takes
            //   up a fixed amount of the bottom of the container, so the number of
            //   molecules that can fit depends on the size of the individual.
            var particleDiameter;
            switch (moleculeType) {
                case MoleculeTypes.NEON:
                    particleDiameter = Atom.NeonAtom.RADIUS * 2;
                    break;
                case MoleculeTypes.ARGON:
                    particleDiameter = Atom.ArgonAtom.RADIUS * 2;
                    break;
                case MoleculeTypes.USER_DEFINED:
                default:
                    // Force it to neon
                    moleculeType = MoleculeTypes.NEON;
                    particleDiameter = Atom.NeonAtom.RADIUS * 2;
                    break;
            }

            // Initialize the number of atoms assuming that the solid form, when
            //   made into a square, will consume about 1/3 the width of the
            //   container.
            var numberOfAtoms = Math.floor(
                Math.pow(
                    Math.round(StatesOfMatterConstants.CONTAINER_BOUNDS.width / ((particleDiameter * 1.05) * 3)),
                    2 
                )
            );

            // Create the normalized data set for the one-atom-per-molecule case.
            this.moleculeDataSet = new MoleculeForceAndMotionDataSet(1);

            // Create the strategies that will work on this data set.
            this.phaseStateChanger = new MonatomicPhaseStateChanger(this);
            this.atomPositionUpdater = new MonatomicAtomPositionUpdater();
            this.moleculeForceAndMotionCalculator = new MonatomicVerletAlgorithm(this);
            this.isoKineticThermostat = new IsokineticThermostat(this.moleculeDataSet, this.minModelTemperature);
            this.andersenThermostat = new AndersenThermostat(this.moleculeDataSet, this.minModelTemperature);

            // Create the individual atoms and add them to the data set.
            for (var i = 0; i < numberOfAtoms; i++) {

                // Create the atom.
                var moleculeCenterOfMassPosition = new Vector2();
                var moleculeVelocity = new Vector2();
                var atomPositions = [];
                atomPositions[0] = new Vector2();

                // Add the atom to the data set.
                this.moleculeDataSet.addMolecule(atomPositions, moleculeCenterOfMassPosition, moleculeVelocity, 0);

                // Add particle to model set.
                var atom;
                var particleDiameter;
                switch (moleculeType) {
                    case MoleculeTypes.NEON:
                        atom = new Atom.NeonAtom(0, 0);
                        break;
                    case MoleculeTypes.ARGON:
                        atom = new Atom.ArgonAtom(0, 0);
                        break;
                    case MoleculeTypes.USER_DEFINED:
                    default:
                        atom = new Atom.NeonAtom(0, 0);
                        break;
                }
                this.particles.push(atom);
            }

            // Initialize the particle positions according the to requested phase.
            this.setPhase(phase);

            // For the atom with adjustable interaction, set its temperature a
            // bit higher initially so that it is easier to see the effect of
            // changing the epsilon value.
            // if ( getMoleculeType() == StatesOfMatterConstants.USER_DEFINED_MOLECULE ) {
            //     setTemperature( SLUSH_TEMPERATURE );
            // }
        },

        /**
         * Initialize the various model components to handle a simulation in which
         *   each molecule consists of two atoms, e.g. oxygen.
         */
        initializeDiatomic: function(moleculeType, phase) {
            // Verify that a valid molecule type was provided.
            if (moleculeType !== MoleculeTypes.DIATOMIC_OXYGEN)
                throw 'Molecule specified is not a valid diatomic molecule';

            // Determine the number of atoms/molecules to create.  This will be a cube
            //   (really a square, since it's 2D, but you get the idea) that takes
            //   up a fixed amount of the bottom of the container, so the number of
            //   molecules that can fit depends on the size of the individual atom.
            var numberOfAtoms = Math.floor(
                Math.pow(
                    Math.round(StatesOfMatterConstants.CONTAINER_BOUNDS.width / ((OxygenAtom.RADIUS * 2.1) * 3)),
                    2 
                )
            );

            if ( numberOfAtoms % 2 != 0 )
                numberOfAtoms--;
            int numberOfMolecules = numberOfAtoms / 2;

            // Create the normalized data set for the one-atom-per-molecule case.
            this.moleculeDataSet = new MoleculeForceAndMotionDataSet(2);

            // Create the strategies that will work on this data set.
            this.phaseStateChanger = new DiatomicPhaseStateChanger(this);
            this.atomPositionUpdater = new DiatomicAtomPositionUpdater();
            this.moleculeForceAndMotionCalculator = new DiatomicVerletAlgorithm(this);
            this.isoKineticThermostat = new IsokineticThermostat(this.moleculeDataSet, this.minModelTemperature);
            this.andersenThermostat = new AndersenThermostat(this.moleculeDataSet, this.minModelTemperature);

            // Create the individual atoms and add them to the data set.
            for (var i = 0; i < numberOfMolecules; i++) {

                // Create the molecule.
                var moleculeCenterOfMassPosition = new Vector2();
                var moleculeVelocity = new Vector2();
                var atomPositions = [];
                atomPositions[0] = new Vector2();
                atomPositions[1] = new Vector2();

                // Add the atom to the data set.
                this.moleculeDataSet.addMolecule(atomPositions, moleculeCenterOfMassPosition, moleculeVelocity, 0);

                // Add atoms to model set.
                this.particles.push(new Atom.OxygenAtom(0, 0));
                this.particles.push(new Atom.OxygenAtom(0, 0));
            }

            // Initialize the particle positions according the to requested phase.
            this.setPhase(phase);
        },

        /**
         * Initialize the various model components to handle a simulation in which
         * each molecule consists of three atoms, e.g. water.
         */
        initializeTriatomic: function(moleculeType, phase) {
            // Verify that a valid molecule type was provided.
            if (moleculeType !== MoleculeTypes.WATER)
                throw 'Molecule specified is not a valid diatomic molecule';

            // Determine the number of atoms/molecules to create.  This will be a cube
            //   (really a square, since it's 2D, but you get the idea) that takes
            //   up a fixed amount of the bottom of the container, so the number of
            //   molecules that can fit depends on the size of the individual atom.
            var waterMoleculeDiameter = OxygenAtom.RADIUS * 2.1;
            var moleculesAcrossBottom = Math.round(
                StatesOfMatterConstants.CONTAINER_BOUNDS.width / (waterMoleculeDiameter * 1.2)
            );
            var numberOfMolecules = Math.floor(Math.pow(moleculesAcrossBottom / 3, 2));

            // Create the normalized data set for the one-atom-per-molecule case.
            this.moleculeDataSet = new MoleculeForceAndMotionDataSet(3);

            // Create the strategies that will work on this data set.
            this.phaseStateChanger = new WaterPhaseStateChanger(this);
            this.atomPositionUpdater = new WaterAtomPositionUpdater();
            this.moleculeForceAndMotionCalculator = new WaterVerletAlgorithm(this);
            this.isoKineticThermostat = new IsokineticThermostat(this.moleculeDataSet, this.minModelTemperature);
            this.andersenThermostat = new AndersenThermostat(this.moleculeDataSet, this.minModelTemperature);

            // Create the individual atoms and add them to the data set.
            for (var i = 0; i < numberOfMolecules; i++) {

                // Create the molecule.
                var moleculeCenterOfMassPosition = new Vector2();
                var moleculeVelocity = new Vector2();
                var atomPositions = [];
                atomPositions[0] = new Vector2();
                atomPositions[1] = new Vector2();
                atomPositions[2] = new Vector2();

                // Add the atom to the data set.
                this.moleculeDataSet.addMolecule(atomPositions, moleculeCenterOfMassPosition, moleculeVelocity, 0);

                // Add atoms to model set.
                this.particles.push(new Atom.OxygenAtom(0, 0));
                this.particles.push(new Atom.HydrogenAtom(0, 0));
                this.particles.push(new Atom.HydrogenAtom(0, 0));
            }

            // Initialize the particle positions according the to requested phase.
            this.setPhase(phase);
        },

        /**
         * Calculate the minimum allowable container height based on
         *   the current number of particles.
         */
        calculateMinAllowableContainerHeight: function() {
            this.minAllowableContainerHeight = this.particleDiameter
                * (this.moleculeDataSet.getNumberOfMolecules() / this.normalizedContainerWidth);
        },

        /**
         * Return a phase value based on the current temperature.
         */
        mapTemperatureToPhase: function() {
            var phase;

            if (this.temperatureSetPoint < S.SOLID_TEMPERATURE + ((S.LIQUID_TEMPERATURE - S.SOLID_TEMPERATURE) / 2)) 
                phase = S.PHASE_SOLID;
            else if (this.temperatureSetPoint < S.LIQUID_TEMPERATURE + ((S.GAS_TEMPERATURE - S.LIQUID_TEMPERATURE) / 2)) 
                phase = S.PHASE_LIQUID;
            else
                phase = S.PHASE_GAS;

            return phase;
        },

        /**
         * Convert a value for epsilon that is in the real range of values into a
         *   scaled value that is suitable for use with the motion and force
         *   calculators.
         */
        convertEpsilonToScaledEpsilon: function(epsilon) {
            // The following conversion of the target value for epsilon
            //   to a scaled value for the motion calculator object was
            //   determined empirically such that the resulting behavior
            //   roughly matched that of the existing monatomic molecules.
            return epsilon / (Constants.MAX_EPSILON / 2 );
        },

        convertScaledEpsilonToEpsilon: function(scaledEpsilon) {
            return scaledEpsilon * Constants.MAX_EPSILON / 2;
        },

        _update: function(time, deltaTime) {
            
        },

        /**
         * Called when the moleculeType attribute has changed.
         */
        moleculeTypeChanged: function(simulation, moleculeType) {
            // Verify that this is a supported value.
            if (_.values(MoleculeTypes).indexOf(moleculeType) === -1) {
                console.error('Error: Unsupported molecule type.');
                this.set('moleculeType', MoleculeTypes.NEON);
                return;
            }

            // Retain the current phase so that we can set the particles back to
            //   this phase once they have been created and initialized.
            var phase = this.mapTemperatureToPhase();

            // Remove existing particles and reset the global model parameters.
            this.removeAllParticles();
            this.initializeModelParameters();

            // Set the new molecule type.
            this.currentMolecule = moleculeType;

            // Set the model parameters that are dependent upon the molecule type.
            switch(this.currentMolecule) {
                case MoleculeTypes.DIATOMIC_OXYGEN:
                    this.particleDiameter = Atom.OxygenAtom.RADIUS * 2;
                    this.minModelTemperature = 0.5 * S.TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE / S.O2_TRIPLE_POINT_IN_KELVIN;
                    break;
                case MoleculeTypes.NEON:
                    this.particleDiameter = Atom.NeonAtom.RADIUS * 2;
                    this.minModelTemperature = 0.5 * S.TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE / S.NEON_TRIPLE_POINT_IN_KELVIN;
                    break;
                case MoleculeTypes.ARGON:
                    this.particleDiameter = Atom.ArgonAtom.RADIUS * 2;
                    this.minModelTemperature = 0.5 * S.TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE / S.ARGON_TRIPLE_POINT_IN_KELVIN;
                    break;
                case MoleculeTypes.WATER:
                    // Use a radius value that is artificially large, because the
                    //   educators have requested that water look "spaced out" so that
                    //   users can see the crystal structure better, and so that the
                    //   solid form will look larger (since water expands when frozen).
                    this.particleDiameter = Atom.OxygenAtom.RADIUS * 2.9;
                    this.minModelTemperature = 0.5 * S.TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE / S.WATER_TRIPLE_POINT_IN_KELVIN;
                    break;
                // case MoleculeTypes.USER_DEFINED_MOLECULE:
                //     this.particleDiameter = ConfigurableStatesOfMatterAtom.DEFAULT_RADIUS * 2;
                //     this.minModelTemperature = 0.5 * TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE / ADJUSTABLE_ATOM_TRIPLE_POINT_IN_KELVIN;
                //     break;
                default:
                    throw 'Current molecule unsupported.'; // Should never happen, so it should be debugged if it does.
            }

            // Reset the container size.  This must be done after the diameter is
            //   initialized because the normalized size is dependent upon the
            //   particle diameter.
            this.resetContainerSize();

            // Initiate a reset in order to get the particles into predetermined
            //   locations and energy levels.
            this.initializeParticles(phase);

            // Notify listeners that the molecule type has changed.
            this.trigger('interaction-strength-changed');
        },

    }, Constants.SOMSimulation);

    return SOMSimulation;
});

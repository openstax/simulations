define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Simulation = require('common/simulation/simulation');
    var Vector2    = require('common/math/vector2');

    var Atom                          = require('models/atom');
    var MoleculeForceAndMotionDataSet = require('models/molecule-force-and-motion-data-set');
    var AndersenThermostat            = require('models/thermostat/andersen');
    var IsokineticThermostat          = require('models/thermostat/isokinetic');
    var PhaseStateChanger             = require('models/phase-state-changer');
    var MonatomicPhaseStateChanger    = require('models/phase-state-changer/monatomic');
    var DiatomicPhaseStateChanger     = require('models/phase-state-changer/diatomic');
    var WaterPhaseStateChanger        = require('models/phase-state-changer/water');
    var MonatomicAtomPositionUpdater  = require('models/atom-position-updater/monatomic');
    var DiatomicAtomPositionUpdater   = require('models/atom-position-updater/diatomic');
    var WaterAtomPositionUpdater      = require('models/atom-position-updater/water');
    var MonatomicVerletAlgorithm      = require('models/verlet-algorithm/monatomic');
    var DiatomicVerletAlgorithm       = require('models/verlet-algorithm/diatomic');
    var WaterVerletAlgorithm          = require('models/verlet-algorithm/water');

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
            exploded: false,
            particleContainerHeight: null,
            targetContainerHeight: null,
            heatingCoolingAmount: null,
            temperatureSetPoint: null,
            gravitationalAcceleration: null,
            moleculeType: S.DEFAULT_MOLECULE
        }),


        /*************************************************************************
         **                                                                     **
         **                  INITIALIZATION / RESET FUNCTIONS                   **
         **                                                                     **
         *************************************************************************/
        
        initialize: function(attributes, options) {
            // Managing frame rate
            this.frameDuration = SOMSimulation.FRAME_DURATION;
            this.frameAccumulator = 0;

            // Initializing some properties
            this.currentMolecule = S.DEFAULT_MOLECULE;
            this.particleDiameter = 1;
            this.thermostatType = S.ADAPTIVE_THERMOSTAT;
            this.heightChangeCounter = 0;
            this.heatingCoolingAmount = this.get('heatingCoolingAmount');

            // All the non-normalized particles
            this.particles = [];

            this.on('change:moleculeType', this.moleculeTypeChanged);
            this.on('change:targetContainerHeight', this.targetContainerHeightChanged);
            this.on('change:temperatureSetPoint', this.temperatureSetPointChanged);
            this.on('change:gravitationalAcceleration', this.gravitationalAccelerationChanged);
            this.on('change:heatingCoolingAmount', this.heatingCoolingAmountChanged);

            this.moleculeTypeChanged(this, this.get('moleculeType'));

            Simulation.prototype.initialize.apply(this, [attributes, options]); 
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            this.initModelParameters();

            this.set('moleculeType', S.DEFAULT_MOLECULE);

            this.resetContainerSize();
        },

        /**
         * Sets the container size to defaults.  Called at the start and
         *   when the lid is returned after being blown away.
         */
        resetContainerSize: function() {
            this.set('particleContainerHeight', Constants.PARTICLE_CONTAINER_INITIAL_HEIGHT);
            this.set('targetContainerHeight',   Constants.PARTICLE_CONTAINER_INITIAL_HEIGHT);
            this.normalizedContainerHeight = this.get('particleContainerHeight') / this.particleDiameter;
            this.normalizedContainerWidth  = Constants.PARTICLE_CONTAINER_WIDTH / this.particleDiameter;
        },

        initModelParameters: function() {
            this.tempAdjustTickCounter = 0;

            this.set({
                exploded: false,
                heatingCoolingAmount: 0,
                temperatureSetPoint: S.INITIAL_TEMPERATURE,
                gravitationalAcceleration: S.INITIAL_GRAVITATIONAL_ACCEL
            });
        },

        /**
         * Initialize the particles by calling the appropriate initialization
         *   routine, which will set their positions, velocities, etc.
         */
        initParticles: function(phase) {

            // Initialize the particles
            switch(this.currentMolecule) {
                case MoleculeTypes.DIATOMIC_OXYGEN:
                    this.initDiatomic(this.currentMolecule, phase);
                    break;
                case MoleculeTypes.NEON:
                    this.initMonatomic(this.currentMolecule, phase);
                    break;
                case MoleculeTypes.ARGON:
                    this.initMonatomic(this.currentMolecule, phase);
                    break;
                case MoleculeTypes.USER_DEFINED_MOLECULE:
                    this.initMonatomic(this.currentMolecule, phase);
                    break;
                case MoleculeTypes.WATER:
                    this.initTriatomic(this.currentMolecule, phase);
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
            )) {
                throw 'Molecule specified is not monatomic';
            }

            
            
            var atomConstructor;
            switch (moleculeType) {
                case MoleculeTypes.NEON:
                    atomConstructor = Atom.NeonAtom;
                    break;
                case MoleculeTypes.ARGON:
                    atomConstructor = Atom.ArgonAtom;
                    break;
                default:
                    // Force it to neon
                    moleculeType = MoleculeTypes.NEON;
                    atomConstructor = Atom.NeonAtom;
                    break;
            }

            // Determine the number of atoms/molecules to create.  This will be a cube
            //   (really a square, since it's 2D, but you get the idea) that takes
            //   up a fixed amount of the bottom of the container, so the number of
            //   molecules that can fit depends on the size of the individual.
            var particleDiameter = atomConstructor.RADIUS * 2;

            // Initialize the number of atoms assuming that the solid form, when
            //   made into a square, will consume about 1/3 the width of the
            //   container.
            var numberOfAtoms = Math.floor(
                Math.pow(
                    Math.round(Constants.CONTAINER_BOUNDS.w / ((particleDiameter * 1.05) * 3)),
                    2 
                )
            );

            // Create the normalized data set for the one-atom-per-molecule case.
            this.moleculeDataSet = new MoleculeForceAndMotionDataSet(1);

            // Create the strategies that will work on this data set.
            this.phaseStateChanger = new MonatomicPhaseStateChanger(this);
            this.atomPositionUpdater = MonatomicAtomPositionUpdater;
            this.moleculeForceAndMotionCalculator = new MonatomicVerletAlgorithm(this);
            this.isokineticThermostat = new IsokineticThermostat(this.moleculeDataSet, this.minModelTemperature);
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
                this.particles.push(new atomConstructor(0, 0));
            }
            this.trigger('particles-initialized');

            // Initialize the particle positions according the to requested phase.
            this.setPhase(phase);

            // For the atom with adjustable interaction, set its temperature a
            // bit higher initially so that it is easier to see the effect of
            // changing the epsilon value.
            // if ( getMoleculeType() == Constants.USER_DEFINED_MOLECULE ) {
            //     setTemperature( SLUSH_TEMPERATURE );
            // }
        },

        /**
         * Initialize the various model components to handle a simulation in which
         *   each molecule consists of two atoms, e.g. oxygen.
         */
        initDiatomic: function(moleculeType, phase) {
            // Verify that a valid molecule type was provided.
            if (moleculeType !== MoleculeTypes.DIATOMIC_OXYGEN)
                throw 'Molecule specified is not a valid diatomic molecule';

            // Determine the number of atoms/molecules to create.  This will be a cube
            //   (really a square, since it's 2D, but you get the idea) that takes
            //   up a fixed amount of the bottom of the container, so the number of
            //   molecules that can fit depends on the size of the individual atom.
            var numberOfAtoms = Math.floor(
                Math.pow(
                    Math.round(Constants.CONTAINER_BOUNDS.w / ((Atom.OxygenAtom.RADIUS * 2.1) * 3)),
                    2 
                )
            );

            if (numberOfAtoms % 2 !== 0)
                numberOfAtoms--;
            var numberOfMolecules = numberOfAtoms / 2;

            // Create the normalized data set for the one-atom-per-molecule case.
            this.moleculeDataSet = new MoleculeForceAndMotionDataSet(2);

            // Create the strategies that will work on this data set.
            this.phaseStateChanger = new DiatomicPhaseStateChanger(this);
            this.atomPositionUpdater = DiatomicAtomPositionUpdater;
            this.moleculeForceAndMotionCalculator = new DiatomicVerletAlgorithm(this);
            this.isokineticThermostat = new IsokineticThermostat(this.moleculeDataSet, this.minModelTemperature);
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
            this.trigger('particles-initialized');

            // Initialize the particle positions according the to requested phase.
            this.setPhase(phase);
        },

        /**
         * Initialize the various model components to handle a simulation in which
         * each molecule consists of three atoms, e.g. water.
         */
        initTriatomic: function(moleculeType, phase) {
            // Verify that a valid molecule type was provided.
            if (moleculeType !== MoleculeTypes.WATER)
                throw 'Molecule specified is not a valid diatomic molecule';

            // Determine the number of atoms/molecules to create.  This will be a cube
            //   (really a square, since it's 2D, but you get the idea) that takes
            //   up a fixed amount of the bottom of the container, so the number of
            //   molecules that can fit depends on the size of the individual atom.
            var waterMoleculeDiameter = Atom.OxygenAtom.RADIUS * 2.1;
            var moleculesAcrossBottom = Math.round(
                Constants.CONTAINER_BOUNDS.w / (waterMoleculeDiameter * 1.2)
            );
            var numberOfMolecules = Math.floor(Math.pow(moleculesAcrossBottom / 3, 2));

            // Create the normalized data set for the one-atom-per-molecule case.
            this.moleculeDataSet = new MoleculeForceAndMotionDataSet(3);

            // Create the strategies that will work on this data set.
            this.phaseStateChanger = new WaterPhaseStateChanger(this);
            this.atomPositionUpdater = WaterAtomPositionUpdater;
            this.moleculeForceAndMotionCalculator = new WaterVerletAlgorithm(this);
            this.isokineticThermostat = new IsokineticThermostat(this.moleculeDataSet, this.minModelTemperature);
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
            this.trigger('particles-initialized');

            // Initialize the particle positions according the to requested phase.
            this.setPhase(phase);
        },

        /**
         * Return the lid to the container.  It only makes sense to call this after
         *   the container has exploded, otherwise it has no effect.
         */
        returnLid: function() {
            if (!this.get('exploded')) {
                console.error('Warning: Ignoring attempt to return lid when container hadn\'t exploded.');
                return;
            }

            // Remove any particles that are outside of the container. 
            //   We work with the normalized particles for this.
            var particlesOutsideOfContainer = this.removeMoleculesOutsideContainer();

            // Remove enough of the non-normalized particles so that we have the
            //   same number as the normalized.  They don't have to be the same
            //   particles since the normalized and non-normalized particles are
            //   explicitly synced up elsewhere.
            var numParticlesToRemove = this.particles.length - this.moleculeDataSet.numberOfAtoms;
            for (var i = 0; i < numParticlesToRemove; i++)
                this.particles.splice(i, 1);

            // Set the container to be unexploded.
            this.unexplode();

            // Set the phase to be gas, since otherwise the extremely high
            // kinetic energy of the particles causes an unreasonably high
            // temperature for the particles that remain in the container. Doing
            // this generally cools them down into a more manageable state.
            if (particlesOutsideOfContainer > 0)
                this.phaseStateChanger.setPhase(PhaseStateChanger.GAS);
        },

        /**
         * Removes any molecules from the molecule data set that are outside
         *   the container and returns the number of molecules removed.
         */
        removeMoleculesOutsideContainer: function() {
            var particlesOutsideOfContainer = 0;

            var numberOfMolecules = this.moleculeDataSet.getNumberOfMolecules();
            var firstOutsideMoleculeIndex;
            do {
                for (firstOutsideMoleculeIndex = 0; firstOutsideMoleculeIndex < numberOfMolecules; firstOutsideMoleculeIndex++) {
                    var pos = this.moleculeDataSet.moleculeCenterOfMassPositions[firstOutsideMoleculeIndex];
                    if (
                        pos.x < 0 || pos.x > this.normalizedContainerWidth || 
                        pos.y < 0 || pos.y > Constants.PARTICLE_CONTAINER_INITIAL_HEIGHT / this.particleDiameter
                    ) {
                        // This particle is outside of the container.
                        break;
                    }
                }
                if (firstOutsideMoleculeIndex < numberOfMolecules) {
                    // Remove the particle that was found.
                    this.moleculeDataSet.removeMolecule(firstOutsideMoleculeIndex);
                    particlesOutsideOfContainer++;
                }
            }
            while (firstOutsideMoleculeIndex != numberOfMolecules);

            return particlesOutsideOfContainer;
        },

        explode: function() {
            this.set('exploded', true);
            console.log('EXPLODED');
        },

        unexplode: function() {
            this.set('exploded', false);
            this.resetContainerSize();
        },

        removeAllParticles: function() {
            for (var i = this.particles.length - 1; i >= 0; i--)
                this.particles.splice(i, 1);

            // Get rid of the normalized particles.
            this.moleculeDataSet = null;
            this.trigger('particles-cleared');
        },


        /*************************************************************************
         **                                                                     **
         **      VALUE CALCULATIONS / CONVERSIONS / ACCESSORS / MODIFIERS       **
         **                                                                     **
         *************************************************************************/

        /**
         * Calculate the minimum allowable container height based on
         *   the current number of particles.
         */
        calculateMinAllowableContainerHeight: function() {
            this.minAllowableContainerHeight = this.particleDiameter
                * (this.moleculeDataSet.getNumberOfMolecules() / this.normalizedContainerWidth);
        },

        setPhase: function(phase) {
            if (phase === undefined)
                phase = PhaseStateChanger.SOLID;

            this.phaseStateChanger.setPhase(phase);

            this.syncParticlePositions();
        },

        /**
         * Return a phase value based on the current temperature.
         */
        mapTemperatureToPhase: function() {
            var phase;

            if (this.temperatureSetPoint < S.SOLID_TEMPERATURE + ((S.LIQUID_TEMPERATURE - S.SOLID_TEMPERATURE) / 2)) 
                phase = PhaseStateChanger.SOLID;
            else if (this.temperatureSetPoint < S.LIQUID_TEMPERATURE + ((S.GAS_TEMPERATURE - S.LIQUID_TEMPERATURE) / 2)) 
                phase = PhaseStateChanger.LIQUID;
            else
                phase = PhaseStateChanger.GAS;

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

        /**
         * Determine whether there are particles close to the top of the
         *   container.  This can be important for determining whether
         *   movement of the top is causing temperature changes.
         */
        particlesNearTop: function() {
            var moleculesPositions = this.moleculeDataSet.moleculeCenterOfMassPositions;
            var numberOfMolecules = this.moleculeDataSet.getNumberOfMolecules();
            var threshold = this.normalizedContainerHeight - S.PARTICLE_EDGE_PROXIMITY_RANGE;

            for (var i = 0; i < numberOfMolecules; i++) {
                if (moleculesPositions[i].y > threshold)
                    return true;
            }

            return false;
        },

        /**
         * Take the internal pressure value and convert it to atmospheres.  This
         * is dependent on the type of molecule selected.  The values and ranges
         * used in this method were derived from information provided by Paul
         * Beale.
         */
        getPressureInAtmospheres: function() {

            var pressureInAtmospheres;

            switch (this.currentMolecule) {

                case MoleculeTypes.NEON:
                    pressureInAtmospheres = 200 * this.getModelPressure();
                    break;

                case MoleculeTypes.ARGON:
                    pressureInAtmospheres = 125 * this.getModelPressure();
                    break;

                case MoleculeTypes.USER_DEFINED_MOLECULE:
                    // TODO: Not sure what to do here, need to figure it out.
                    // Using the value for Argon at the moment.
                    pressureInAtmospheres = 125 * this.getModelPressure();
                    break;

                case MoleculeTypes.WATER:
                    pressureInAtmospheres = 200 * this.getModelPressure();
                    break;

                case MoleculeTypes.DIATOMIC_OXYGEN:
                    pressureInAtmospheres = 125 * this.getModelPressure();
                    break;

                default:
                    pressureInAtmospheres = 0;
                    break;
            }

            return pressureInAtmospheres;
        },

        /**
         * Get the pressure value which is being calculated by the model and is
         *   not adjusted to represent any "real" units (such as atmospheres).
         */
        getModelPressure: function() {
            return this.moleculeForceAndMotionCalculator.getPressure();
        },

        /**
         * Take the internal temperature value and convert it to Kelvin.  This
         * is dependent on the type of molecule selected.  The values and ranges
         * used in this method were derived from information provided by Paul
         * Beale.
         */
        convertInternalTemperatureToKelvin: function() {

            if (this.particles.length === 0) {
                // Temperature is reported as 0 if there are no particles.
                return 0;
            }

            var temperatureInKelvin;
            var triplePoint = 0;
            var criticalPoint = 0;

            switch (this.currentMolecule) {

                case MoleculeTypes.NEON:
                    triplePoint   = S.NEON_TRIPLE_POINT_IN_KELVIN;
                    criticalPoint = S.NEON_CRITICAL_POINT_IN_KELVIN;
                    break;

                case MoleculeTypes.ARGON:
                    triplePoint   = S.ARGON_TRIPLE_POINT_IN_KELVIN;
                    criticalPoint = S.ARGON_CRITICAL_POINT_IN_KELVIN;
                    break;

                case MoleculeTypes.WATER:
                    triplePoint   = S.WATER_TRIPLE_POINT_IN_KELVIN;
                    criticalPoint = S.WATER_CRITICAL_POINT_IN_KELVIN;
                    break;

                case MoleculeTypes.DIATOMIC_OXYGEN:
                    triplePoint   = S.O2_TRIPLE_POINT_IN_KELVIN;
                    criticalPoint = S.O2_CRITICAL_POINT_IN_KELVIN;
                    break;

                default:
                    break;
            }

            if (this.temperatureSetPoint <= this.minModelTemperature) {
                // We treat anything below the minimum temperature as absolute zero.
                temperatureInKelvin = 0;
            }
            else if (this.temperatureSetPoint < S.TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE) {
                temperatureInKelvin = this.temperatureSetPoint * triplePoint / S.TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE;

                if (temperatureInKelvin < 0.5) {
                    // Don't return zero - or anything that would round to it - as
                    // a value until we actually reach the minimum internal temperature.
                    temperatureInKelvin = 0.5;
                }
            }
            else if (this.temperatureSetPoint < S.CRITICAL_POINT_MONATOMIC_MODEL_TEMPERATURE) {
                var slope = (criticalPoint - triplePoint) / (S.CRITICAL_POINT_MONATOMIC_MODEL_TEMPERATURE - S.TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE);
                var offset = triplePoint - (slope * S.TRIPLE_POINT_MONATOMIC_MODEL_TEMPERATURE);
                temperatureInKelvin = this.temperatureSetPoint * slope + offset;
            }
            else {
                temperatureInKelvin = this.temperatureSetPoint * criticalPoint / S.CRITICAL_POINT_MONATOMIC_MODEL_TEMPERATURE;
            }

            return temperatureInKelvin;
        },

        getNormalizedContainerWidth: function() {
            return this.normalizedContainerWidth;
        },

        getNormalizedContainerHeight: function() {
            return this.normalizedContainerHeight;
        },

        getGravitationalAcceleration: function() {
            return this.gravitationalAcceleration;
        },


        /*************************************************************************
         **                                                                     **
         **                     ATTRIBUTE CHANGE LISTENERS                      **
         **                                                                     **
         *************************************************************************/

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

            // Remove existing particles and reset the global model parameters.
            this.removeAllParticles();
            this.initModelParameters();

            // Retain the current phase so that we can set the particles back to
            //   this phase once they have been created and initialized.
            var phase = this.mapTemperatureToPhase();

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
            this.initParticles(phase);

            // Notify listeners that the molecule type has changed.
            this.trigger('interaction-strength-changed');
        },

        targetContainerHeightChanged: function(simulation, targetContainerHeight) {
            if (targetContainerHeight > Constants.PARTICLE_CONTAINER_INITIAL_HEIGHT)
                this.set('targetContainerHeight', Constants.PARTICLE_CONTAINER_INITIAL_HEIGHT);
            else if (targetContainerHeight < this.minAllowableContainerHeight)
                this.set('targetContainerHeight', this.minAllowableContainerHeight);
        },

        temperatureSetPointChanged: function(simulation, temperatureSetPoint) {
            if (temperatureSetPoint > S.MAX_TEMPERATURE) {
                this.set('temperatureSetPoint', S.MAX_TEMPERATURE);
                return;
            }
            else if (temperatureSetPoint < S.MIN_TEMPERATURE) {
                this.set('temperatureSetPoint', S.MIN_TEMPERATURE);
                return;
            }

            this.temperatureSetPoint = temperatureSetPoint;

            if (this.isokineticThermostat)
                this.isokineticThermostat.setTargetTemperature(temperatureSetPoint);

            if (this.andersenThermostat)
                this.andersenThermostat.setTargetTemperature(temperatureSetPoint);
        },

        gravitationalAccelerationChanged: function(simulation, gravitationalAcceleration) {
            if (gravitationalAcceleration > S.MAX_GRAVITATIONAL_ACCEL)
                this.set('gravitationalAcceleration', S.MAX_GRAVITATIONAL_ACCEL);
            else if (gravitationalAcceleration < 0)
                this.set('gravitationalAcceleration', 0);
            else
                this.gravitationalAcceleration = gravitationalAcceleration;
        },

        heatingCoolingAmountChanged: function(model, heatingCoolingAmount) {
            this.heatingCoolingAmount = heatingCoolingAmount * S.MAX_TEMPERATURE_CHANGE_PER_ADJUSTMENT;
        },


        /*************************************************************************
         **                                                                     **
         **                      UPDATE SEQUENCE FUNCTIONS                      **
         **                                                                     **
         *************************************************************************/

        update: function(time, deltaTime) {
            if (!this.get('paused')) {
                this.frameAccumulator += deltaTime;

                while (this.frameAccumulator >= this.frameDuration) {
                    this.step();
                    this.frameAccumulator -= this.frameDuration;
                }    
            }
        },

        step: function() {
            var particleContainerHeight = this.get('particleContainerHeight')
            if (!this.get('exploded')) {
                // Adjust the particle container height if needed.
                if (this.get('targetContainerHeight') != particleContainerHeight) {
                    this.heightChangeCounter = S.CONTAINER_SIZE_CHANGE_RESET_COUNT;
                    this.adjustContainerHeight();
                }
                else if (this.heightChangeCounter > 0)
                    this.heightChangeCounter--;
            }
            else if (particleContainerHeight < Constants.PARTICLE_CONTAINER_INITIAL_HEIGHT * 10 ) {
                // The lid is blowing off the container, so increase the container
                // size until the lid should be well off the screen.
                particleContainerHeight += S.MAX_PER_TICK_CONTAINER_EXPANSION;
                this.set('particleContainerHeight', particleContainerHeight);
            }

            // Record the pressure to see if it changes.
            var pressureBeforeAlgorithm = this.getModelPressure();
            //console.log(pressureBeforeAlgorithm);

            // Execute the Verlet algorithm.  The algorithm may be run several times
            // for each time step.
            for (var i = 0; i < S.VERLET_CALCULATIONS_PER_CLOCK_TICK; i++) {
                this.moleculeForceAndMotionCalculator.updateForcesAndMotion();
                this.runThermostat();
            }

            // Sync up the positions of the normalized particles (the molecule data set)
            //   with the particles being monitored by the view (the model data set).
            this.syncParticlePositions();

            // If the pressure changed, notify the listeners.
            if (this.getModelPressure() !== pressureBeforeAlgorithm)
                this.trigger('pressure-changed');

            // Adjust the temperature if needed.
            this.tempAdjustTickCounter++;
            if (this.tempAdjustTickCounter > S.TICKS_PER_TEMP_ADJUSTMENT && this.heatingCoolingAmount !== 0) {
                this.tempAdjustTickCounter = 0;
                this.adjustTemperature();
            }
        },

        /**
         * Set the positions of the non-normalized particles based on the positions
         *   of the normalized ones.  The ones in this.particles are the actual
         *   (non-normalized) particles; the ones in this.moleculeDataSet are the
         *   normalized ones.
         */
        syncParticlePositions: function() {
            var positionMultiplier = this.particleDiameter;
            var atomPositions = this.moleculeDataSet.atomPositions;

            for (var i = 0; i < this.moleculeDataSet.numberOfAtoms; i++) {
                //console.log(this.moleculeDataSet.moleculeCenterOfMassPositions[i].toString());
                this.particles[i].position.set(
                    atomPositions[i].x * positionMultiplier,
                    atomPositions[i].y * positionMultiplier
                );
            }

            if (this.moleculeDataSet.numberOfAtoms !== this.particles.length)
                console.error('Inconsistent number of normalized versus non-normalized particles.');
        },

        /**
         * Run the appropriate thermostat based on the settings and the state of
         *   the simulation.
         */
        runThermostat: function() {

            if (this.get('exploded')) {
                // Don't bother to run any thermostat if the lid is blown off -
                //   just let those little particles run free!
                return;
            }

            var calculatedTemperature = this.moleculeForceAndMotionCalculator.getTemperature();
            var temperatureIsChanging = false;

            if ((this.heatingCoolingAmount !== 0) ||
                (this.temperatureSetPoint + S.TEMPERATURE_CLOSENESS_RANGE < calculatedTemperature) ||
                (this.temperatureSetPoint - S.TEMPERATURE_CLOSENESS_RANGE > calculatedTemperature)) {
                temperatureIsChanging = true;
            }

            if (this.heightChangeCounter !== 0 && this.particlesNearTop()) {
                // The height of the container is currently changing and there
                //   are particles close enough to the top that they may be
                //   interacting with it.  Since this can end up adding or removing
                //   kinetic energy (i.e. heat) from the system, no thermostat is
                //   run in this case.  Instead, the temperature determined by
                //   looking at the kinetic energy of the molecules and that value
                //   is used to set the system temperature set point.
                this.set('temperatureSetPoint', this.moleculeDataSet.calculateTemperatureFromKineticEnergy());
            }
            else if (
                (this.thermostatType === S.ISOKINETIC_THERMOSTAT) ||
                (this.thermostatType === S.ADAPTIVE_THERMOSTAT && (
                    temperatureIsChanging || this.get('temperatureSetPoint') > S.LIQUID_TEMPERATURE
                ))
            ) {
                // Use the isokinetic thermostat.
                this.isokineticThermostat.adjustTemperature();
            }
            else if (
                (this.thermostatType === S.ANDERSEN_THERMOSTAT) ||
                (this.thermostatType === S.ADAPTIVE_THERMOSTAT && !temperatureIsChanging)
            ) {
                // The temperature isn't changing and it is below a certain
                //   threshold, so use the Andersen thermostat.  This is done for
                //   purely visual reasons - it looks better than the isokinetic in
                //   these circumstances.
                this.andersenThermostat.adjustTemperature();
            }

            // Note that there will be some circumstances in which no thermostat
            //   is run.  This is intentional.
        },

        /**
         * Changes the temperatureSetPoint according to the heatingCoolingAmount
         *   and simulation constraints.
         */
        adjustTemperature: function() {
            var newTemperature = this.temperatureSetPoint + this.heatingCoolingAmount;
            if (newTemperature >= S.MAX_TEMPERATURE) {
                newTemperature = S.MAX_TEMPERATURE;
            }
            else if ((newTemperature <= S.SOLID_TEMPERATURE * 0.9) && (this.heatingCoolingAmount < 0)) {
                // The temperature goes down more slowly as we begin to
                // approach absolute zero.
                newTemperature = this.temperatureSetPoint * 0.95;  // Multiplier determined empirically.
            }
            else if (newTemperature <= this.minModelTemperature) {
                newTemperature = this.minModelTemperature;
            }
            //this.temperatureSetPoint = newTemperature;
            this.set('temperatureSetPoint', this.temperatureSetPoint);
            // this.isokineticThermostat.setTargetTemperature(this.temperatureSetPoint);
            // this.andersenThermostat.setTargetTemperature(this.temperatureSetPoint);
        },

        /**
         * Changes the particleContainerHeight according to the
         *   targetContainerHeight and simulation constraints.
         */
        adjustContainerHeight: function() {
            var particleContainerHeight = this.get('particleContainerHeight');
            var heightChange = this.get('targetContainerHeight') - particleContainerHeight;
            if (heightChange > 0) {
                // The container is growing.
                if (particleContainerHeight + heightChange <= Constants.PARTICLE_CONTAINER_INITIAL_HEIGHT)
                    particleContainerHeight += Math.min(heightChange, S.MAX_PER_TICK_CONTAINER_EXPANSION);
                else
                    particleContainerHeight = Constants.PARTICLE_CONTAINER_INITIAL_HEIGHT;
            }
            else {
                // The container is shrinking.
                if (particleContainerHeight - heightChange >= this.minAllowableContainerHeight)
                    particleContainerHeight += Math.max(heightChange, -S.MAX_PER_TICK_CONTAINER_SHRINKAGE);
                else
                    particleContainerHeight = this.minAllowableContainerHeight;
            }
            this.normalizedContainerHeight = particleContainerHeight / this.particleDiameter;
            this.set('particleContainerHeight', particleContainerHeight);
        },

        /**
         * Inject a new molecule of the current type into the model. This
         *   uses the current temperature to assign an initial velocity.
         */
        injectMolecule: function() {

            var injectionPointX = Constants.CONTAINER_BOUNDS.w  / this.particleDiameter * S.INJECTION_POINT_HORIZ_PROPORTION;
            var injectionPointY = Constants.CONTAINER_BOUNDS.h / this.particleDiameter * S.INJECTION_POINT_VERT_PROPORTION;

            // Make sure that it is okay to inject a new molecule.
            if (this.moleculeDataSet.getNumberOfRemainingSlots() > 1 &&
                this.normalizedContainerHeight > injectionPointY * 1.05 &&
                !this.get('exploded')) {

                var angle = Math.PI + ((Math.random() - 0.5 ) * S.MAX_INJECTED_MOLECULE_ANGLE);
                var velocity = S.MIN_INJECTED_MOLECULE_VELOCITY + (
                    Math.random() * (S.MAX_INJECTED_MOLECULE_VELOCITY - S.MIN_INJECTED_MOLECULE_VELOCITY)
                );
                var xVel = Math.cos(angle) * velocity;
                var yVel = Math.sin(angle) * velocity;
                var atomsPerMolecule = this.moleculeDataSet.getAtomsPerMolecule();
                var moleculeCenterOfMassPosition = new Vector2(injectionPointX, injectionPointY);
                var moleculeVelocity = new Vector2(xVel, yVel);
                var moleculeRotationRate = (Math.random() - 0.5) * (Math.PI / 2);
                var atomPositions = [];
                for (var i = 0; i < atomsPerMolecule; i++)
                    atomPositions[i] = new Vector2();

                // Add the newly created molecule to the data set.
                this.moleculeDataSet.addMolecule(atomPositions, moleculeCenterOfMassPosition, moleculeVelocity, moleculeRotationRate);

                // Position the atoms that comprise the molecules.
                this.atomPositionUpdater.updateAtomPositions(this.moleculeDataSet);

                if (this.moleculeDataSet.atomsPerMolecule === 1) {

                    // Add particle to model set.
                    var particle;
                    switch (this.currentMolecule) {
                        case MoleculeTypes.ARGON:
                            particle = new Atom.ArgonAtom( 0, 0 );
                            break;
                        case MoleculeTypes.NEON:
                            particle = new Atom.NeonAtom( 0, 0 );
                            break;
                        default:
                            // Use the default.
                            particle = new Atom.NeonAtom( 0, 0 );
                            break;
                    }
                    this.particles.push(particle);
                    this.trigger('particles-injected', particles, 1);
                }
                else if (this.moleculeDataSet.atomsPerMolecule === 2) {
                    // Add particles to model set.
                    for (var j = 0; j < atomsPerMolecule; j++) {
                        this.particles.push(new Atom.OxygenAtom(0, 0));
                        atomPositions[j] = new Vector2();
                        this.trigger('particles-injected', particles, 2);
                    }
                }
                else if (atomsPerMolecule === 3) {
                    // Add atoms to model set.
                    this.particles.push(new Atom.OxygenAtom(0, 0));
                    this.particles.push(new Atom.HydrogenAtom(0, 0));
                    this.particles.push(new Atom.HydrogenAtom(0, 0));
                    atomPositions[0] = new Vector2();
                    atomPositions[1] = new Vector2();
                    atomPositions[2] = new Vector2();
                    this.trigger('particles-injected', particles, 3);
                }

                if (this.particles.length === 1) {
                    // Adding the first particle is considered a temperature
                    //   change, because (in this sim anyway), no particles means a
                    //   temperature of zero.
                    this.trigger('temperature-changed');
                }

                this.syncParticlePositions();
            }

            // Recalculate the minimum allowable container size, since it depends on the number of particles.
            this.calculateMinAllowableContainerHeight();
        }

    }, Constants.SOMSimulation);

    return SOMSimulation;
});

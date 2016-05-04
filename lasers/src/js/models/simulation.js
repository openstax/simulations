define(function (require, exports, module) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var VanillaCollection = require('common/collections/vanilla');
    var QuantumConfig     = require('common/quantum/config');
    var QuantumSimulation = require('common/quantum/models/simulation');
    var Photon            = require('common/quantum/models/photon-vanilla');
    var Atom              = require('common/quantum/models/atom');
    var Tube              = require('common/quantum/models/tube');
    var PhysicsUtil       = require('common/quantum/models/physics-util');
    var Rectangle         = require('common/math/rectangle');

    var SphereSphereExpert         = require('common/mechanics/models/sphere-sphere-collision-expert');
    var SphereBoxExpert            = require('common/mechanics/models/sphere-box-collision-expert');
    var PhotonAtomCollisonExpert   = require('common/quantum/models/photon-atom-collision-expert');
    var PhotonMirrorCollisonExpert = require('./photon-mirror-collision-expert');

    // Local dependencies need to be referenced by relative paths
    //   so we can use this in other projects.
    var TwoLevelElementProperties   = require('./element-properties/two-level');
    var ThreeLevelElementProperties = require('./element-properties/three-level');
    var Mirror                      = require('./mirror');

    /**
     * Constants
     */
    var Constants = require('../constants');

    /**
     * 
     */
    var LasersSimulation = QuantumSimulation.extend({

        // Properties for two and three level atoms
        twoLevelProperties:   new TwoLevelElementProperties(),
        threeLevelProperties: new ThreeLevelElementProperties(),

        defaults: _.extend(QuantumSimulation.prototype.defaults, {

        }),
        
        initialize: function(attributes, options) {
            options = _.extend({
                framesPerSecond: Constants.FPS,
                deltaTimePerFrame: Constants.DT
            }, options);

            QuantumSimulation.prototype.initialize.apply(this, [attributes, options]);

            // Cached objects
            this._matchObject = {};
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            QuantumSimulation.prototype.initComponents.apply(this, arguments);

            var width = 800;
            var height = 800;
            var minX = Math.floor(Constants.ORIGIN.x - 50);
            var minY = Math.floor(Constants.ORIGIN.y - height / 2);
            this.boundingRectangle = new Rectangle(minX, minY, width, height);

            this.models = [];

            this.seedBeam = null;
            this.pumpingBeam = null;
            this.tube = null;

            this.photons = new VanillaCollection();
            this.lasingPhotons = new VanillaCollection();
            this.atoms = new Backbone.Collection();
            this.mirrors = [];
            
            // Set up the system of collision experts
            this.collisionExperts = [];
            this.collisionExperts.push(SphereSphereExpert);
            this.collisionExperts.push(PhotonAtomCollisonExpert);
            this.collisionExperts.push(SphereBoxExpert);
            this.collisionExperts.push(PhotonMirrorCollisonExpert);

            this.angleWindow = Constants.PHOTON_CHEAT_ANGLE;

            this.numPhotons = 0;

            // Counters for the number of atoms in each state
            this.numGroundStateAtoms = 0;
            this.numMiddleStateAtoms = 0;
            this.numHighStateAtoms = 0;

            this.set('currentElementProperties', this.twoLevelProperties);
        },

        resetComponents: function() {
            QuantumSimulation.prototype.resetComponents.apply(this, arguments);

            this.getPumpingBeam().set('photonsPerSecond', 0);
            this.getSeedBeam().set('photonsPerSecond', 0);

            // Reset atoms to the ground state
            var groundState = this.getGroundState();
            for (var i = 0; i < this.atoms.length; i++)
                this.atoms.at(i).setCurrentState(groundState);
            
            // Clear all photons
            for (var k = this.photons.length - 1; k >= 0; k--)
                this.photons.at(k).destroy();
            
            this.numPhotons = 0;
        },

        _update: function(time, deltaTime) {
            QuantumSimulation.prototype._update.apply(this, arguments);

            // Handle collisions between bodies
            this.checkCollisions(deltaTime);

            // Update all the models in the system
            this.updateModels(time, deltaTime);

            // Check to see if any photons need to be taken out of the system
            this.numPhotons = 0;
            for (var i = this.photons.length - 1; i >= 0; i--) {
                var photon = this.photons.at(i);
                this.numPhotons++;
                if (!this.boundingRectangle.contains(photon.getPosition())) {
                    // Old PhET note: We don't need to remove the element right now. The photon will
                    //   fire an event that we will catch
                    // Patrick: I've changed it to just destroy it now
                    photon.destroy();
                }
            }
        },

        updateModels: function(time, deltaTime) {
            var i;
            for (i = 0; i < this.models.length; i++)
                this.models[i].update(time, deltaTime);

            for (i = 0; i < this.photons.length; i++)
                this.photons.at(i).update(time, deltaTime);

            for (i = 0; i < this.atoms.length; i++)
                this.atoms.at(i).update(time, deltaTime);
        },

        addModel: function(model) {
            this.models.push(model);
            
            if (model instanceof Mirror)
                this.mirrors.push(model);
            
            if (model instanceof Tube)
                this.tube = model;
        },

        removeModel: function(model) {
            var index = this.models.indexOf(model);
            if (index !== -1) {
                this.models.splice(index, 1);

                if (model instanceof Mirror) {
                    index = this.mirrors.indexOf(models);
                    this.mirrors.splice(index, 1);
                }
                
                if (model instanceof Tube && this.tube === model)
                    this.tube = null;

                return true;
            }
            return false;
        },

        addPhoton: function(photon) {
            this.photons.add(photon);

            // If the photon is moving nearly horizontally and is equal in energy to the
            //   transition between the middle and ground states, consider it to be lasing
            if (this.isLasingPhoton(photon))
                this.lasingPhotons.add(photon);
        },

        addAtom: function(atom) {
            this.atoms.add(atom);
        },

        setNumEnergyLevels: function(numLevels) {
            var i;

            // Set the element properties
            switch (numLevels) {
                case 2:
                    this.setCurrentElementProperties(this.twoLevelProperties);
                    this.getPumpingBeam().set('enabled', false);
                    break;
                case 3:
                    this.setCurrentElementProperties(this.threeLevelProperties);
                    this.getPumpingBeam().set('enabled', true);
                    break;
                default:
                    throw 'Invalid number of levels';
            }

            // Set the available states of all the atoms
            for (i = 0; i < this.atoms.length; i++) {
                this.atoms.at(i).setStates(this.getCurrentElementProperties().getStates());
            }

            // Initialize the number of atoms in each level
            this.numGroundStateAtoms = 0;
            this.numMiddleStateAtoms = 0;
            this.numHighStateAtoms = 0;

            var elementProperties = this.getCurrentElementProperties();
            for (i = 0; i < this.atoms.length; i++) {
                var atom = this.atoms.at(i);

                if (atom.getCurrentState() == elementProperties.getGroundState())
                    this.numGroundStateAtoms++;

                if (atom.getCurrentState() == elementProperties.getMiddleEnergyState())
                    this.numMiddleStateAtoms++;

                if (atom.getCurrentState() == elementProperties.getHighEnergyState())
                    this.numHighStateAtoms++;
            }
            
            this.trigger('atomic-states-changed', this);
        },

        getResonatingCavity: function() {
            return this.tube;
        },

        setResonatingCavity: function(tube) {
            this.tube = tube;
        },

        getSeedBeam: function() {
            return this.seedBeam;
        },

        setSeedBeam: function(seedBeam) {
            this.setStimulatingBeam(seedBeam);
        },

        setStimulatingBeam: function(seedBeam) {
            if (this.seedBeam)
                this.removeModel(this.seedBeam);
            
            this.addModel(seedBeam);
            this.seedBeam = seedBeam;
        },

        getPumpingBeam: function() {
            return this.pumpingBeam;
        },

        setPumpingBeam: function(pumpingBeam) {
            if (this.pumpingBeam)
                this.removeModel(this.pumpingBeam);
            
            this.addModel(pumpingBeam);
            this.pumpingBeam = pumpingBeam;
        },

        setHighEnergyMeanLifetime: function(time) {
            this.getHighEnergyState().set('meanLifetime', time);
        },

        setMiddleEnergyMeanLifetime: function(time) {
            this.getMiddleEnergyState().set('meanLifetime', time);
        },

        getNumGroundStateAtoms: function() {
            return this.numGroundStateAtoms;
        },

        getNumMiddleStateAtoms: function() {
            return this.numMiddleStateAtoms;
        },

        getNumHighStateAtoms: function() {
            return this.numHighStateAtoms;
        },

        setBounds: function(bounds) {
            this.boundingRectangle.set(bounds);
        },

        getNumPhotons: function() {
            return this.numPhotons;
        },

        getMiddleEnergyState: function() {
            return this.getCurrentElementProperties().getStates()[1];
        },

        getHighEnergyState: function() {
            return this.getCurrentElementProperties().getHighEnergyState();
        },

        getStates: function() {
            return this.getCurrentElementProperties().getStates();
        },

        getNumLasingPhotons: function() {
            return this.lasingPhotons.length;
        },

        /**
         * Returns the first match, or null if none.
         */
        getMatch: function(beam) {
            var states = this.getStates();
            for (var i = 0; i < states.length; i++) {
                var state = states[i];
                var e0 = this.getGroundState().get('energyLevel');
                var transitionEnergy = state.get('energyLevel') - e0;
                var beamEnergy = PhysicsUtil.wavelengthToEnergy(beam.getWavelength());

                if (beam.get('enabled') && 
                    beam.get('photonsPerSecond') > 0 && 
                    Math.abs(beamEnergy - transitionEnergy) < QuantumConfig.ENERGY_TOLERANCE
                ) {
                    var match = this._matchObject;
                    match.time = this.get('time');
                    match.matchingEnergy = beamEnergy + e0;
                    match.e0 = e0;
                    match.transitionEnergy = transitionEnergy;
                    match.beamEnergy = beamEnergy;

                    return match;
                }
            }
            return null;
        },

        checkCollisions: function(deltaTime) {
            this.checkPhotonElectronCollisions();
            this.checkCollisionsBetweenTwoLists(this.photons.models, this.mirrors);
            this.checkCollisionsBetweenListAndBody(this.atoms.models, this.tube);

            for (var i = this.photons.length - 1; i >= 0; i--) {
                if (this.photons.at(i).markedForDestruction())
                    this.photons.at(i).destroy();
            }
        },

        checkPhotonElectronCollisions: function() {
            // Test each photon against the atoms in the section the photon is in
            for (var i = 0; i < this.photons.length; i++) {
                var photon = this.photons[i];
                if (!(photon instanceof Photon) 
                    || (this.tube.getBounds().contains(photon.get('position'))) 
                    || (this.tube.getBounds().contains(photon.getPreviousPosition()))
                ) {
                    for (var j = 0; j < this.atoms.length; j++) {
                        var atom = this.atoms[j];
                        var s1 = atom.getCurrentState();
                        var s2 = atom.getCurrentState();
                        PhotonAtomCollisonExpert.detectAndDoCollision(photon, atom);
                        if (s1 != s2)
                            break;
                    }
                }
            }
        },

        /*
         * Detects and computes collisions between the items in two lists of collidable objects
         */
        checkCollisionsBetweenTwoLists: function(collidablesA, collidablesB) {
            for (var i = 0; i < collidablesA.length; i++) {
                var collidable1 = collidablesA[i];
                if (!(collidable1 instanceof Photon)
                    || this.tube.getBounds().contains(collidable1.getPosition())
                    || this.tube.getBounds().contains(collidable1.getPreviousPosition())
                ) {
                    for (var j = 0; j < collidablesB.length; j++) {
                        var collidable2 = collidablesB[j];
                        if (collidable1 != collidable2
                            && (
                                !(collidable2 instanceof Photon)
                                || this.tube.getBounds().contains(collidable2.getPosition())
                            )
                        ) {
                            for (var k = 0; k < this.collisionExperts.length; k++) {
                                this.collisionExperts[k].detectAndDoCollision(collidable1, collidable2);
                            }
                        }
                    }
                }
            }
        },

        /*
         * Detects and computes collisions between the items in a list of collidables and a specified
         * collidable.
         */
        checkCollisionsBetweenListAndBody: function(collidablesA, body) {
            for (var i = 0; i < collidablesA.length; i++) {
                var collidable1 = collidablesA[i];
                if (!(collidable1 instanceof Photon)
                    || this.tube.getBounds().contains(collidable1.getPosition())
                    || this.tube.getBounds().contains(collidable1.getPreviousPosition()) 
                ) {
                    for (var k = 0; k < this.collisionExperts.length; k++) {
                        this.collisionExperts[k].detectAndDoCollision(collidable1, body);
                    }
                }
            }
        },

        isLasingPhoton: function(photon) {
            var middleToGroundEnergyDiff = this.getMiddleEnergyState().get('energyLevel') - this.getGroundState().get('energyLevel');
            return (
                Math.abs(photon.getVelocity().angle() % Math.PI) < this.angleWindow && 
                Math.abs(photon.getEnergy() - middleToGroundEnergyDiff) <= QuantumConfig.ENERGY_TOLERANCE
            );
        }

    }, Constants.LasersSimulation);

    return LasersSimulation;
});

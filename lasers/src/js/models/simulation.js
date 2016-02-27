define(function (require, exports, module) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var QuantumConfig     = require('common/quantum/config');
    var QuantumSimulation = require('common/quantum/models/simulation');
    var Photon            = require('common/quantum/models/photon');
    var Atom              = require('common/quantum/models/atom');
    var Tube              = require('common/quantum/models/tube');
    var Beam              = require('common/quantum/models/beam');
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

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * 
     */
    var LasersSimulation = QuantumSimulation.extend({

        // Properties for two and three level atoms
        twoLevelProperties:   new TwoLevelElementProperties(),
        threeLevelProperties: new ThreeLevelElementProperties(),

        defaults: _.extend(QuantumSimulation.prototype.defaults, {
            originX: 100, 
            originY: 300,
            width:   800,
            height:  800
        }),
        
        initialize: function(attributes, options) {
            QuantumSimulation.prototype.initialize.apply(this, [attributes, options]);

            var minX = Math.floor(this.get('originX') - 50);
            var minY = Math.floor(this.get('originY') - this.get('height') / 2);
            this.boundingRectangle = new Rectangle(minX, minY, this.get('width'), this.get('height'));

            // Cached objects
            this._matchObject = {};
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            QuantumSimulation.prototype.initComponents.apply(this, arguments);

            this.models = [];

            this.stimulatingBeam = null;
            this.pumpingBeam = null;
            this.tube = null;

            this.bodies = [];
            this.photons = new Backbone.Collection();
            this.atoms = new Backbone.Collection();
            this.mirrors = [];
            this.lasingPhotons = new Backbone.Collection();
            
            // Set up the system of collision experts
            this.collisionExperts = [];
            this.collisionExperts.push(SphereSphereExpert;
            this.collisionExperts.push(PhotonAtomCollisonExpert);
            this.collisionExperts.push(SphereBoxExpert);
            this.collisionExperts.push(PhotonMirrorCollisonExpert);

            
            this.angleWindow = LasersConfig.PHOTON_CHEAT_ANGLE;

            this.numPhotons = 0;

            // Counters for the number of atoms in each state
            this.numGroundStateAtoms = 0;
            this.numMiddleStateAtoms = 0;
            this.numHighStateAtoms = 0;

            this.set('currentElementProperties', this.twoLevelProperties);

            this.listenTo(this.photons, 'remove', this.bodyRemoved);
            this.listenTo(this.atoms,   'remove', this.bodyRemoved);
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
            var i;
            for (i = 0; i < this.models.length; i++)
                this.models[i].update(time, deltaTime);

            // Check to see if any photons need to be taken out of the system
            this.numPhotons = 0;
            for (var i = 0; i < this.bodies.length; i++ ) {
                var body = this.bodies[i];
                if (body instanceof Photon) {
                    this.numPhotons++;
                    if (!boundingRectangle.contains(body.getPosition())) {
                        // Old PhET note: We don't need to remove the element right now. The photon will
                        //   fire an event that we will catch
                        // Patrick: I've changed it to just destroy it now
                        body.destroy();
                    }
                }
            }
        },

        addModel: function(model) {
            this.models.push(model);

            if (model.collidable) 
                this.bodies.push(model);
            
            if (model instanceof Photon)
                this.addPhoton(model);

            if (model instanceof Atom)
                this.addAtom(model);
            
            if (model instanceof Mirror)
                this.mirrors.push(model);
            
            if (model instanceof Tube)
                this.tube = model;
        },

        removeModel: function(model) {
            for (var i = this.models.length - 1; i >= 0; i--) {
                if (this.models[i] === models) {
                    this.models.splice(i, 1);
                    return true;
                }
            }

            return false;
        },

        addPhoton: function(photon) {
            this.photons.add(photon);

            // If the photon is moving nearly horizontally and is equal in energy to the
            //   transition between the middle and ground states, consider it to be lasing
            if (this.isLasingPhoton(photon)) {
                this.lasingPhotons.add(photon);
            }
        },

        addAtom: function(atom) {
            this.atoms.add(atom);
        },

        bodyRemoved: function(collection, body) {
            var index = this.bodies.indexOf(body);
            if (index !== -1)
                this.bodies.splice(index, 1);
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
            for (i = 0; i < atoms.length; i++) {
                this.atoms.at(i).setStates(this.getCurrentElementProperties().getStates());
            }

            // Initialize the number of atoms in each level
            this.numGroundStateAtoms = 0;
            this.numMiddleStateAtoms = 0;
            this.numHighStateAtoms = 0;

            var elementProperties = this.getCurrentElementProperties();
            for (var i = 0; i < atoms.length; i++) {
                var atom = atoms.at(i);

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
            return this.stimulatingBeam;
        },

        setStimulatingBeam: function(stimulatingBeam) {
            if (this.stimulatingBeam)
                this.removeModel(this.stimulatingBeam);
            
            this.addModel(stimulatingBeam);
            this.stimulatingBeam = stimulatingBeam;
        },

        getPumpingBeam: function() {
            return pumpingBeam;
        },

        setPumpingBeam: function(pumpingBeam) {
            if (this.pumpingBeam)
                this.removeModel(this.pumpingBeam);
            
            this.addModel(pumpingBeam);
            this.pumpingBeam = pumpingBeam;
        },

        setHighEnergyMeanLifetime: function(time) {
            this.getHighEnergyState().setMeanLifetime(time);
        },

        setMiddleEnergyMeanLifetime: function(time) {
            this.getMiddleEnergyState().setMeanLifetime(time);
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
            this.checkPhotonPhotonCollisions();
            this.checkCollisionsBetweenTwoLists(this.photons.models, this.mirrors);
            this.checkCollisionsBetweenListAndBody(this.atoms.models, this.tube);
        },

        checkPhotonPhotonCollisions: function() {
            // Test each photon against the atoms in the section the photon is in
            for (var i = 0; i < this.photons.length; i++) {
                var photon = this.photons[i];
                if (!(photon instanceof Photon) 
                    || (this.tube.getBounds().contains(photon.get('position'))) 
                    || (this.tube.getBounds().contains(photon.getPreviousPosition()))
                ) {
                    for (var j = 0; j < atoms.length; j++) {
                        var atom = atoms[j];
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
        }

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
                Math.abs(photon.getVelocity().getAngle() % Math.PI) < this.angleWindow && 
                Math.abs(photon.getEnergy() - middleToGroundEnergyDiff) <= QuantumConfig.ENERGY_TOLERANCE
            );
        }

    });

    return LasersSimulation;
});

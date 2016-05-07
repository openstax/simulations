define(function (require) {

    'use strict';

    var _ = require('underscore');

    var SphericalBody = require('common/mechanics/models/spherical-body');

    var StateLifetimeManager = require('./state-lifetime-manager');

    /**
     * A spherical body with mass and momentum
     */
    var Atom = SphericalBody.extend({

        defaults: _.extend({}, SphericalBody.prototype.defaults, {
            radius: 15,
            mass: 1000,
            currentState: null,
            isStateLifetimeFixed: false
        }),

        /**
         * Required options: {
         *   simulation: simulation model,
         *   numStates: number of states    
         * }
         */
        initialize: function(attributes, options) {
            SphericalBody.prototype.initialize.apply(this, [attributes, options]);

            this.simulation = options.simulation;
            this.groundState = null;
            this.highestEnergyState = null;

            this.states = [];

            this.on('change:currentState', this.currentStateChanged);

            this.set('currentState', this.simulation.getGroundState());
            this.setNumEnergyLevels(options.numStates, this.simulation);
        },

        getCurrentState: function() {
            return this.get('currentState');
        },

        setCurrentState: function(currentState) {
            this.set('currentState', currentState);
        },

        getStates: function() {
            return this.states;
        },

        getModel: function() {
            return this.simulation;
        },

        /**
         * Returns the number of the atom's current state. This is the index of the state in the
         *   atom's array of state. The ground state is number 0
         */
        getCurrentStateNumber: function() {
            for (var i = 0; i < this.states.length; i++) {
                if (this.getCurrentState() == this.states[i])
                    return i;
            }
            return 0;
        },

        /**
         * Sets the states that the atom can be in.  Sets the atom's current state to the
         *   ground state
         */
        setStates: function(states) {
            this.states = states;
            // Find the minimum and maximum energy states
            var maxEnergy = -Number.MAX_VALUE;
            for (var i = 0; i < states.length; i++) {
                var state = states[i];
                var energy = state.get('energyLevel');
                if (energy > maxEnergy) {
                    maxEnergy = energy;
                    this.highestEnergyState = state;
                }
            }

            this.groundState = this.getLowestEnergyState();
            this.set('currentState', this.groundState);
        },

        /**
         * Populates the list of AtomicStates that this atom can be in, based on the
         *   specified number of energy levels it can occupy
         */
        setNumEnergyLevels: function(numEnergyLevels, simulation) {
            for (var i = 0; i < numEnergyLevels; i++)
                this.states[i] = null;
            this.states[0] = simulation.getGroundState();
            this.groundState = this.states[0];
            this.highestEnergyState = this.states[this.states.length - 1];
        },

        getGroundState: function() {
            return this.groundState;
        },

        /**
         * Returns the atom's state with the lowest energy
         */
        getLowestEnergyState: function() {
            var lowestState = null;
            var lowestEnergy = Number.MAX_VALUE;
            for (var i = 0; i < this.states.length; i++) {
                var state = this.states[i];
                if (state.get('energyLevel') < lowestEnergy) {
                    lowestEnergy = state.get('energyLevel');
                    lowestState = state;
                }
            }
            return lowestState;
        },

        getHighestEnergyState: function() {
            return this.highestEnergyState;
        },

        /**
         * Returns the state the atom will be in if it emits a photon. By default,
         *   this is the next lower energy state
         */
        getEnergyStateAfterEmission: function() {
            return this.get('currentState').getNextLowerEnergyState();
        },

        emitPhoton: function(emittedPhoton) {
            this.trigger('photon-emitted', this, emittedPhoton);
        },

        update: function(time, deltaTime) {},

        collideWithPhoton: function(photon) {
            this.get('currentState').collideWithPhoton(this, photon);
        },

        currentStateChanged: function(atom, currentState) {
            if (this.stateLifetimeManager)
                this.stateLifetimeManager.kill();

            if (this.previous('currentState'))
                this.previous('currentState').leaveState(this);
            
            if (currentState)
                currentState.enterState(this);

            this.stateLifetimeManager = new StateLifetimeManager(this, true, this.simulation);
        }

    });

    return Atom;
});
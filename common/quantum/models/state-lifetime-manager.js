define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var VanillaPhoton = require('./photon-vanilla');

    /**
     * An object that manages the lifetime of an AtomicEnergyState.
     * 
     * When it is created, it sets a time of death for an atom's current state,
     *   and when that time comes, causes a photon to be emitted and the atom
     *   to change to the next appropriate energy state.
     */
    var StateLifetimeManager = function() {
        this.initialize.apply(this, arguments);
    };

    /**
     * Instance functions/properties
     */
    _.extend(StateLifetimeManager.prototype, {

        /**
         * Initializes the StateLifetimeManager's properties with provided initial values
         */
        initialize: function(atom, emitOnStateChange, simulation) {
            this.atom = atom;
            this.emitOnStateChange = emitOnStateChange;
            this.simulation = simulation;

            // Add this manager to the simulation model so the update function gets called in the sim loop
            simulation.addModel(this);

            var temp = 0;
            while (temp === 0)
                temp = Math.random();
            
            this.state = atom.getCurrentState();

            // Get the lifetime for this state
            if (atom.get('isStateLifetimeFixed')) {
                // This line gives a fixed death time
                this.deathTime = this.state.get('meanLifetime');
            }
            else {
                // Assign a deathtime based on an exponential distribution
                // The square root pushes the distribution toward 1.
                this.deathTime = Math.pow(-Math.log(temp), 0.5) * this.state.get('meanLifetime');
            }

            // Initialize the field that tracks the state's lifetime
            this.lifeTime = 0;

            this.horizontalEmissionLikelihood = 0.10;

            // Cached objects
            this._position = new Vector2();
            this._velocity = new Vector2();
            this._vHat     = new Vector2();
        },

        /**
         * Changes the state of the associated atom if the state's lifetime has been exceeded.
         */
        update: function(time, deltaTime) {
            this.lifeTime += deltaTime;
            if (this.lifeTime >= this.deathTime) {
                var nextState = this.atom.getEnergyStateAfterEmission();

                if (this.emitOnStateChange) {
                    var speed = VanillaPhoton.DEFAULT_SPEED * this.simulation.get('photonSpeedScale');
                    var theta = this.getEmissionDirection();
                    var x = speed * Math.cos(theta);
                    var y = speed * Math.sin(theta);

                    if (nextState != this.atom.getCurrentState()) {
                        var emittedPhoton = VanillaPhoton.create({
                            wavelength: this.state.determineEmittedPhotonWavelength(nextState),
                            position: this.atom.get('position'),
                            velocity: this._velocity.set(x, y)
                        });

                        // Place the replacement photon beyond the atom, so it doesn't collide again
                        //   right away
                        var vHat = this._vHat.set(emittedPhoton.get('velocity')).normalize();
                        var position = this._position.set(this.atom.get('position'));
                        position.add(vHat.scale(this.atom.get('radius') + 10));
                        emittedPhoton.setPosition(position);

                        this.atom.emitPhoton(emittedPhoton);
                    }
                }

                // Change state
                this.atom.set('currentState', nextState);

                // Remove us from the model
                this.kill();
            }
        },

        /**
         * 
         */
        kill: function() {
            this.simulation.removeModel(this);
        },

        getEmissionDirection: function() {
            if (Math.random() <= this.horizontalEmissionLikelihood)
                return Math.PI * (Math.random() < 0.5 ? 1 : 0);
            else
                return Math.random() * Math.PI * 2;
        }

    });


    return StateLifetimeManager;
});
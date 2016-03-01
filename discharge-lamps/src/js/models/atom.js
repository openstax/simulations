define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2 = require('common/math/vector2');

    var Atom = require('common/quantum/models/atom');

    /**
     * A spherical body with mass and momentum
     */
    var DischargeLampAtom = Atom.extend({

        defaults: _.extend({}, Atom.prototype.defaults, {
            isStateLifetimeFixed: true,
            energyEmissionStrategy: undefined,
            energyAbsorptionStrategy: undefined
        }),

        /**
         * Required options: {
         *   simulation: Simulation object,
         *   elementProperties: ElementProperties object
         *   OR
         *   states: []
         * }
         */
        initialize: function(attributes, options) {
            if (options.elementProperties)
                this.initWithElementProperties(options, options.elementProperties);
            else
                this.initWithStates(options, options.states);
        },

        initWithElementProperties: function(options, elementProperties) {
            options = _.extend({
                numStates: options.elementProperties.getStates().length
            }, options);

            Atom.prototype.initialize.apply(this, [attributes, options]);

            if (options.elementProperties.getStates().length < 2)
                throw 'Atom must have at least two states';

            // If we started with an energy emission strategy, save it and apply it later
            var energyEmissionStrategy;
            if (this.get('energyEmissionStrategy'))
                energyEmissionStrategy = this.get('energyEmissionStrategy');
            
            this.setElementProperties(options.elementProperties);
            this.setCurrentState(options.elementProperties.getStates()[0]);

            // Apply the saved starting energy emission strategy
            if (energyEmissionStrategy)
                this.set('energyEmissionStrategy', energyEmissionStrategy);
        },

        initWithStates: function(options, states) {
            options = _.extend({
                numStates: states.length
            }, options);

            Atom.prototype.initialize.apply(this, [attributes, options]);

            if (states.length < 2)
                throw 'Atom must have at least two states';

            this.setStates(states);
            this.setCurrentState(states[0]);
        },

        /**
         * If the electron's energy is greater than the difference between the atom's current energy and one of
         *   its higher energy states, the atom absorbs some of the electron's energy and goes to a state higher
         *   in energy by the amount it absorbs. Exactly how much energy it absorbs is random.
         */
        collideWithElectron: function(electron) {
            this.get('energyAbsorptionStrategy').collideWithElectron(this, electron);
            this.trigger('electron-collision', this, electron);
        },

        /**
         * Returns the state the atom will be in after it emits a photon. By default, this is the ground state
         */
        getEnergyStateAfterEmission: function() {
            return this.get('energyEmissionStrategy').emitEnergy(this);
        },

        setElementProperties: function(elementProperties) {
            this.setStates(elementProperties.getStates());
            this.set('energyAbsorptionStrategy', elementProperties.getEnergyAbsorptionStrategy());
            this.set('energyEmissionStrategy', elementProperties.getEnergyEmissionStrategy());
        }

    });

    return DischargeLampAtom;
});
define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Atom = require('./atom');

    /**
     * An Atom that gets its model-dependent specification from an ElementProperties object
     */
    var PropertiesBasedAtom = Atom.extend({

        defaults: _.extend({}, Atom.prototype.defaults, {
            isStateLifetimeFixed: true
        }),

        /**
         * Required options: {
         *   simulation: simulation model,
         *   numStates: number of states,
         *   elementProperties: ElementProperties object
         * }
         */
        initialize: function(attributes, options) {
            if (!options.elementProperties)
                throw 'elementProperties is a required option';

            if (options.elementProperties.getStates().length < 2)
                throw 'Atom must have at least two states';

            options = _.extend({
                numStates: options.elementProperties.getStates().length
            }, options);

            Atom.prototype.initialize.apply(this, [attributes, options]);

            this.energyEmissionStrategy = options.elementProperties.getEnergyEmissionStrategy();

            this.setStates(options.elementProperties.getStates());
            this.setCurrentState(options.elementProperties.getStates()[0]);
        },

        /**
         * Returns the state the atom will be in if it emits a photon. By default,
         *   this is the next lower energy state
         */
        getEnergyStateAfterEmission: function() {
            return this.get('currentState').getNextLowerEnergyState();
        },

        /**
         * Returns the state the atom will be in after it emits a photon. By default,
         *   this is the ground state.
         *
         * @return the state the atom will be in after it emits a photon
         */
        getEnergyStateAfterEmission: function() {
            return this.energyEmissionStrategy.emitEnergy(this);
        },

        setElementProperties: function(elementProperties) {
            this.energyEmissionStrategy = elementProperties.getEnergyEmissionStrategy();
            this.setStates(elementProperties.getStates());
        }

    });

    return PropertiesBasedAtom;
});
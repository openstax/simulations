define(function (require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var AtomicState = require('./atomic-state');
    var GroundState = require('./ground-state');

    /**
     * A place to store element properties
     */
    var ElementProperties = Backbone.Model.extend({

        defaults: {
            name: '',
            energyLevels: [],
            levelsMovable: false,
            energyEmissionStrategy: null,
            meanStateLifetime: 0,
            workFunction: 0
        },
        
        initialize: function(attributes, options) {
            this.states = [];
            this.set('energyLevels', _.toArray(this.get('energyLevels')));

            this.initStates();

            this.on('change:energyLevels', this.energyLevelsChanged);
        },

        getGroundState: function() {
            return this.states[0];
        },

        getMeanStateLifetime: function() {
            return this.get('meanStateLifetime');
        },

        setMeanStateLifetime: function(meanStateLifetime) {
            this.set('meanStateLifetime', meanStateLifetime);
        },

        getEnergyEmissionStrategy: function() {
            return this.get('energyEmissionStrategy');
        },

        getEnergyLevels: function() {
            return this.get('energyLevels');
        },

        setWorkFunction: function(workFunction) {
            this.set('workFunction', workFunction);
        },

        getWorkFunction: function() {
            return this.get('workFunction');
        },

        isLevelsMovable: function() {
            return this.get('levelsMovable');
        },

        setLevelsMovable: function(levelsMovable) {
            this.set('levelsMovable', levelsMovable);
        },

        getStates: function() {
            return this.states;
        },

        initStates: function() {
            var energyLevels = this.get('energyLevels');
            this.states[0] = new GroundState();
            this.states[0].set('energyLevel', energyLevels[0]);

            for (var i = 1; i < energyLevels.length; i++) {
                this.states[i] = new AtomicState();
                this.states[i].set('energyLevel', 0);
            }

            AtomicState.linkStates(this.states);

            this.updateStates();
        },

        updateStates: function() {
            var i;

            // Copy the energies into a new array, sort and normalize them
            var energyLevels = this.get('energyLevels');
            var energies = [];
            for (i = 0; i < energyLevels.length; i++)
                energies[i] = energyLevels[i];
            
            energies.sort();

            this.states[0].set('energyLevel', energies[0]);
            for (i = 1; i < this.states.length; i++) {
                this.states[i].set('energyLevel', energies[i]);
                this.states[i].setMeanLifetime(this.get('meanStateLifetime'));
            }
        },

        energyLevelsChanged: function(model, energyLevels) {
            if (energyLevels.length !== this.states.length)
                this.initStates();
            else
                this.updateStates();
        }

    });


    return ElementProperties;
});

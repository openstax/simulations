define(function(require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var GOSimulation = require('models/simulation');
    var GOSimView    = require('views/sim');

    var Scenarios = require('scenarios');

    /**
     *
     */
    var FriendlyScaleSimView = GOSimView.extend({

        events: _.extend(GOSimView.prototype.events, {
            
        }),

        initialize: function(options) {
            options = _.extend({
                title: 'Friendly Scale',
                name:  'friendly'
            }, options);
            
            GOSimView.prototype.initialize.apply(this, [ options ]);
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new GOSimulation({
                scenario: Scenarios.Friendly[0]
            });
        },

        getScenarios: function() {
            return Scenarios.Friendly;
        }

    });

    return FriendlyScaleSimView;
});

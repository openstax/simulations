define(function (require) {

    'use strict';

    var SingleNucleusBetaDecaySimulation = require('beta-decay/models/simulation/single-nucleus');

    var BetaDecaySimView                = require('beta-decay/views/sim');
    var SingleNucleusBetaDecaySceneView = require('beta-decay/views/scene/single');

    var Constants = require('constants');

    /**
     * Single Atom tab
     */
    var SingleNucleusBetaDecaySimView = BetaDecaySimView.extend({

        events: _.extend({}, BetaDecaySimView.prototype.events, {
            'click .show-labels-check' : 'toggleLabels'
        }),

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Single Atom',
                name: 'single-atom',
                link: 'beta-decay'
            }, options);

            BetaDecaySimView.prototype.initialize.apply(this, [options]);
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new SingleNucleusBetaDecaySimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new SingleNucleusBetaDecaySceneView({
                simulation: this.simulation
            });
        },

        toggleLabels: function(event) {
            if ($(event.target).is(':checked'))
                this.sceneView.showLabels();
            else
                this.sceneView.hideLabels();
        },

    });

    return SingleNucleusBetaDecaySimView;
});

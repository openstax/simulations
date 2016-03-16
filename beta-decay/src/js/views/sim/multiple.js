define(function (require) {

    'use strict';

    var MultiNucleusBetaDecaySimulation = require('beta-decay/models/simulation/multi-nucleus');

    var BetaDecaySimView               = require('beta-decay/views/sim');
    var MultiNucleusBetaDecaySceneView = require('beta-decay/views/scene/multiple');

    var Constants = require('constants');

    /**
     * Multiple Atoms tab
     */
    var MultiNucleusBetaDecaySimView = BetaDecaySimView.extend({

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Multiple Atoms',
                name: 'multiple-atoms',
                link: 'beta-decay'
            }, options);

            BetaDecaySimView.prototype.initialize.apply(this, [options]);
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new MultiNucleusBetaDecaySimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new MultiNucleusBetaDecaySceneView({
                simulation: this.simulation
            });
        }

    });

    return MultiNucleusBetaDecaySimView;
});

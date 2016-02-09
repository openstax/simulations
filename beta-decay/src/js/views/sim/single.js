define(function (require) {

    'use strict';

    var SingleNucleusBetaDecaySimulation = require('beta-decay/models/simulation/single-nucleus');

    var BetaDecaySimView = require('beta-decay/views/sim');
    var SingleNucleusBetaDecaySceneView = require('beta-decay/views/scene/single');

    var Constants = require('constants');

    /**
     * Single Atom tab
     */
    var SingleNucleusBetaDecaySimView = BetaDecaySimView.extend({

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Single Atom',
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
        }

    });

    return SingleNucleusBetaDecaySimView;
});

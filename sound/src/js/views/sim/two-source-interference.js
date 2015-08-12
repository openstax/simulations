define(function (require) {

    'use strict';

    var _ = require('underscore');

    var TwoSourceInterferenceSimulation = require('models/simulation/two-source-interference');

    var SoundSimView                   = require('views/sim');
    var TwoSourceInterferenceSceneView = require('views/scene/two-source-interference');

    /**
     * 
     */
    var TwoSourceInterferenceSimView = SoundSimView.extend({

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Two Source Interference',
                name: 'two-source-interference',
            }, options);

            SoundSimView.prototype.initialize.apply(this, [options]);
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new TwoSourceInterferenceSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new TwoSourceInterferenceSceneView({
                simulation: this.simulation
            });
        },

        /**
         * Renders page content
         */
        renderScaffolding: function() {
            SoundSimView.prototype.renderScaffolding.apply(this, arguments);

            this.renderSimpleAudioControls();
        },

    });

    return TwoSourceInterferenceSimView;
});

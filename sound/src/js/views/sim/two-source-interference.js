define(function (require) {

    'use strict';

    var _ = require('underscore');

    var SoundSimView                   = require('views/sim');
    var TwoSourceInterferenceSceneView = require('views/scene/two-source-interference');

    var Constants = require('constants');

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
                name: 'two-source-interference-sim',
            }, options);

            SoundSimView.prototype.initialize.apply(this, [options]);
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

            this.renderAudioControls();
        },

    });

    return TwoSourceInterferenceSimView;
});

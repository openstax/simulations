define(function (require) {

    'use strict';

    var _ = require('underscore');

    var SoundSimView          = require('views/sim');
    var SingleSourceSceneView = require('views/scene/single-source');

    var Constants = require('constants');

    /**
     * 
     */
    var SingleSourceSimView = SoundSimView.extend({

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Single Source',
                name: 'single-source-sim',
            }, options);

            SoundSimView.prototype.initialize.apply(this, [options]);
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new SingleSourceSceneView({
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

    return SingleSourceSimView;
});

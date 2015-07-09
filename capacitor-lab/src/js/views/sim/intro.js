define(function (require) {

    'use strict';

    var CapacitorLabSimView = require('views/sim');
    var IntroSceneView = require('views/scene/intro');

    var Constants = require('constants');

    /**
     * 
     */
    var IntroSimView = CapacitorLabSimView.extend({

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Introduction',
                name: 'intro',
            }, options);

            CapacitorLabSimView.prototype.initialize.apply(this, [options]);
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new IntroSceneView({
                simulation: this.simulation
            });
        },

    });

    return IntroSimView;
});

define(function (require) {

    'use strict';

    var _ = require('underscore');

    var CollisionLabSimView   = require('views/sim');
    var CollisionLabSceneView = require('views/scene');
    var BallSettingsView      = require('views/ball-settings');

    // HTML
    var ballSettingsHtml = require('text!templates/ball-settings-1d.html');


    /**
     * Intro tab
     */
    var IntroSimView = CollisionLabSimView.extend({

        ballSettingsHtml: ballSettingsHtml,

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Introduction',
                name: 'intro-sim',
            }, options);

            CollisionLabSimView.prototype.initialize.apply(this, [options]);

            this.initSceneView();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new CollisionLabSceneView({
                simulation: this.simulation,
                oneDimensional: true
            });
        },

        /**
         * Returns a new ball settings view
         */
        createBallSettingsView: function(ball) {
            return new BallSettingsView({ 
                model: ball, 
                oneDimensional: true 
            });
        }

    });

    return IntroSimView;
});

define(function (require) {

    'use strict';

    var _ = require('underscore');

    var CollisionLabSimulation = require('models/simulation');

    var CollisionLabSimView   = require('views/sim');
    var CollisionLabSceneView = require('views/scene');
    var BallSettingsView      = require('views/ball-settings');

    var Constants = require('constants');

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
                userCanAddRemoveBalls: false
            }, options);

            CollisionLabSimView.prototype.initialize.apply(this, [options]);

            this.initSceneView();
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new CollisionLabSimulation({
                defaultBallSettings: Constants.Simulation.INTRO_DEFAULT_BALL_SETTINGS,
                oneDimensional: true
            });
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
                oneDimensional: true, 
                showMoreData: this.moreDataMode
            });
        }

    });

    return IntroSimView;
});

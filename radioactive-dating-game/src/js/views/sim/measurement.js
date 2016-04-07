define(function (require) {

    'use strict';

    var Assets = require('common/v3/pixi/assets');

    var MeasurementSimulation = require('radioactive-dating-game/models/simulation/measurement');

    var RadioactiveDatingGameSimView = require('radioactive-dating-game/views/sim');
    var MeasurementSceneView         = require('radioactive-dating-game/views/scene/measurement');

    var Constants = require('constants');

    // HTML
    var simHtml              = require('text!radioactive-dating-game/templates/measurement-sim.html');
    var playbackControlsHtml = require('text!radioactive-dating-game/templates/measurement-playback-controls.html');

    /**
     * Multiple Atoms tab
     */
    var MeasurementSimView = RadioactiveDatingGameSimView.extend({

        events: _.extend({}, RadioactiveDatingGameSimView.prototype.events, {
            'click #object-tree' : 'treeSelected',
            'click #object-rock' : 'rockSelected'
        }),

        /**
         * Template for rendering the basic scaffolding
         */
        template: _.template(simHtml),
        playbackControlsTemplate: _.template(playbackControlsHtml),

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Measurement',
                name: 'measurement'
            }, options);

            RadioactiveDatingGameSimView.prototype.initialize.apply(this, [options]);
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new MeasurementSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new MeasurementSceneView({
                simulation: this.simulation
            });
        },

        /**
         * Renders page content. Should be overriden by child classes
         */
        renderScaffolding: function() {
            var data = {
                Constants: Constants,
                simulation: this.simulation,
                Assets: Assets,
                objects: [{
                    name: 'tree',
                    label: 'Tree',
                    src: Assets.Images.TREE_ICON,
                    isDefault: true
                }, {
                    name: 'rock',
                    label: 'Rock',
                    src: Assets.Images.ROCK_A_2
                }]
            };
            this.$el.html(this.template(data));
            this.$('select').selectpicker();
        },

        /**
         * Renders everything
         */
        postRender: function() {
            RadioactiveDatingGameSimView.prototype.postRender.apply(this, arguments);

            return this;
        },

        treeSelected: function() {
            this.simulation.set('mode', MeasurementSimulation.MODE_TREE);
        },

        rockSelected: function() {
            this.simulation.set('mode', MeasurementSimulation.MODE_ROCK);
        },

        setSoundVolumeMute: function() {
            this.sceneView.setSoundVolumeMute();
        },

        setSoundVolumeLow: function() {
            this.sceneView.setSoundVolumeLow();
        },

        setSoundVolumeHigh: function() {
            this.sceneView.setSoundVolumeHigh();
        }

    });

    return MeasurementSimView;
});

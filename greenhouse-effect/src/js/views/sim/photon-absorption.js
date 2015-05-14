define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var SimView = require('common/app/sim');
    var PixiSceneView = require('common/pixi/view/scene');
    var Simulation = require('common/simulation/simulation');

    var PhotonAbsorptionSimulation = require('models/simulation/photon-absorption');

    var Constants = require('constants');
    var Assets    = require('assets');

    require('nouislider');
    require('bootstrap');
    require('bootstrap-select');

    // CSS
    require('less!styles/sim');
    require('less!styles/playback-controls');
    require('less!common/styles/slider');
    require('less!common/styles/radio');
    require('less!bootstrap-select-less');

    // HTML
    var simHtml              = require('text!templates/sim-photon-absorption.html');
    var playbackControlsHtml = require('text!templates/playback-controls-photon-absorption.html');

    /**
     * Base SimView for the Greenhouse Effects and Glass Layers tabs
     */
    var PhotonAbsorptionSimView = SimView.extend({

        /**
         * Template for rendering the basic scaffolding
         */
        template: _.template(simHtml),

        /**
         * Dom event listeners
         */
        events: {
            'click .play-btn'   : 'play',
            'click .pause-btn'  : 'pause',
            'click .reset-btn'  : 'reset'
        },

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Photon Absorption',
                name: 'photon-absorption',
            }, options);

            SimView.prototype.initialize.apply(this, [options]);

            this.initSceneView();

            this.listenTo(this.simulation, 'change:paused', this.pausedChanged);
            this.pausedChanged(this.simulation, this.simulation.get('paused'));
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new PhotonAbsorptionSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new PixiSceneView({
                simulation: this.simulation
            });
        },

        /**
         * Renders everything
         */
        render: function() {
            this.$el.empty();

            this.renderScaffolding();
            this.renderSceneView();
            this.renderPlaybackControls();

            return this;
        },

        /**
         * Renders page content. Should be overriden by child classes
         */
        renderScaffolding: function() {
            var data = {
                Constants: Constants,
                simulation: this.simulation,
                unique: this.cid,
                iconSize: 18,
                Assets: Assets,
                gases: {
                    methane: {
                        src: Assets.Images.MOLECULE_METHANE,
                        label: 'CH<sub>4</sub>'
                    },
                    carbonDioxide: {
                        src: Assets.Images.MOLECULE_METHANE,
                        label: 'CO<sub>2</sub>'
                    },
                    water: {
                        src: Assets.Images.MOLECULE_METHANE,
                        label: 'H<sub>2</sub>O'
                    },
                    nitrogen: {
                        src: Assets.Images.MOLECULE_METHANE,
                        label: 'N<sub>2</sub>'
                    },
                    oxygen: {
                        src: Assets.Images.MOLECULE_METHANE,
                        label: 'O<sub>2</sub>'
                    },
                    custom: {
                        src: Assets.Images.MOLECULE_METHANE,
                        label: 'Build atmosphere'
                    }
                }
            };
            this.$el.html(this.template(data));
        },

        /**
         * Renders the scene view
         */
        renderSceneView: function() {
            this.sceneView.render();
            this.$('.scene-view-placeholder').replaceWith(this.sceneView.el);
        },

        /**
         * Renders playback controls
         */
        renderPlaybackControls: function() {
            this.$el.append(playbackControlsHtml);
        },

        /**
         * Called after every component on the page has rendered to make sure
         *   things like widths and heights and offsets are correct.
         */
        postRender: function() {
            this.sceneView.postRender();
        },

        /**
         * Resets all the components of the view.
         */
        resetComponents: function() {
            SimView.prototype.resetComponents.apply(this);
            this.initSceneView();
        },

        /**
         * This is run every tick of the updater.  It updates the wave
         *   simulation and the views.
         */
        update: function(time, deltaTime) {
            // Update the model
            this.simulation.update(time, deltaTime);

            var timeSeconds = time / 1000;
            var dtSeconds   = deltaTime / 1000;

            // Update the scene
            this.sceneView.update(timeSeconds, dtSeconds, this.simulation.get('paused'));
        },

        /**
         * The simulation changed its paused state.
         */
        pausedChanged: function() {
            if (this.simulation.get('paused'))
                this.$el.removeClass('playing');
            else
                this.$el.addClass('playing');
        }

    });

    return PhotonAbsorptionSimView;
});

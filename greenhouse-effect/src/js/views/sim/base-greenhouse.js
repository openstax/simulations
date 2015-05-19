define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var SimView = require('common/app/sim');

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
    var simHtml              = require('text!templates/sim-greenhouse.html');
    var playbackControlsHtml = require('text!templates/playback-controls-greenhouse.html');

    /**
     * Base SimView for the Greenhouse Effects and Glass Layers tabs
     */
    var BaseGreenhouseSimView = SimView.extend({

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
            'click .reset-btn'  : 'reset',

            'click .all-photons-check'  : 'toggleAllPhotons',
            'click .thermometer-check'  : 'toggleThermometer',
            'click .degrees-fahrenheit' : 'showFahrenheit',
            'click .degrees-celsius'    : 'showCelsius',

            'slide .playback-speed' : 'changePlaybackSpeed'
        },

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Base Greenhouse',
                name: 'base-greenhouse',
            }, options);

            SimView.prototype.initialize.apply(this, [options]);

            this.initSceneView();

            this.listenTo(this.simulation, 'change:paused', this.pausedChanged);
            this.pausedChanged(this.simulation, this.simulation.get('paused'));
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {},

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {},

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
                sunlightPhotonSrc: Assets.Images.PHOTON_SUNLIGHT,
                infraredPhotonSrc: Assets.Images.PHOTON_INFRARED,
                Assets: Assets
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

            this.$('.playback-speed').noUiSlider({
                start: 1,
                range: {
                    'min': 0.2,
                    'max': 1
                }
            });
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
        },

        /**
         * Toggles between showing all photons and only
         *   some of the photons.
         */
        toggleAllPhotons: function(event) {
            if ($(event.target).is(':checked'))
                this.sceneView.showAllPhotons();
            else
                this.sceneView.showFewerPhotons();
        },

        /**
         * Toggles thermometer visibility
         */
        toggleThermometer: function(event) {
            if ($(event.target).is(':checked'))
                this.sceneView.showThermometer();
            else
                this.sceneView.hideThermometer();
        },

        /**
         * Sets the thermometer readout to Fahrenheit.
         */
        showFahrenheit: function() {
            this.sceneView.showFahrenheit();
        },

        /**
         * Sets the thermometer readout to Celsius.
         */
        showCelsius: function() {
            this.sceneView.showCelsius();
        },

        /**
         * Changes the simulation speed.
         */
        changePlaybackSpeed: function(event) {
            var speed = parseFloat($(event.target).val());
            this.simulation.set('timeScale', speed);
        }

    });

    return BaseGreenhouseSimView;
});

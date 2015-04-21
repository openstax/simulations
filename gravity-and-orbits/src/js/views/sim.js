define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var SimView = require('common/app/sim');

    var TemplateSimulation = require('models/simulation');
    var TemplateSceneView  = require('views/scene');

    var Constants = require('constants');

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
    var simHtml        = require('text!templates/sim.html');
    var controlsHtml   = require('text!templates/playback-controls.html');
    var propertiesHtml = require('text!templates/properties-panel.html');

    /**
     * This is the umbrella view for everything in a simulation tab.
     *   It will be extended by both the Intro module and the Charts
     *   and contains all the common functionality between the two.
     */
    var GOSimView = SimView.extend({

        /**
         * Root element properties
         */
        tagName:   'section',
        className: 'sim-view',

        /**
         * Template for rendering the basic scaffolding
         */
        template:                _.template(simHtml),
        propertiesPanelTemplate: _.template(propertiesHtml),

        /**
         * Dom event listeners
         */
        events: {
            // Playback controls
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
                link: 'gravity-and-orbits'
            }, options);

            SimView.prototype.initialize.apply(this, [options]);

            this.initSceneView();
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new TemplateSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new TemplateSceneView({
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
            this.renderPropertiesPanel();

            return this;
        },

        /**
         * Renders page content. Should be overriden by child classes
         */
        renderScaffolding: function() {
            var data = {
                Constants: Constants,
                simulation: this.simulation,
                configurationKeys: ['Sun, planet', 'Sun, planet, moon']
            };
            this.$el.html(this.template(data));
            this.$('select').selectpicker();
        },

        /**
         * Renders the scene view
         */
        renderSceneView: function() {
            this.sceneView.render();
            this.$('.scene-view-placeholder').replaceWith(this.sceneView.el);
        },

        /**
         * Renders the playback controls at the bottom of the screen
         */
        renderPlaybackControls: function() {
            this.$controls = $(controlsHtml);

            // Initialize speed slider
            this.$controls.find('.playback-speed').noUiSlider({
                start: 1,
                range: {
                    'min': [ 0.2 ],
                    '50%': [ 1 ],
                    'max': [ 4 ]
                }
            });

            this.$('.playback-controls-placeholder').replaceWith(this.$controls);
        },

        /**
         * Renders the playback controls at the bottom of the screen
         */
        renderPropertiesPanel: function() {
            this.$propertiesPanel = $(this.propertiesPanelTemplate({
                unique: this.cid
            }));
            this.$('.properties-panel-placeholder').replaceWith(this.$propertiesPanel);
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

    });

    return GOSimView;
});

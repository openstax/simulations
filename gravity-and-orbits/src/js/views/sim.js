define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var SimView = require('common/app/sim');

    var GOSimulation     = require('models/simulation');
    var GOSceneView      = require('views/scene');
    var BodySettingsView = require('views/body-settings');

    var Constants = require('constants');
    var Scenarios = require('scenarios');

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
            'click .reset-btn'  : 'reset',

            'change .scenario-select' : 'changeScenario'
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

            this.bodySettingViews = [];

            SimView.prototype.initialize.apply(this, [options]);

            this.initSceneView();

            this.listenTo(this.simulation, 'change:paused', this.pausedChanged);

            this.listenTo(this.simulation.bodies, 'reset',  this.bodiesReset);
            this.listenTo(this.simulation.bodies, 'add',    this.bodyAdded);
            this.listenTo(this.simulation.bodies, 'remove', this.bodyRemoved);
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new GOSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new GOSceneView({
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
                scenarioNames: this.getScenarioNames()
            };
            this.$el.html(this.template(data));
            this.$('select').selectpicker();

            this.$bodySettingViews = this.$('.body-settings-container');
            this.bodiesReset(this.simulation.bodies);
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

        /**
         * Returns a new body settings view
         */
        createBodySettingsView: function(body) {
            return new BodySettingsView({ 
                model: body
            });
        },

        appendBodySettingsView: function(bodySettingsView) {
            this.$bodySettingViews.append(bodySettingsView.el);
            bodySettingsView.render();
            this.bodySettingViews.push(bodySettingsView);
        },

        bodiesReset: function(bodies) {
            // Remove old body views
            for (var i = this.bodySettingViews.length - 1; i >= 0; i--) {
                this.bodySettingViews[i].remove();
                this.bodySettingViews.splice(i, 1);
            }

            // Add new ball views
            bodies.each(function(body) {
                this.appendBodySettingsView(this.createBodySettingsView(body));
            }, this);
        },

        bodyAdded: function(body, bodies) {
            this.appendBodySettingsView(this.createBodySettingsView(body));
        },

        bodyRemoved: function(body, bodies) {
            for (var i = this.bodySettingViews.length - 1; i >= 0; i--) {
                if (this.bodySettingViews[i].model === body) {
                    this.bodySettingViews[i].remove();
                    this.bodySettingViews.splice(i, 1);
                    break;
                }
            }

            this.updateBallButtons();
        },

        getScenarios: function() {
            return Scenarios.Friendly;
        },

        getScenarioNames: function() {
            return _.pluck(this.getScenarios(), 'name');
        },

        changeScenario: function(event) {
            var index = parseInt($(event.target).val());
            this.simulation.loadScenario(this.getScenarios()[index]);
        }

    });

    return GOSimView;
});

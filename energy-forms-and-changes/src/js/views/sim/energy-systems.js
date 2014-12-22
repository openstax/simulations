define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var EnergySystemsSimulation = require('models/simulation/energy-systems');

    var SimView                = require('common/app/sim');
    var EnergySystemsSceneView = require('views/scene/energy-systems');

    var Assets = require('assets'); window.Assets = Assets;

    require('bootstrap');

    // CSS
    require('less!styles/sim');
    require('less!styles/playback-controls');
    require('less!styles/energy-systems');
    require('less!common/styles/radio');

    // HTML
    var simHtml = require('text!templates/sim/energy-systems.html');
    var controlsHtml = require('text!templates/energy-systems-controls.html');

    /**
     * 
     */
    var EnergySystemsSimView = SimView.extend({

        /**
         * Root element properties
         */
        tagName:   'section',
        className: 'sim-view',

        /**
         * Template for rendering the basic scaffolding
         */
        template: _.template(simHtml),
        controlsTemplate: _.template(controlsHtml),

        /**
         * Dom event listeners
         */
        events: {
            // Playback controls
            'click .play-btn'   : 'play',
            'click .pause-btn'  : 'pause',
            'click .step-btn'   : 'step',
            'click .reset-btn'  : 'reset',

            'click .energy-symbols-checkbox': 'toggleEnergySymbols'
        },

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Energy Systems',
                name: 'energy-systems',
            }, options);

            SimView.prototype.initialize.apply(this, [options]);

            // Initialize the scene view
            this.initSceneView();

            this.listenTo(this.simulation, 'change:paused', this.pausedChanged);
            this.pausedChanged(this.simulation, this.simulation.get('paused'));
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new EnergySystemsSimulation();
        },

        /**
         * Initializes the Simulation.
         */
        initSceneView: function() {
            this.sceneView = new EnergySystemsSceneView({
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
         *
         */
        renderSceneView: function() {
            this.sceneView.render();
            this.$('.scene-view-placeholder').replaceWith(this.sceneView.$el);
        },

        /**
         * Renders page content. Should be overriden by child classes
         */
        renderScaffolding: function() {

            var elements = {
                sources: [
                    {
                        cid: 1, // this.simulation.
                        src: Assets.Images.FAUCET_ICON,
                        type: 'source'
                    },{
                        cid: 2, // this.simulation.
                        src: Assets.Images.SUN_ICON,
                        type: 'source'
                    },{
                        cid: 3, // this.simulation.
                        src: Assets.Images.TEAPOT_ICON,
                        type: 'source'
                    },{
                        cid: 4, // this.simulation.
                        src: Assets.Images.BICYCLE_ICON,
                        type: 'source'
                    }
                ],
                converters: [
                    {
                        cid: 1, // this.simulation.
                        src: Assets.Images.GENERATOR_ICON,
                        type: 'converter'
                    },{
                        cid: 2, // this.simulation.
                        src: Assets.Images.SOLAR_PANEL_ICON,
                        type: 'converter'
                    }
                ],
                users: [
                    {
                        cid: 1, // this.simulation.
                        src: Assets.Images.WATER_ICON,
                        type: 'user'
                    },{
                        cid: 2, // this.simulation.
                        src: Assets.Images.INCANDESCENT_ICON,
                        type: 'user'
                    },{
                        cid: 3, // this.simulation.
                        src: Assets.Images.FLUORESCENT_ICON,
                        type: 'user'
                    }
                ]
            };

            this.$el.html(this.template({
                elementGroups: elements
            }));
        },

        /**
         * Renders the playback controls at the bottom of the screen
         */
        renderPlaybackControls: function() {
            this.$controls = $(this.controlsTemplate({
                unique: this.cid
            }));

            this.$('.playback-controls-placeholder').replaceWith(this.$controls);
        },

        /**
         * Called after every component on the page has rendered to make sure
         *   things like widths and heights and offsets are correct.
         */
        postRender: function() {
            this.sceneView.postRender();
        },

        /**
         *
         */
        resetComponents: function() {
            SimView.prototype.resetComponents.apply(this);
            
        },

        /**
         * This is run every tick of the updater.  It updates the wave
         *   simulation and the views.
         */
        update: function(time, deltaTime) {
            // Update the model
            this.simulation.update(time, deltaTime);

            // Update the scene
            this.sceneView.update(time / 1000, deltaTime / 1000, this.simulation.get('paused'));
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

        toggleEnergySymbols: function(event) {
            if ($(event.target).is(':checked'))
                this.sceneView.showEnergyChunks();
            else
                this.sceneView.hideEnergyChunks();
        }

    });

    return EnergySystemsSimView;
});

define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var SimView = require('common/app/sim');

    var BendingLightSimulation = require('models/simulation');
    var BendingLightSceneView  = require('views/scene');

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
    var html = require('text!../../templates/sim.html');
    var playbackControlsHtml = require('text!templates/playback-controls.html');

    /**
     * This is the umbrella view for everything in a simulation tab.
     *   It will be extended by both the Intro module and the Charts
     *   and contains all the common functionality between the two.
     */
    var BendingLightSimView = SimView.extend({

        /**
         * Root element properties
         */
        tagName:   'section',
        className: 'sim-view',

        /**
         * Template for rendering the basic scaffolding
         */
        template: null,
        playbackControlsPanelTemplate: _.template(playbackControlsHtml),

        /**
         * Dom event listeners
         */
        events: {
            // Playback controls
            'click .play-btn'   : 'play',
            'click .pause-btn'  : 'pause',
            'click .step-btn'   : 'step',
            'click .reset-btn'  : 'reset',

            'slide .playback-speed' : 'changeSpeed'
        },

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                link: 'bending-light'
            }, options);

            SimView.prototype.initialize.apply(this, [options]);

            this.initSceneView();

            this.listenTo(this.simulation, 'change:paused', this.pausedChanged);
            this.listenTo(this.simulation.laser, 'change:wave', this.laserBeamTypeChanged);

            this.pausedChanged(this.simulation, this.simulation.get('paused'));
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new BendingLightSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new BendingLightSceneView({
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

            this.$el.append(html);

            return this;
        },

        /**
         * Renders page content. Should be overriden by child classes
         */
        renderScaffolding: function() {
            var data = {
                Constants: Constants,
                name: this.name
            };
            this.$el.html(this.template(data));
        },

        /**
         * Renders the scene view
         */
        renderSceneView: function() {
            this.sceneView.render();
            this.$el.prepend(this.sceneView.el);
        },

        /**
         * Renders the playback controls at the bottom of the screen
         */
        renderPlaybackControls: function() {
            this.$playbackControls = $(this.playbackControlsPanelTemplate({ unique: this.cid }));

            this.$playbackControls.find('.playback-speed').noUiSlider({
                start: Constants.DEFAULT_DT * Constants.INTERFACE_DT_SCALE,
                range: {
                    min: Constants.MIN_DT * Constants.INTERFACE_DT_SCALE,
                    max: Constants.MAX_DT * Constants.INTERFACE_DT_SCALE
                }
            });

            this.$el.append(this.$playbackControls);
        },

        /**
         * Called after every component on the page has rendered to make sure
         *   things like widths and heights and offsets are correct.
         */
        postRender: function() {
            this.sceneView.postRender();

            this.laserBeamTypeChanged(this.simulation.laser, this.simulation.laser.get('wave'));
        },

        /**
         * Resets the sim and options
         */
        reset: function() {
            this.simulation.reset();
            this.sceneView.reset();
            
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

        laserBeamTypeChanged: function(laser, wave) {
            if (wave)
                this.$playbackControls.show();
            else
                this.$playbackControls.hide();
        },

        changeSpeed: function(event) {
            var dt = parseFloat($(event.target).val()) / Constants.INTERFACE_DT_SCALE;
            this.simulation.deltaTimePerFrame = dt;
            console.log(dt)
        }

    });

    return BendingLightSimView;
});

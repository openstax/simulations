define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var PickupCoilSimulation = require('models/simulation/pickup-coil');

    var FaradaySimView      = require('views/sim');
    var PickupCoilSceneView = require('views/scene/pickup-coil');

    var Constants = require('constants');

    // CSS
    require('less!styles/playback-controls');

    // HTML
    var controlsHtml = require('text!templates/bar-magnet.html');
    var playbackControlsHtml = require('text!templates/playback-controls.html');

    /**
     * This is the umbrella view for everything in a simulation tab.
     *   It will be extended by both the Intro module and the Charts
     *   and contains all the common functionality between the two.
     */
    var PickupCoilSimView = FaradaySimView.extend({

        /**
         * Template for rendering the basic scaffolding
         */
        controlsTemplate: _.template(controlsHtml),
        playbackControlsPanelTemplate: _.template(playbackControlsHtml),

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Pickup Coil',
                name: 'pickup-coil'
            }, options);

            FaradaySimView.prototype.initialize.apply(this, [options]);
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new PickupCoilSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new PickupCoilSceneView({
                simulation: this.simulation
            });
        },

        /**
         * Renders everything
         */
        render: function() {
            FaradaySimView.prototype.render.apply(this);

            this.renderPlaybackControls();

            return this;
        },

        /**
         * Renders page content.
         */
        renderScaffolding: function() {
            FaradaySimView.prototype.renderScaffolding.apply(this);

            var data = {
                Constants: Constants,
                simulation: this.simulation,
                name: this.name,
                includeEarth: this.includeEarth
            };

            this.$('.sim-controls-wrapper').append(this.controlsTemplate(data));

            this.$('.strength-slider').noUiSlider({
                start: 3,
                range: {
                    min: 1,
                    max: 5
                },
                connect: 'lower'
            });
        },

        /**
         * Renders the playback controls at the bottom of the screen
         */
        renderPlaybackControls: function() {
            this.$playbackControls = $(this.playbackControlsPanelTemplate({ unique: this.cid }));

            this.$el.append(this.$playbackControls);
        },

        /**
         * Called after every component on the page has rendered to make sure
         *   things like widths and heights and offsets are correct.
         */
        postRender: function() {
            FaradaySimView.prototype.postRender.apply(this);
        },

        /**
         * Resets all the components of the view.
         */
        resetComponents: function() {
            FaradaySimView.prototype.resetComponents.apply(this);
            
        },


    });

    return PickupCoilSimView;
});

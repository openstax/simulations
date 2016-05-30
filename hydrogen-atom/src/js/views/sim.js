define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var SimView              = require('common/v3/app/sim');
    var WavelengthSliderView = require('common/controls/wavelength-slider');

    var HydrogenAtomSimulation = require('hydrogen-atom/models/simulation');
    var HydrogenAtomSceneView  = require('hydrogen-atom/views/scene');
    var HydrogenAtomLegendView = require('hydrogen-atom/views/legend');
    var AtomicModels           = require('hydrogen-atom/models/atomic-models');
    

    var Constants = require('constants');
    var Assets = require('assets');

    require('nouislider');
    require('bootstrap');
    require('bootstrap-select');

    // CSS
    require('less!hydrogen-atom/styles/sim');
    require('less!hydrogen-atom/styles/playback-controls');
    require('less!common/styles/slider');
    require('less!common/styles/radio');
    require('less!bootstrap-select-less');

    // HTML
    var simHtml              = require('text!hydrogen-atom/templates/sim.html');
    var playbackControlsHtml = require('text!hydrogen-atom/templates/playback-controls.html');

    /**
     * This is the umbrella view for everything in a simulation tab.
     *   It will be extended by both the Intro module and the Charts
     *   and contains all the common functionality between the two.
     */
    var HydrogenAtomSimView = SimView.extend({

        /**
         * Root element properties
         */
        tagName:   'section',
        className: 'sim-view',

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
            'click .step-btn'   : 'step',

            'click input[name="model-mode"]'  : 'changeModelMode',
            'click .prediction-model-wrapper' : 'selectModel',
            'click input[name="light-mode"]'  : 'changeLightMode',
            'slide .wavelength-slider'        : 'changeWavelength',

            'click .energy-level-diagram-panel > h2' : 'toggleEnergyLevelDiagramPanel',
            'click .spectrometer-panel         > h2' : 'toggleSpectrometerPanel'
        },

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Models of the Hydrogen Atom',
                name: 'hydrogen-atom',
                link: 'hydrogen-atom'
            }, options);

            SimView.prototype.initialize.apply(this, [options]);

            this.initSceneView();
            this.initLegend();

            this.listenTo(this.simulation, 'change:paused', this.pausedChanged);
            this.pausedChanged(this.simulation, this.simulation.get('paused'));
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new HydrogenAtomSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new HydrogenAtomSceneView({
                simulation: this.simulation
            });
        },

        initLegend: function() {
            this.legendView = new HydrogenAtomLegendView();
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
                Assets: Assets,
                simulation: this.simulation,
                models: AtomicModels
            };
            this.$el.html(this.template(data));
            this.$('select').selectpicker();

            this.wavelengthSliderView = new WavelengthSliderView({
                defaultWavelength: Constants.MIN_WAVELENGTH,
                minWavelength: Constants.MIN_WAVELENGTH,
                maxWavelength: Constants.MAX_WAVELENGTH,
                invisibleSpectrumAlpha: 1,
                invisibleSpectrumColor: '#777'
            });
            this.wavelengthSliderView.render();
            this.$('.wavelength-slider-wrapper').prepend(this.wavelengthSliderView.el);

            this.$wavelengthValue = this.$('.wavelength-value');
        },

        /**
         * Renders the scene view
         */
        renderSceneView: function() {
            this.sceneView.render();
            this.$('.scene-view-placeholder').replaceWith(this.sceneView.el);
        },

        renderLegend: function() {
            this.legendView.render();
            this.$('.legend-panel').append(this.legendView.el);
        },

        /**
         * Renders playback controls
         */
        renderPlaybackControls: function() {
            this.$el.append(playbackControlsHtml);

            this.$('.playback-speed').noUiSlider({
                start: 0.6,
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
            this.wavelengthSliderView.postRender();
            this.renderLegend();
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

        changeModelMode: function(event) {
            var mode = $(event.target).val();
            if (mode === 'prediction')
                this.$('.prediction-models').show();
            else
                this.$('.prediction-models').hide();
        },

        selectModel: function(event) {
            var $wrapper = $(event.target).closest('.prediction-model-wrapper');
            $wrapper.siblings().removeClass('active');
            $wrapper.addClass('active');
        },

        changeLightMode: function(event) {
            var mode = $(event.target).val();
            if (mode === 'white')
                this.$('.wavelength-slider-container').show();
            else
                this.$('.wavelength-slider-container').hide();
        },

        changeWavelength: function(event) {
            this.inputLock(function() {
                var wavelength = parseInt($(event.target).val());
                this.$wavelengthValue.text(wavelength + 'nm');
                // this.simulation.set('wavelength', wavelength / Constants.METERS_TO_NANOMETERS);
            });
        },

        toggleEnergyLevelDiagramPanel: function(event) {
            this.$('.energy-level-diagram-panel').toggleClass('collapsed');
        },

        toggleSpectrometerPanel: function(event) {
            this.$('.spectrometer-panel').toggleClass('collapsed');
        }

    });

    return HydrogenAtomSimView;
});

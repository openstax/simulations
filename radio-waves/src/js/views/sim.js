define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var SimView = require('common/app/sim');

    var RadioWavesSimulation = require('models/simulation');
    var RadioWavesSceneView  = require('views/scene');

    var Constants = require('constants');

    var Assets = require('assets');

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
    var simHtml = require('text!templates/sim.html');

    /**
     * This is the umbrella view for everything in a simulation tab.
     *   It will be extended by both the Intro module and the Charts
     *   and contains all the common functionality between the two.
     */
    var RadioWavesSimView = SimView.extend({

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
            'click .help-btn' : 'toggleHelp',

            'click .play-btn'   : 'play',
            'click .pause-btn'  : 'pause',
            'click .step-btn'   : 'step',

            'click #electron-positions-check'       : 'toggleElectronPositions',
            'click #transmitter-movement-manual'    : 'manualClicked',
            'click #transmitter-movement-oscillate' : 'oscillateClicked',

            'slide .frequency-slider' : 'changeFrequency',
            'slide .amplitude-slider' : 'changeAmplitude',


            'click #field-display-type-curve-with-vectors'  : 'displayCurveWithVectors',
            'click #field-display-type-curve'               : 'displayCurve',
            'click #field-display-type-full-field'          : 'displayFullField', 
            'click #field-display-type-none'                : 'displayNoField',

            'click #field-sense-force-on-electron' : 'fieldSenseForceOnElectronClicked',
            'click #field-sense-electric-field'    : 'fieldSenseElectricFieldClicked',

            'click #field-displayed-radiated-field' : 'displayDynamicField',
            'click #field-displayed-static-field'   : 'displayStaticField'
        },

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Radio Waves & Electromagnetic Fields',
                name: 'radio-waves',
                link: 'radio-waves'
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
            this.simulation = new RadioWavesSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new RadioWavesSceneView({
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

            return this;
        },

        /**
         * Renders page content. Should be overriden by child classes
         */
        renderScaffolding: function() {
            var data = {
                Constants: Constants,
                simulation: this.simulation,
                Assets: Assets,
                electronSrc: Assets.Images.ELECTRON
            };
            this.$el.html(this.template(data));

            this.$('.frequency-slider').noUiSlider({
                start: Constants.FREQUENCY_RANGE.defaultValue,
                connect: 'lower',
                range: {
                    'min': Constants.FREQUENCY_RANGE.min,
                    'max': Constants.FREQUENCY_RANGE.max
                }
            });

            this.$('.amplitude-slider').noUiSlider({
                start: Constants.AMPLITUDE_RANGE.defaultValue,
                connect: 'lower',
                range: {
                    'min': Constants.AMPLITUDE_RANGE.min,
                    'max': Constants.AMPLITUDE_RANGE.max
                }
            });
        },

        /**
         * Renders the scene view
         */
        renderSceneView: function() {
            this.sceneView.render();
            this.$('.scene-view-placeholder').replaceWith(this.sceneView.el);
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

        toggleHelp: function(event){
           $(event.currentTarget).toggleClass('active');
           this.sceneView.toggleHelpLabel();
        },

        toggleElectronPositions: function(event) {
            if ($(event.target).is(':checked'))
                this.sceneView.showElectronPositionPlots();
            else
                this.sceneView.hideElectronPositionPlots();
        },

        manualClicked: function(event) {
            this.simulation.setTransmittingElectronMovementStrategyToManual();
            this.$('.oscillation-controls').addClass('disabled');
            this.$('.frequency-slider').attr('disabled', 'disabled');
            this.$('.amplitude-slider').attr('disabled', 'disabled');
        },

        oscillateClicked: function(event) {
            this.simulation.setTransmittingElectronMovementStrategyToSinusoidal();
            this.$('.oscillation-controls').removeClass('disabled');
            this.$('.frequency-slider').removeAttr('disabled');
            this.$('.amplitude-slider').removeAttr('disabled');
        },

        changeFrequency: function(event) {
            var frequency = parseFloat($(event.target).val());
            this.inputLock(function() {
                this.simulation.transmittingElectron.setFrequency(Constants.FREQUENCY_SCALE * frequency);
            });
        },

        changeAmplitude: function(event) {
            var amplitude = parseFloat($(event.target).val());
            this.inputLock(function() {
                this.simulation.transmittingElectron.setAmplitude(amplitude);
            });
        },

        frequencyChanged: function(electron, frequency) {
            this.updateLock(function() {
                this.$('.frequency-slider').val(frequency / Constants.FREQUENCY_SCALE);
            });
        },

        amplitudeChanged: function(electron, amplitude) {
            this.updateLock(function() {
                this.$('.amplitude-slider').val(amplitude);
            });
        },

        displayCurveWithVectors: function() {
            this.sceneView.displayCurveWithVectors();
        },

        displayCurve: function() {
            this.sceneView.displayCurve();
        },

        displayFullField: function() {
            this.sceneView.displayFullField();
        },

        displayNoField: function() {
            this.sceneView.displayNoField();
        },


        displayStaticField: function(event) {
            this.sceneView.displayStaticField();

            this.$('#field-display-type-full-field').click();

            this.$('#field-display-type-curve').attr('disabled', 'disabled');
            this.$('#field-display-type-curve-with-vectors').attr('disabled', 'disabled');
            this.$('#field-display-type-none').attr('disabled', 'disabled');
        },

        displayDynamicField: function(event) {
            this.sceneView.displayDynamicField();

            this.$('#field-display-type-curve').removeAttr('disabled');
            this.$('#field-display-type-curve-with-vectors').removeAttr('disabled');
            this.$('#field-display-type-none').removeAttr('disabled');
        },

        fieldSenseForceOnElectronClicked: function() {
            this.sceneView.setFieldSenseForceOnElectron();
        },

        fieldSenseElectricFieldClicked: function() {
            this.sceneView.setFieldSenseElectricField();
        }

    });

    return RadioWavesSimView;
});

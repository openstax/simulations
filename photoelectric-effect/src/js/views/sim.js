define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var SimView              = require('common/v3/app/sim');
    var WavelengthSliderView = require('common/controls/wavelength-slider');

    var PEffectSimulation = require('models/simulation');
    var TargetMaterials   = require('models/target-materials');

    var PEffectSceneView   = require('views/scene');
    var GraphAccordionView = require('views/graph-accordion');

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
    var simHtml = require('text!templates/sim.html');

    /**
     * This is the umbrella view for everything in a simulation tab.
     *   It will be extended by both the Intro module and the Charts
     *   and contains all the common functionality between the two.
     */
    var PEffectSimView = SimView.extend({

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
            'click .play-btn'  : 'play',
            'click .pause-btn' : 'pause',

            'change #target-material'  : 'changeTargetMaterial',
            'slide .wavelength-slider' : 'changeWavelength',
            'slide .intensity-slider'  : 'changeIntensity',
            'click .snapshot-btn'      : 'takeSnapshot'
        },

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Photoelectric Effect',
                name: 'photoelectric-effect',
            }, options);

            SimView.prototype.initialize.apply(this, [options]);

            this.initSceneView();
            this.initWavelengthSliderView();
            this.initGraphAccordionView();

            this.listenTo(this.simulation, 'change:paused', this.pausedChanged);
            this.pausedChanged(this.simulation, this.simulation.get('paused'));
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new PEffectSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new PEffectSceneView({
                simulation: this.simulation
            });
        },

        initWavelengthSliderView: function() {
            this.wavelengthSliderView = new WavelengthSliderView({
                defaultWavelength: this.simulation.beam.get('wavelength'), // Convert between SI and nanometers
                minWavelength: Constants.MIN_WAVELENGTH,
                maxWavelength: Constants.MAX_WAVELENGTH
            });
        },

        initGraphAccordionView: function() {
            this.graphAccordionView = new GraphAccordionView({
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
            this.renderWavelengthSliderView();
            this.renderGraphAccordionView();

            return this;
        },

        /**
         * Renders page content. Should be overriden by child classes
         */
        renderScaffolding: function() {
            var data = {
                Constants: Constants,
                simulation: this.simulation,
                targetMaterials: _.map(TargetMaterials.TARGET_MATERIALS, function(material) {
                    return material.get('name');
                })
            };
            this.$el.html(this.template(data));

            this.$('.intensity-slider').noUiSlider({
                start: 0,
                range: {
                    min: 0,
                    max: this.simulation.beam.get('maxPhotonsPerSecond')
                },
                connect: 'lower'
            });

            this.$intensityValue = this.$('.intensity-value');

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
         * Renders the wavelength view
         */
        renderWavelengthSliderView: function() {
            this.wavelengthSliderView.render();
            this.$('.wavelength-slider-wrapper').prepend(this.wavelengthSliderView.el);

            this.$wavelengthValue = this.$('.wavelength-value');
        },

        /**
         * Renders the scene view
         */
        renderGraphAccordionView: function() {
            this.graphAccordionView.render();
            this.$('.graphs-panel').append(this.graphAccordionView.el);
        },

        /**
         * Called after every component on the page has rendered to make sure
         *   things like widths and heights and offsets are correct.
         */
        postRender: function() {
            this.sceneView.postRender();
            this.wavelengthSliderView.postRender();
            this.graphAccordionView.postRender();
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

        changeTargetMaterial: function(event) {
            var materialIndex = parseInt(event.target.value);
            var material = TargetMaterials.TARGET_MATERIALS[materialIndex];
            this.simulation.target.set('targetMaterial', material);
        },

        changeWavelength: function(event) {
            this.inputLock(function() {
                var wavelength = parseInt($(event.target).val());
                this.$wavelengthValue.text(wavelength + 'nm');
                this.simulation.beam.set('wavelength', wavelength);
            });
        },

        changeIntensity: function(event) {
            this.inputLock(function() {
                var value = parseInt($(event.target).val());
                var percent = Math.round((value / this.simulation.beam.get('maxPhotonsPerSecond')) * 100);
                var photonsPerSecond = this.intensityToPhotonRate(value, this.simulation.beam.get('wavelength'));
                this.$intensityValue.text(percent + '%');
                this.simulation.beam.set('photonsPerSecond', photonsPerSecond);
            });
        },

        intensityToPhotonRate: function(intensity, wavelength) {
            return intensity * wavelength / Constants.MAX_WAVELENGTH;
        },

        photonRateToIntensity: function(photonRate, wavelength) {
            return photonRate * Constants.MAX_WAVELENGTH / wavelength;
        },

        takeSnapshot: function() {
            this.graphAccordionView.takeSnapshot();
        },

        showPhotons: function() {
            this.simulation.set('viewMode', PEffectSimulation.PHOTON_VIEW);
        },

        hidePhotons: function() {
            this.simulation.set('viewMode', PEffectSimulation.BEAM_VIEW);
        }

    });

    return PEffectSimView;
});

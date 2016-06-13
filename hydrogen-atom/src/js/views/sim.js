define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var AppView = require('common/v3/app/app');
    var SimView = require('common/v3/app/sim');
    
    var HydrogenAtomSimulation           = require('hydrogen-atom/models/simulation');
    var AtomicModels                     = require('hydrogen-atom/models/atomic-models');
    var HydrogenAtomSceneView            = require('hydrogen-atom/views/scene');
    var HydrogenAtomLegendView           = require('hydrogen-atom/views/legend');
    var HydrogenAtomWavelengthSliderView = require('hydrogen-atom/views/wavelength-slider');
    var SpectrometerView                 = require('hydrogen-atom/views/spectrometer');
    var EnergyDiagramView                = require('hydrogen-atom/views/energy-diagram');
    var SolarSystemEnergyDiagramView     = require('hydrogen-atom/views/energy-diagram/solar-system');
    var BohrEnergyDiagramView            = require('hydrogen-atom/views/energy-diagram/bohr');
    var DeBroglieEnergyDiagramView       = require('hydrogen-atom/views/energy-diagram/debroglie');
    var SchroedingerEnergyDiagramView    = require('hydrogen-atom/views/energy-diagram/schroedinger');

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
            'slide .playback-speed' : 'changePlaybackSpeed',

            'click input[name="model-mode"]'  : 'changeModelMode',
            'click .prediction-model-wrapper' : 'selectModel',
            'click input[name="light-mode"]'  : 'changeLightType',
            'slide .wavelength-slider'        : 'changeWavelength',
            'change .show-absorption-wavelengths-check' : 'toggleAbsorptionWavelengths',

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
            this.initSpectrometer();
            this.initEnergyDiagrams();
            
            this.listenTo(this.simulation, 'atom-added',                this.atomAdded);
            this.listenTo(this.simulation, 'change:atomicModel',        this.atomicModelChanged);
            this.listenTo(this.simulation, 'change:experimentSelected', this.atomicModelChanged);
            this.listenTo(this.simulation, 'change:paused',             this.pausedChanged);
            this.pausedChanged(this.simulation, this.simulation.get('paused'));

            this.listenTo(this.simulation.gun, 'change:lightType', this.lightTypeChanged);
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

        initSpectrometer: function() {
            this.spectrometerView = new SpectrometerView({
                simulation: this.simulation
            });
        },

        initEnergyDiagrams: function() {
            this.energyDiagrams = {
                SOLAR_SYSTEM: new SolarSystemEnergyDiagramView({
                    simulation: this.simulation
                }),
                BOHR: new BohrEnergyDiagramView({
                    simulation: this.simulation
                }),
                DEBROGLIE: new DeBroglieEnergyDiagramView({
                    simulation: this.simulation
                }),
                SCHROEDINGER: new SchroedingerEnergyDiagramView({
                    simulation: this.simulation
                })
            };
        },

        /**
         * Renders everything
         */
        render: function() {
            this.$el.empty();

            this.renderScaffolding();
            this.renderSceneView();
            this.renderPlaybackControls();
            this.renderSpectrometerView();
            this.renderEnergyDiagrams();

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
                atomicModels: AtomicModels,
                selectedAtomicModel: AtomicModels.BILLIARD_BALL
            };
            this.$el.html(this.template(data));
            this.$('select').selectpicker();

            this.wavelengthSliderView = new HydrogenAtomWavelengthSliderView({
                defaultWavelength: Constants.MIN_WAVELENGTH,
                minWavelength: Constants.MIN_WAVELENGTH,
                maxWavelength: Constants.MAX_WAVELENGTH,
                invisibleSpectrumAlpha: 1,
                invisibleSpectrumColor: '#777'
            });
            this.wavelengthSliderView.render();
            this.wavelengthSliderView.hideAbsorptionWavelengths();
            this.$('.wavelength-slider-wrapper').prepend(this.wavelengthSliderView.el);

            this.$wavelengthValue = this.$('.wavelength-value');
        },

        /**
         * Renders the scene view
         */
        renderSceneView: function() {
            this.sceneView.render();
            this.$('.scene-view-placeholder').replaceWith(this.sceneView.el);
            this.$el.append(this.sceneView.ui);
        },

        renderLegend: function() {
            this.legendView.render();
            this.$('.legend-panel').append(this.legendView.el);
        },

        renderSpectrometerView: function() {
            this.spectrometerView.render();
            this.$('.spectrometer-panel').append(this.spectrometerView.el);
        },

        renderEnergyDiagrams: function() {
            for (var key in this.energyDiagrams) {
                this.energyDiagrams[key].render();
                this.$('.energy-level-diagram-panel').append(this.energyDiagrams[key].el);
            }
        },

        /**
         * Renders playback controls
         */
        renderPlaybackControls: function() {
            this.$el.append(playbackControlsHtml);

            this.$('.playback-speed').noUiSlider({
                start: 1,
                step: 1,
                range: {
                    'min': 0,
                    'max': 2
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

            var $spectrometerPanel = this.$('.spectrometer-panel');
            this.spectrometerView.setWidth($spectrometerPanel.width());
            this.spectrometerView.setHeight(114);
            this.spectrometerView.postRender();

            this.$('.spectrometer-panel').addClass('collapsed');

            for (var key in this.energyDiagrams)
                this.energyDiagrams[key].postRender();

            this.$('.energy-level-diagram-panel').addClass('collapsed');
            this.hideEnergyDiagramPanel();

            this.lightTypeChanged();
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

            // Update the spectrometer view
            this.spectrometerView.update(timeSeconds, dtSeconds);

            // Update the energy diagrams
            for (var key in this.energyDiagrams)
                this.energyDiagrams[key].update(timeSeconds, dtSeconds);
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

        lightTypeChanged: function() {
            if (this.simulation.gun.get('lightType') === Constants.Gun.LIGHT_WHITE)
                this.$('.wavelength-slider-container').removeClass('open');
            else
                this.$('.wavelength-slider-container').addClass('open');
        },

        changePlaybackSpeed: function(event) {
            var index = parseInt($(event.target).val());
            var deltaTimePerFrame = Constants.DELTA_TIMES_PER_FRAME[index];
            this.simulation.deltaTimePerFrame = deltaTimePerFrame;
        },

        changeModelMode: function(event) {
            var mode = $(event.target).val();
            if (mode === 'prediction') {
                this.$('.prediction-models').addClass('open');
                this.simulation.set('experimentSelected', false);
            }
            else {
                this.$('.prediction-models').removeClass('open');
                this.simulation.set('experimentSelected', true);
            }
        },

        selectModel: function(event) {
            var $wrapper = $(event.target).closest('.prediction-model-wrapper');
            $wrapper.siblings().removeClass('active');
            $wrapper.addClass('active');
            var key = $wrapper.data('model-key');
            this.simulation.set('atomicModel', AtomicModels[key]);
        },

        changeLightType: function(event) {
            var mode = $(event.target).val();
            if (mode === 'white')
                this.simulation.gun.set('lightType', Constants.Gun.LIGHT_WHITE);
            else
                this.simulation.gun.set('lightType', Constants.Gun.LIGHT_MONOCHROME);
        },

        changeWavelength: function(event) {
            this.inputLock(function() {
                var wavelength = parseInt($(event.target).val());
                this.$wavelengthValue.text(wavelength + 'nm');
                this.simulation.gun.set('wavelength', wavelength);
            });
        },

        toggleEnergyLevelDiagramPanel: function(event) {
            this.$('.energy-level-diagram-panel').toggleClass('collapsed');

            if (AppView.windowIsShort()) {
                if (this.$('.energy-level-diagram-panel').hasClass('collapsed'))
                    this.$('.light-controls').removeClass('closed');
                else
                    this.$('.light-controls').addClass('closed');
            }
        },

        toggleSpectrometerPanel: function(event) {
            this.$('.spectrometer-panel').toggleClass('collapsed');
        },

        toggleAbsorptionWavelengths: function(event) {
            if ($(event.target).is(':checked'))
                this.wavelengthSliderView.showAbsorptionWavelengths();
            else
                this.wavelengthSliderView.hideAbsorptionWavelengths();
        },

        showEnergyDiagramPanel: function() {
            this.$('.energy-level-diagram-panel').show();
        },

        hideEnergyDiagramPanel: function() {
            this.$('.energy-level-diagram-panel').hide();
        },

        atomicModelChanged: function(simulation, atomicModel) {
            var atomicModel = this.simulation.get('atomicModel');

            // Determine whether we should show the energy absorption lines option
            if (atomicModel === AtomicModels.BOHR ||
                atomicModel === AtomicModels.DEBROGLIE ||
                atomicModel === AtomicModels.SCHROEDINGER ||
                this.simulation.get('experimentSelected')
            ) {
                this.$('.show-absorption-wavelengths-wrapper').show();
            }
            else {
                this.$('.show-absorption-wavelengths-wrapper').hide();
            }

            for (var key in this.energyDiagrams) {
                this.energyDiagrams[key].clearAtom();
                this.energyDiagrams[key].hide();
            }

            // Determine whether the energy diagram is visible and which one
            if (!this.simulation.get('experimentSelected')) {
                var currentAtomicModel = this.simulation.get('atomicModel');
                var key = _.findKey(AtomicModels, function(atomicModel) {
                    return (atomicModel === currentAtomicModel);
                });

                if (key !== undefined && this.energyDiagrams[key]) {
                    this.energyDiagrams[key].setAtom(this.simulation.atom);
                    this.energyDiagrams[key].show();

                    this.showEnergyDiagramPanel();
                }
                else {
                    this.hideEnergyDiagramPanel();
                }
            }
            else {
                this.hideEnergyDiagramPanel();
            }
        },

        atomAdded: function(atom) {
            var atomConstructor = this.simulation.get('atomicModel').constructor;
            var groundState = atomConstructor.getGroundState();
            var transitionWavelengths = atom.getTransitionWavelengths(groundState);
            this.wavelengthSliderView.setTransitionWavelengths(transitionWavelengths);
        }

    });

    return HydrogenAtomSimView;
});

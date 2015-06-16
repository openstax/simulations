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
    var simHtml = require('text!templates/sim.html');
    var playbackControlsHtml = require('text!templates/playback-controls.html');

    /**
     * This is the umbrella view for everything in a simulation tab.
     *   It will be extended by both the Intro module and the Charts
     *   and contains all the common functionality between the two.
     */
    var SoundSimView = SimView.extend({

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
            'slide .frequency-slider' : 'changeFrequency',
            'slide .amplitude-slider' : 'changeAmplitude'
        },

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Template Sim',
                name: 'template-sim',
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

            return this;
        },

        /**
         * Renders page content. Should be overriden by child classes
         */
        renderScaffolding: function() {
            var data = {
                Constants: Constants,
                simulation: this.simulation,
                unique: this.cid
            };
            this.$el.html(this.template(data));
            this.$el.append(playbackControlsHtml);
            
            this.$('select').selectpicker();

            this.$('.frequency-slider').noUiSlider({
                start: 500,
                connect: 'lower',
                range: {
                    'min': 0,
                    'max': 1000
                }
            });

            this.$('.amplitude-slider').noUiSlider({
                start: 0.5,
                connect: 'lower',
                range: {
                    'min': 0,
                    'max': 1
                }
            });

            this.$frequency = this.$('.frequency-value');
            this.$amplitude = this.$('.amplitude-value');
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
         *
         */
        changeFrequency: function(event) {
            var frequency = parseInt($(event.target).val());
            this.inputLock(function() {
                this.$frequency.text(frequency + ' Hz');
                this.simulation.set('frequency', frequency);
            });
        },

        /**
         *
         */
        changeAmplitude: function(event) {
            var amplitude = parseFloat($(event.target).val());
            this.inputLock(function() {
                this.$amplitude.text(amplitude.toFixed(2));
                this.simulation.set('amplitude', amplitude);
            });
        }

    });

    return SoundSimView;
});

define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var SimView   = require('common/app/sim');
    var RulerView = require('common/tools/ruler');

    var TemplateSimulation = require('models/simulation');
    var TemplateSceneView  = require('views/scene');

    var Constants = require('constants');

    require('nouislider');
    require('bootstrap');
    require('bootstrap-select');

    // CSS
    require('less!styles/sim');
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
    var TemplateSimView = SimView.extend({

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

            'click #ruler-check' : 'toggleRuler'
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
            this.renderRulerView();

            return this;
        },

        /**
         * Renders page content. Should be overriden by child classes
         */
        renderScaffolding: function() {
            var data = {
                Constants: Constants,
                simulation: this.simulation
            };
            this.$el.html(this.template(data));
            this.$('select').selectpicker();

            this.$('.slider'/*'#curvature-radius-slider'*/).noUiSlider({
                connect: 'lower',
                start: 0.8,
                range: {
                    'min': 0.3,
                    'max': 1.3
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
         * Renders the ruler view
         */
        renderRulerView: function() {
            this.rulerView = new RulerView({
                dragFrame: this.el,
                position : {
                    x : 20,
                    y : 130
                },
                orientation : 'horizontal',
                pxPerUnit: 3,
                rulerWidth: 12,
                rulerMeasureUnits : 200,
                ticks : [{
                    type: 'full',
                    at : 20
                },{
                    type: 'mid',
                    at : 10
                },{
                    type: 'unit',
                    at : 1
                }]
            });

            this.rulerView.render();
            this.rulerView.hide();

            this.$el.append(this.rulerView.el);
        },

        /**
         * Called after every component on the page has rendered to make sure
         *   things like widths and heights and offsets are correct.
         */
        postRender: function() {
            this.sceneView.postRender();
            this.rulerView.postRender();
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

            // Update the ruler view
            this.rulerView.update();
        },

        /**
         * Responds to help button click and toggles showing help labels.
         */
        toggleHelp: function() {
            this.$('.help-btn').toggleClass('active');
        },

        /**
         * Responds to ruler checkbox and shows/hides ruler
         */
        toggleRuler: function() {
            if ($(event.target).is(':checked'))
                this.rulerView.show();
            else
                this.rulerView.hide();
        }

    });

    return TemplateSimView;
});

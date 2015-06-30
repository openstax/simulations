define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var SimView = require('common/app/sim');

    var ChargesAndFieldsSimulation = require('models/simulation');
    var ChargesAndFieldsSceneView  = require('views/scene');

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
    var ChargesAndFieldsSimView = SimView.extend({

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
            'click #e-field-check'        : 'toggleEField',
            'click #direction-only-check' : 'toggleDirectionOnly',
            'click #grid-check'           : 'toggleGrid',
            'click #numbers-check'        : 'toggleNumbers',
            'click #tape-measure-check'   : 'toggleTapeMeasure'
        },

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'ChargesAndFields Sim',
                name: 'charges-and-fields',
                link: 'charges-and-fields'
            }, options);

            SimView.prototype.initialize.apply(this, [options]);

            this.initSceneView();
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new ChargesAndFieldsSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new ChargesAndFieldsSceneView({
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
                simulation: this.simulation
            };
            this.$el.html(this.template(data));
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
         * Shows/hides E-Field
         */
        toggleEField: function() {
            if ($(event.target).is(':checked')) {
                $('.e-field-additional-options').show();
            }
            else {
                $('.e-field-additional-options').hide();
            }
        },

        /**
         * Sets whether E-Field shows direction
         */
        toggleDirectionOnly: function() {
            // if ($(event.target).is(':checked'))
                
            // else
                
        },

        /**
         * Shows/hides grid
         */
        toggleGrid: function() {
            if ($(event.target).is(':checked'))
                this.sceneView.showGrid();
            else
                this.sceneView.hideGrid();
        },

        /**
         * Shows/hides numbers
         */
        toggleNumbers: function() {
            // if ($(event.target).is(':checked'))
                
            // else
                
        },

        /**
         * Shows/hides tape measure
         */
        toggleTapeMeasure: function() {
            // if ($(event.target).is(':checked'))
                
            // else
                
        },

    });

    return ChargesAndFieldsSimView;
});

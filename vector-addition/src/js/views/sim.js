define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var SimView = require('common/app/sim');
    var VectorAdditionSimulation = require('models/simulation');
    var VectorAdditionSceneView  = require('views/scene');

    require('bootstrap');

    // CSS
    require('less!styles/sim');
    require('less!common/styles/radio');

    // HTML
    var simHtml = require('text!templates/sim.html');


    var VectorAdditionSimView = SimView.extend({

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
        },

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Vector Addition',
                name: 'vector-addition',
            }, options);

            SimView.prototype.initialize.apply(this, [options]);

            // Initialize the HeatmapView
            this.initSceneView();
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new VectorAdditionSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new VectorAdditionSceneView({
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
            this.$el.html(this.template());
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
        update: function(time, delta) {
            // Update the model
            this.simulation.update(time, delta);

            // Update the scene
            this.sceneView.update(time, delta);
        },

    });

    return VectorAdditionSimView;
});

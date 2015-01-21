define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var SimView                    = require('common/app/sim');
    var ProjectileMotionSimulation = require('models/simulation');
    var ProjectileMotionSceneView  = require('views/scene');

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
    var MovingManSimView = SimView.extend({

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
            'click .sound-btn' : 'changeVolume',
        },

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Projectile Motion',
                name: 'projectile-motion',
            }, options);

            SimView.prototype.initialize.apply(this, [options]);

            // Initialize the HeatmapView
            this.initSceneView();
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new ProjectileMotionSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new ProjectileMotionSceneView({
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
        update: function(time, delta) {
            // Update the model
            this.simulation.update(time, delta);

            // Update the scene
            this.sceneView.update(time, delta);
        },

        /**
         * Steps between the different discrete volume values and updates
         *   the button's icon.
         */
        changeVolume: function(event) {
            var $btn = $(event.target).closest('.sound-btn');

            $btn.hide();

            if ($btn.hasClass('sound-btn-mute')) {
                this.$('.sound-btn-low').show();
                //this.sceneView.movingManView.lowVolume();
            }
            else if ($btn.hasClass('sound-btn-low')) {
                this.$('.sound-btn-high').show();
                //this.sceneView.movingManView.highVolume();
            }
            else if ($btn.hasClass('sound-btn-high')) {
                this.$('.sound-btn-mute').show();
                //this.sceneView.movingManView.muteVolume();
            }
        }

    });

    return MovingManSimView;
});

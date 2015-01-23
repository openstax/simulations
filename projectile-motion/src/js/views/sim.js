define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var SimView                    = require('common/app/sim');
    var ProjectileMotionSimulation = require('models/simulation');
    var ProjectileMotionSceneView  = require('views/scene');

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
            'click .btn-zoom-in' : 'zoomIn',
            'click .btn-zoom-out' : 'zoomOut',
            'change #air-resistance-check': 'toggleAirResistance',
            'change #angle' : 'changeAngle',
            'keyup  #angle' : 'changeAngle'
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

            this.initSceneView();

            this.listenTo(this.simulation.cannon, 'change:angle', this.angleChanged);
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
        },

        toggleAirResistance: function(event) {
            if ($(event.target).is(':checked')) {
                this.$('.air-resistance-parameters').show();
            }
            else {
                this.$('.air-resistance-parameters').hide();
            }
        },

        zoomIn: function() {
            this.sceneView.zoomIn();
        },

        zoomOut: function() {
            this.sceneView.zoomOut();
        },

        changeAngle: function(event) {
            var angle = parseFloat($(event.target).val())
            if (angle < Constants.Cannon.MIN_ANGLE) {
                angle = Constants.Cannon.MIN_ANGLE;
                $(event.target).val(angle.toFixed(0));
            }
            else if (angle > Constants.Cannon.MAX_ANGLE) {
                angle = Constants.Cannon.MAX_ANGLE;
                $(event.target).val(angle.toFixed(0));
            }

            if (!isNaN(angle)) {
                this.inputLock(function(){
                    this.simulation.cannon.set('angle', angle);
                });
            }
        },

        angleChanged: function(model, angle) {
            this.updateLock(function(){
                this.$('#angle').val(parseInt(angle));
            });
        }

    });

    return MovingManSimView;
});

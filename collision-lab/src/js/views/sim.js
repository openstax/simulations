define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var SimView = require('common/app/sim');

    var CollisionLabSimulation = require('models/simulation');

    var CollisionLabSceneView = require('views/scene');
    var BallSettingsView      = require('views/ball-settings');

    var Constants = require('constants');

    require('nouislider');
    require('bootstrap');
    require('bootstrap-select');

    // CSS
    require('less!styles/sim');
    require('less!styles/playback-controls');
    require('less!styles/ball-settings');
    require('less!common/styles/slider');
    require('less!common/styles/radio');
    require('less!bootstrap-select-less');

    // HTML
    var simHtml              = require('text!templates/sim.html');
    var simControlsHtml      = require('text!templates/sim-controls.html');
    var playbackControlsHtml = require('text!templates/playback-controls.html');

    /**
     * SimView class containing shared functionality for
     *   the two Collision Lab tabs
     */
    var CollisionLabSimView = SimView.extend({

        /**
         * Root element properties
         */
        tagName:   'section',
        className: 'sim-view',

        /**
         * Template for rendering the basic scaffolding
         */
        template: _.template(simHtml),
        simControlsTemplate: _.template(simControlsHtml),
        ballSettingsHtml: '', // Overwritten by each tab

        /**
         * Dom event listeners
         */
        events: {
            'click .ball-settings-more-data' : 'showMoreData',
            'click .ball-settings-less-data' : 'showLessData',

            'slide .elasticity-slider' : 'changeElasticity'
        },

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            SimView.prototype.initialize.apply(this, [options]);

            this.initSceneView();
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new CollisionLabSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new CollisionLabSceneView({
                simulation: this.simulation
            });
        },

        /**
         * Renders everything
         */
        render: function() {
            this.$el.empty();

            this.renderScaffolding();
            this.renderControls();
            this.renderSceneView();
            this.renderBallSettings();

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
        },

        /**
         * Renders playback and sim controls
         */
        renderControls: function() {
            var data = {
                name: this.name
            };

            this.$el.append(playbackControlsHtml);
            this.$el.append(this.simControlsTemplate(data));

            this.$('select').selectpicker();

            this.$('.playback-speed').noUiSlider({
                start: 7,
                range: {
                    'min': 0,
                    'max': 10
                }
            });

            this.$elasticitySlider = this.$('.elasticity-slider');
            this.$elasticitySlider.noUiSlider({
                start: 100,
                connect: 'lower',
                range: {
                    'min': 0,
                    'max': 100
                }
            });

            this.$elasticity = this.$('.elasticity');
        },

        /**
         * Renders the ball settings tables
         */
        renderBallSettings: function() {
            this.$el.append(this.ballSettingsHtml);
            this.$ballSettingViews = this.$('.ball-setting-views');
            this.$moreData = this.$('.more-data');
            this.$lessData = this.$('.less-data');
            this.$moreData.hide();

            this.$moreDataButton = this.$('.ball-settings-more-data');
            this.$lessDataButton = this.$('.ball-settings-less-data');

            this.ballSettingViews = [];

            this.simulation.balls.each(function(ball) {
                var ballSettingsView = this.createBallSettingsView(ball);
                this.$ballSettingViews.append(ballSettingsView.el);
                ballSettingsView.render();
                this.ballSettingViews.push(ballSettingsView);
            }, this);
        },

        /**
         * Returns a new ball settings view
         */
        createBallSettingsView: function(ball) {
            return new BallSettingsView({ model: ball });
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

        showMoreData: function() {
            this.$lessData.hide();
            this.$moreData.show();
            for (var i = 0; i < this.ballSettingViews.length; i++)
                this.ballSettingViews[i].showMoreData();
            this.$moreDataButton.hide();
            this.$lessDataButton.show();
        },

        showLessData: function() {
            this.$moreData.hide();
            this.$lessData.show();
            for (var i = 0; i < this.ballSettingViews.length; i++)
                this.ballSettingViews[i].showLessData();
            this.$lessDataButton.hide();
            this.$moreDataButton.show();
        },

        changeElasticity: function(event) {
            var percentage = parseInt($(event.target).val());
            this.inputLock(function() {
                this.$elasticity.text(percentage + '%');
                this.simulation.set('elasticity', percentage / 100);
            });
        },

        elasticityChanged: function(simulation, elasticity) {
            var percentage = Math.round(elasticity * 100);
            this.updateLock(function(){
                this.$elasticity.text(percentage + '%');
                this.$elasticitySlider.val(percentage);
            });
        }

    });

    return CollisionLabSimView;
});

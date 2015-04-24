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
            'click .play-btn'   : 'play',
            'click .pause-btn'  : 'pause',
            'click .rewind-btn' : 'rewind',
            'click .step-btn'   : 'stepForward',
            'click .back-btn'   : 'stepBack',

            'click .ball-settings-more-data' : 'showMoreData',
            'click .ball-settings-less-data' : 'showLessData',

            'slide .elasticity-slider' : 'changeElasticity',
            'slide .playback-speed'    : 'changeTimeScale',

            'click .add-ball-btn'    : 'addBall',
            'click .remove-ball-btn' : 'removeBall',

            'click .velocity-vector-check'   : 'toggleVelocityVectors',
            'click .momentum-vector-check'   : 'toggleMomentumVectors',
            'click .velocity-check'          : 'toggleVelocityLabels',
            'click .momentum-check'          : 'toggleMomentumLabels',
            'click .momenta-diagram-check'   : 'toggleMomentaDiagram',
            'click .kinetic-energy-check'    : 'toggleKineticEnergy',
            'click .center-of-mass-check'    : 'toggleCenterOfMass',
            'click .reflecting-border-check' : 'toggleReflectingBorder',
            'click .paths-check'             : 'toggleBallTraces'
        },

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                userCanAddRemoveBalls: true
            }, options);

            this.userCanAddRemoveBalls = options.userCanAddRemoveBalls;

            SimView.prototype.initialize.apply(this, [options]);

            this.initSceneView();

            this.listenTo(this.simulation, 'change:time',   this.updateTime);
            this.listenTo(this.simulation, 'change:paused', this.pausedChanged);

            this.listenTo(this.simulation.balls, 'reset',  this.ballsReset);
            this.listenTo(this.simulation.balls, 'add',    this.ballAdded);
            this.listenTo(this.simulation.balls, 'remove', this.ballRemoved);
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
                start: 0.5,
                range: {
                    'min': 0.01,
                    'max': 1
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
            this.$time = this.$('.time');
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

            this.ballsReset(this.simulation.balls);
        },

        /**
         * Returns a new ball settings view
         */
        createBallSettingsView: function(ball) {
            return new BallSettingsView({ 
                model: ball, 
                simulation: this.simulation,
                showMoreData: this.moreDataMode
            });
        },

        /**
         * Renders the scene view
         */
        renderSceneView: function() {
            this.sceneView.render();
            this.$('.scene-view-placeholder').replaceWith(this.sceneView.el);
            this.$el.append(this.sceneView.ui);
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
         * Rewinds back to the initial state.
         */
        rewind: function() {
            this.simulation.rewind();
        },

        /**
         * Goes one step back
         */
        stepBack: function() {
            this.pause();
            this.simulation.stepBack();
        },

        /**
         * Goes forward one step
         */
        stepForward: function() {
            this.pause();
            this.simulation.stepForward();
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
            this.moreDataMode = true;
        },

        showLessData: function() {
            this.$moreData.hide();
            this.$lessData.show();
            for (var i = 0; i < this.ballSettingViews.length; i++)
                this.ballSettingViews[i].showLessData();
            this.$lessDataButton.hide();
            this.$moreDataButton.show();
            this.moreDataMode = false;
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

        /**
         * Update the time counter label.
         */
        updateTime: function(simulation, time) {
            this.$time.html(time.toFixed(2) + ' sec');
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
        },

        changeTimeScale: function(event) {
            var timeScale = $(event.target).val();
            this.inputLock(function() {
                this.simulation.set('timeScale', timeScale);
            });
        },

        appendBallSettingsView: function(ballSettingsView) {
            this.$ballSettingViews.children().last().before(ballSettingsView.el);
            ballSettingsView.render();
            this.ballSettingViews.push(ballSettingsView);
        },

        ballsReset: function(balls) {
            // Remove old ball views
            for (var i = this.ballSettingViews.length - 1; i >= 0; i--) {
                this.ballSettingViews[i].remove();
                this.ballSettingViews.splice(i, 1);
            }

            // Add new ball views
            balls.each(function(ball) {
                var ballSettingsView = this.createBallSettingsView(ball);
                this.appendBallSettingsView(ballSettingsView);
            }, this);

            this.updateBallButtons();
        },

        ballAdded: function(ball, balls) {
            var ballSettingsView = this.createBallSettingsView(ball);
            this.appendBallSettingsView(ballSettingsView);

            this.updateBallButtons();
        },

        ballRemoved: function(ball, balls) {
            for (var i = this.ballSettingViews.length - 1; i >= 0; i--) {
                if (this.ballSettingViews[i].model === ball) {
                    this.ballSettingViews[i].remove();
                    this.ballSettingViews.splice(i, 1);
                    break;
                }
            }

            this.updateBallButtons();
        },

        updateBallButtons: function() {
            // Hide remove ball buttons
            this.$('.remove-ball-btn').hide();

            // Show last remove ball button if appropriate
            if (this.simulation.balls.length > Constants.Simulation.MIN_NUM_BALLS && this.userCanAddRemoveBalls) 
                this.$('.remove-ball-btn').last().show();

            // Hide or show the add ball button
            if (this.simulation.balls.length < Constants.Simulation.MAX_NUM_BALLS && this.userCanAddRemoveBalls)
                this.$('.add-ball-row').show();
            else
                this.$('.add-ball-row').hide();
        },

        addBall: function() {
            this.simulation.addBall();
        },

        removeBall: function() {
            this.simulation.removeBall();
        },

        mute: function() {
            this.simulation.mute();
        },

        unmute: function() {
            this.simulation.unmute();
        },

        toggleVelocityVectors: function(event) {
            if ($(event.target).is(':checked'))
                this.sceneView.showVelocityArrows();
            else
                this.sceneView.hideVelocityArrows();
        },

        toggleMomentumVectors: function(event) {
            if ($(event.target).is(':checked'))
                this.sceneView.showMomentumArrows();
            else
                this.sceneView.hideMomentumArrows();
        },

        toggleVelocityLabels: function(event) {
            if ($(event.target).is(':checked'))
                this.sceneView.showVelocityLabels();
            else
                this.sceneView.hideVelocityLabels();
        },

        toggleMomentumLabels: function(event) {
            if ($(event.target).is(':checked'))
                this.sceneView.showMomentumLabels();
            else
                this.sceneView.hideMomentumLabels();
        },

        toggleKineticEnergy: function(event) {
            if ($(event.target).is(':checked'))
                this.sceneView.showKineticEnergy();
            else
                this.sceneView.hideKineticEnergy();
        },

        toggleCenterOfMass: function(event) {
            if ($(event.target).is(':checked'))
                this.sceneView.showCenterOfMass();
            else
                this.sceneView.hideCenterOfMass();
        },

        toggleReflectingBorder: function(event) {
            if ($(event.target).is(':checked')) {
                this.sceneView.showReflectingBorder();
                this.simulation.set('borderOn', true);
            }
            else {
                this.sceneView.hideReflectingBorder();
                this.simulation.set('borderOn', false);
            }
        },

        toggleBallTraces: function(event) {
            if ($(event.target).is(':checked'))
                this.sceneView.showTraces();
            else
                this.sceneView.hideTraces();
        },

        toggleMomentaDiagram: function(event) {
            if ($(event.target).is(':checked'))
                this.sceneView.showMomentaDiagram();
            else
                this.sceneView.hideMomentaDiagram();
        }

    });

    return CollisionLabSimView;
});

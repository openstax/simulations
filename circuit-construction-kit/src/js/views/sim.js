define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var AppView       = require('common/v3/app/app');
    var SimView       = require('common/v3/app/sim');
    var StopwatchView = require('common/v3/tools/stopwatch');

    var CCKSimulation = require('models/simulation');
    var CCKSceneView  = require('views/scene');

    var Constants = require('constants');

    var Assets = require('assets');

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
    var simHtml              = require('text!templates/sim.html');
    var playbackControlsHtml = require('text!templates/playback-controls.html');

    /**
     * 
     */
    var CCKSimView = SimView.extend({

        /**
         * Root element properties
         */
        tagName:   'section',
        className: 'sim-view',

        /**
         * Template for rendering the basic scaffolding
         */
        template:                      _.template(simHtml),
        playbackControlsPanelTemplate: _.template(playbackControlsHtml),

        /**
         * Dom event listeners
         */
        events: {
            'click .play-btn'     : 'play',
            'click .pause-btn'    : 'pause',
            'click .step-btn'     : 'step',
            'click .reset-btn'    : 'reset',

            'click #show-electrons-check'           : 'toggleElectrons',
            'click #show-schematic-check'           : 'toggleSchematic',
            'click #show-values-check'              : 'toggleValues',
            'click #show-voltmeter-check'           : 'toggleVoltmeter',
            'click #show-ammeter-check'             : 'toggleAmmeter',
            'click #show-non-contact-ammeter-check' : 'toggleNonContactAmmeter',
            'click #show-stopwatch-check'           : 'toggleStopwatch',

            'click .zoom-in-btn'  : 'zoomIn',
            'click .zoom-out-btn' : 'zoomOut'
        },

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Circuit Construction Kit',
                name: 'cck',
                link: 'circuit-construction-kit-ac',
                dcOnly: false
            }, options);

            this.dcOnly = options.dcOnly;

            SimView.prototype.initialize.apply(this, [options]);

            this.initSceneView();

            this.listenTo(this.simulation, 'change:paused', this.pausedChanged);
            this.pausedChanged(this.simulation, this.simulation.get('paused'));
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new CCKSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new CCKSceneView({
                simulation: this.simulation,
                dcOnly: this.dcOnly
            });
        },

        /**
         * Renders everything
         */
        render: function() {
            this.$el.empty();

            this.renderScaffolding();
            this.renderSceneView();
            this.renderPlaybackControls();
            this.renderStopwatchView();

            return this;
        },

        /**
         * Renders page content. Should be overriden by child classes
         */
        renderScaffolding: function() {
            var data = {
                Constants: Constants,
                simulation: this.simulation,
                dcOnly: this.dcOnly
            };
            this.$el.html(this.template(data));
            this.$('select').selectpicker();
        },

        /**
         * Renders the playback controls at the bottom of the screen
         */
        renderPlaybackControls: function() {
            this.$playbackControls = $(this.playbackControlsPanelTemplate({ 
                unique: this.cid,
                dcOnly: this.dcOnly
            }));

            this.$el.append(this.$playbackControls);
        },

        /**
         * Renders the scene view
         */
        renderSceneView: function() {
            this.sceneView.render();
            this.$('.scene-view-placeholder').replaceWith(this.sceneView.el);
            this.$el.append(this.sceneView.$ui);
        },

        /**
         * Renders the stopwatch view
         */
        renderStopwatchView: function() {
            this.stopwatchView = new StopwatchView({
                dragFrame: this.el,
                units : 'sec',
                unitRatio: 1,
                decimals: 4,
                position: {
                    x : AppView.windowIsShort() ? 630 : 622,
                    y : AppView.windowIsShort() ? 326 : 398 
                }
            });

            this.stopwatchView.render();
            this.stopwatchView.hide();

            this.$el.append(this.stopwatchView.el);
        },

        /**
         * Called after every component on the page has rendered to make sure
         *   things like widths and heights and offsets are correct.
         */
        postRender: function() {
            this.sceneView.postRender();
            this.stopwatchView.postRender();
        },

        resetSimulation: function() {
            // Save whether or not it was paused when we reset
            var wasPaused = this.simulation.get('paused');

            // Set pause the updater and reset everything
            this.updater.pause();
            this.updater.reset();
            this.resetComponents();
            this.resetControls();

            // Resume normal function
            this.updater.play();
            this.play();
            this.pausedChanged();
        },

        /**
         * Resets all the components of the view.
         */
        resetComponents: function() {
            SimView.prototype.resetComponents.apply(this);
            
            this.sceneView.reset();
            this.stopwatchView.hide();
        },

        /**
         * Resets all the controls back to their default state.
         */
        resetControls: function() {
            this.$('#show-schematic-check').prop('checked', false);
            this.$('#show-values-check').prop('checked', false);
            this.$('#show-electrons-check').prop('checked', true);

            this.$('#show-voltmeter-check').prop('checked', false);
            this.$('#show-ammeter-check').prop('checked', false);
            this.$('#show-non-contact-ammeter-check').prop('checked', false);
            this.$('#show-stopwatch-check').prop('checked', false);
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
            this.stopwatchView.update(timeSeconds, dtSeconds, this.simulation.get('paused'));
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

        toggleElectrons: function() {
            if ($(event.target).is(':checked'))
                this.sceneView.showElectrons();
            else
                this.sceneView.hideElectrons();
        },

        toggleSchematic: function() {
            this.simulation.circuit.set('schematic', $(event.target).is(':checked'));
        },

        toggleValues: function() {
            if ($(event.target).is(':checked')) {
                this.simulation.circuit.branches.each(function(branch) {
                    branch.set('showReadout', true);
                });
            }
            else {
                this.simulation.circuit.branches.each(function(branch) {
                    branch.set('showReadout', false);
                });
            }
        },

        toggleVoltmeter: function() {
            if ($(event.target).is(':checked'))
                this.sceneView.showVoltmeter();
            else
                this.sceneView.hideVoltmeter();
        },

        toggleAmmeter: function() {
            if ($(event.target).is(':checked'))
                this.sceneView.showAmmeter();
            else
                this.sceneView.hideAmmeter();
        },

        toggleNonContactAmmeter: function() {
            if ($(event.target).is(':checked'))
                this.sceneView.showNonContactAmmeter();
            else
                this.sceneView.hideNonContactAmmeter();
        },

        toggleStopwatch: function() {
            if ($(event.target).is(':checked'))
                this.stopwatchView.show();
            else
                this.stopwatchView.hide();
        },

        zoomIn: function() {
            this.sceneView.zoomIn();
        },

        zoomOut: function() {
            this.sceneView.zoomOut();
        }

    });

    return CCKSimView;
});

define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var SimView = require('common/app/sim');

    var LadybugMotionSimulation = require('models/simulation');
    var LadybugMover            = require('models/ladybug-mover');

    var LadybugMotionSceneView = require('views/scene');
    var SeekBarView            = require('views/seek-bar');

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
    var simHtml              = require('text!templates/sim.html');
    var playbackControlsHtml = require('text!templates/playback-controls.html');

    /**
     * A view that determines the contents of the one and only tab
     */
    var LadybugMotionSimView = SimView.extend({

        runUpdateOnReset: true,

        /**
         * Root element properties
         */
        tagName:   'section',
        className: 'sim-view record-mode',

        /**
         * Template for rendering the basic scaffolding
         */
        template: _.template(simHtml),

        /**
         * Dom event listeners
         */
        events: {
            'click .play-btn'   : 'play',
            'click .record-btn' : 'play',
            'click .pause-btn'  : 'pause',
            'click .step-btn'   : 'step',
            'click .rewind-btn' : 'rewind',
            'click .reset-btn'  : 'reset',
            'click .clear-btn'  : 'clear',

            'change #record-mode'   : 'recordModeClicked',
            'change #playback-mode' : 'playbackModeClicked',

            'click .motion-type' : 'motionTypeClicked',

            'click #trace-line' : 'traceLineClicked',
            'click #trace-dots' : 'traceDotsClicked',
            'click #trace-off'  : 'traceOffClicked'
        },

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Ladybug Motion',
                name: 'ladybug-motion',
            }, options);

            SimView.prototype.initialize.apply(this, [options]);

            this.initSceneView();
            this.initSeekBarView();

            this.listenTo(this.simulation, 'change:motionType', this.motionTypeChanged);
            this.listenTo(this.simulation, 'change:recording', this.recordingChanged);
            this.listenTo(this.simulation, 'change:paused',    this.pausedChanged);
            this.pausedChanged(this.simulation, this.simulation.get('paused'));
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new LadybugMotionSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new LadybugMotionSceneView({
                simulation: this.simulation
            });
        },

        initSeekBarView: function() {
            this.seekBarView = new SeekBarView({
                model: this.simulation
            });
        },

        /**
         * Renders everything
         */
        render: function() {
            this.$el.empty();

            this.renderScaffolding();
            this.renderSceneView();
            this.renderSeekBarView();

            return this;
        },

        /**
         * Renders page content. Should be overriden by child classes
         */
        renderScaffolding: function() {
            var data = {
                Constants: Constants,
                simulation: this.simulation,
                motions: _.keys(LadybugMover.MOTION_TYPES)
            };
            this.$el.html(this.template(data));

            this.$el.append(playbackControlsHtml);

            this.$('select').selectpicker();
        },

        /**
         * Renders the scene view
         */
        renderSceneView: function() {
            this.sceneView.render();
            this.$('.scene-view-placeholder').replaceWith(this.sceneView.el);
            this.$el.append(this.sceneView.ui);
        },

        renderSeekBarView: function() {
            this.seekBarView.render();
            this.$('.playback-controls-wrapper').append(this.seekBarView.el);
        },

        /**
         * Called after every component on the page has rendered to make sure
         *   things like widths and heights and offsets are correct.
         */
        postRender: function() {
            this.sceneView.postRender();
            this.seekBarView.postRender();
        },

        /**
         * Overrides so that we don't rerender on a reset.
         */
        rerender: function() {
            this.sceneView.reset();
        },

        /**
         * Overrides to remove the confirmation dialog because it's
         *   not important in this sim.
         */
        reset: function() {
            this.resetSimulation();
            this.simulation.pause();
            this.$('#trace-line').click();
            this.$('#show-velocity-check').prop('checked', true);
            this.$('#show-acceleration-check').prop('checked', true);
        },

        /**
         * Rewinds the simulation.
         */
        rewind: function() {
            this.pause();
            this.simulation.rewind();
            this.seekBarView.update();
        },

        /**
         * Clears the sim's history.
         */
        clear: function() {
            this.simulation.clear();
            this.seekBarView.update();
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
         * Sets sim to record mode
         */
        recordModeClicked: function() {
            this.inputLock(function() {
                this.simulation.set('recording', true);
            });
        },

        /**
         * Sets sim to playback mode
         */
        playbackModeClicked: function() {
            this.inputLock(function() {
                this.simulation.set('recording', false);
            });
        },

        /**
         * The simulation changed its recording state.
         */
        recordingChanged: function() {
            if (this.simulation.get('recording')) {
                this.$el.addClass('record-mode');
                this.updateLock(function() {
                    this.$('#record-mode').click();
                });
            }
            else {
                this.$el.removeClass('record-mode');
                this.updateLock(function() {
                    this.$('#playback-mode').click();
                });
            }
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
         * Sets the simulation's automated motion type
         */
        motionTypeClicked: function(event) {
            var key = $(event.target).val();
            this.inputLock(function() {
                this.simulation.set('motionType', key);
            });
        },

        /**
         * Responds to changes in simulation's automated motion type
         */
        motionTypeChanged: function(simulation, motionTypeKey) {
            this.updateLock(function() {
                this.$('.motion-type').each(function() {
                    if ($(this).val() === motionTypeKey)
                        $(this).click();
                })
            });
        },

        traceLineClicked: function() {
            this.sceneView.ladybugTraceView.showLines();
        },

        traceDotsClicked: function() {
            this.sceneView.ladybugTraceView.showDots();
        },

        traceOffClicked: function() {
            this.sceneView.ladybugTraceView.hide();
        }

    });

    return LadybugMotionSimView;
});

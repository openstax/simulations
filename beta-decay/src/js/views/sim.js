define(function (require) {

    'use strict';

    var NuclearPhysicsSimView = require('views/sim');
    
    var BetaDecayLegendView         = require('beta-decay/views/legend');
    var BetaDecayNucleusChooserView = require('beta-decay/views/nucleus-chooser');

    var Constants = require('constants');

    // CSS
    require('less!beta-decay/styles/sim');
    require('less!beta-decay/styles/playback-controls');

    // HTML
    var simHtml              = require('text!beta-decay/templates/sim.html');
    var playbackControlsHtml = require('text!beta-decay/templates/playback-controls.html');

    /**
     * This is a placeholder for now, because I don't think we'll actually want to extend the nuclear-physics sim view to make these tabs
     */
    var BetaDecaySimView = NuclearPhysicsSimView.extend({

        /**
         * Template for rendering the basic scaffolding
         */
        template: _.template(simHtml),
        playbackControlsTemplate: _.template(playbackControlsHtml),

        /**
         * Dom event listeners
         */
        events: {
            'click .play-btn'  : 'play',
            'click .pause-btn' : 'pause',
            'click .step-btn'  : 'step',
            'click .reset-btn' : 'reset',

            'click .show-labels-check' : 'toggleLabels'
        },

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Beta Decay',
                link: 'beta-decay'
            }, options);

            NuclearPhysicsSimView.prototype.initialize.apply(this, [options]);

            this.initLegend();
            this.initNucleusChooser();

            this.listenTo(this.simulation, 'change:paused', this.pausedChanged);
            this.pausedChanged(this.simulation, this.simulation.get('paused'));
        },

        initLegend: function() {
            this.legendView = new BetaDecayLegendView();
        },

        initNucleusChooser: function() {
            this.nucleusChooserView = new BetaDecayNucleusChooserView({
                simulation: this.simulation
            });
        },

        /**
         * Renders everything
         */
        render: function() {
            NuclearPhysicsSimView.prototype.render.apply(this, arguments);

            this.renderPlaybackControls();

            return this;
        },

        /**
         * Renders the scene view
         */
        renderSceneView: function() {
            NuclearPhysicsSimView.prototype.renderSceneView.apply(this, arguments);

            this.$el.append(this.sceneView.ui);
        },

        /**
         * Renders playback controls
         */
        renderPlaybackControls: function() {
            this.$el.append(this.playbackControlsTemplate({
                unique: this.cid
            }));
        },

        renderLegend: function() {
            this.legendView.render();
            this.$('.legend-panel').append(this.legendView.el);
        },

        renderNucleusChooser: function() {
            this.nucleusChooserView.render();
            this.$('.choose-nucleus-panel').append(this.nucleusChooserView.el);
        },

        /**
         * Renders everything
         */
        postRender: function() {
            NuclearPhysicsSimView.prototype.postRender.apply(this, arguments);

            this.renderLegend();
            this.renderNucleusChooser();

            return this;
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
            NuclearPhysicsSimView.prototype.resetComponents.apply(this);
            
            this.sceneView.reset();
            this.nucleusChooserView.reset();
        },

        /**
         * Resets all the controls back to their default state.
         */
        resetControls: function() {
            this.$('.show-labels-check').prop('checked', true);
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

        toggleLabels: function(event) {
            if ($(event.target).is(':checked'))
                this.sceneView.showLabels();
            else
                this.sceneView.hideLabels();
        }

    });

    return BetaDecaySimView;
});

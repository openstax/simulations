define(function (require) {

    'use strict';

    var NuclearPhysicsSimView = require('views/sim');

    var Constants = require('constants');

    // CSS
    require('less!radioactive-dating-game/styles/sim');
    require('less!radioactive-dating-game/styles/playback-controls');

    // HTML
    var playbackControlsHtml = require('text!radioactive-dating-game/templates/playback-controls.html');

    /**
     * This is a placeholder for now, because I don't think we'll actually want to extend the nuclear-physics sim view to make these tabs
     */
    var RadioactiveDatingGameSimView = NuclearPhysicsSimView.extend({

        /**
         * Template for rendering the basic scaffolding
         */
        playbackControlsTemplate: _.template(playbackControlsHtml),

        /**
         * Dom event listeners
         */
        events: {
            'click .play-btn'  : 'play',
            'click .pause-btn' : 'pause',
            'click .step-btn'  : 'step'
        },

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Radiocactive Dating Game',
                link: 'radioactive-dating-game'
            }, options);

            NuclearPhysicsSimView.prototype.initialize.apply(this, [options]);

            this.listenTo(this.simulation, 'change:paused', this.pausedChanged);
            this.pausedChanged(this.simulation, this.simulation.get('paused'));
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

        /**
         * The simulation changed its paused state.
         */
        pausedChanged: function() {
            if (this.simulation.get('paused'))
                this.$el.removeClass('playing');
            else
                this.$el.addClass('playing');
        },

        setSoundVolumeMute: function() {},

        setSoundVolumeLow: function() {},

        setSoundVolumeHigh: function() {}

    });

    return RadioactiveDatingGameSimView;
});

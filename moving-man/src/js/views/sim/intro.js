define(function(require) {

    'use strict';

    var _ = require('underscore');

    var MovingManSimulation = require('models/moving-man-simulation');
    var MovingManSimView    = require('views/sim');

    // HTML
    var playbackControlsHtml = require('text!templates/intro-controls.html');

    // CSS
    require('less!styles/playback-controls');

    /**
     *
     */
    var IntroSimView = MovingManSimView.extend({

        events: _.extend(MovingManSimView.prototype.events, {
            
        }),

        initialize: function(options) {
            options = _.extend({
                title: 'Introduction',
                name:  'intro'
            }, options);
            
            MovingManSimView.prototype.initialize.apply(this, [ options ]);

            this.listenTo(this.simulation, 'change:paused', this.pausedChanged);
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new MovingManSimulation({
                paused: true
            }, {
                noRecording: true
            });
        },

        /**
         * Renders everything
         */
        render: function() {
            MovingManSimView.prototype.render.apply(this);

            this.renderPlaybackControls();

            this.simulation.trigger('change:paused');

            return this;
        },

        /**
         * Renders the playback controls
         */
        renderPlaybackControls: function() {
            this.$('.playback-controls-placeholder').replaceWith(playbackControlsHtml);
        }

    });

    return IntroSimView;
});

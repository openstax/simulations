define(function (require) {

    'use strict';

    var NuclearPhysicsSimView = require('views/sim');

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
         * Renders playback controls
         */
        renderPlaybackControls: function() {
            this.$el.append(playbackControlsHtml);
        }

    });

    return BetaDecaySimView;
});

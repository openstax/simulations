define(function (require) {

    'use strict';

    var NuclearFissionSimView   = require('nuclear-fission/views/sim');
    var ChainReactionLegendView = require('nuclear-fission/views/legend/chain-reaction');

    var Constants = require('constants');

    // HTML
    var simHtml              = require('text!nuclear-fission/templates/chain-reaction-sim.html');
    var playbackControlsHtml = require('text!nuclear-fission/templates/chain-reaction-playback-controls.html');

    /**
     * Multiple Atoms tab
     */
    var ChainReactionSimView = NuclearFissionSimView.extend({

        events: _.extend({}, NuclearFissionSimView.prototype.events, {
            
        }),

        /**
         * Template for rendering the basic scaffolding
         */
        template: _.template(simHtml),
        playbackControlsTemplate: _.template(playbackControlsHtml),

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Chain Reaction',
                name: 'chain-reaction'
            }, options);

            NuclearFissionSimView.prototype.initialize.apply(this, [options]);

            this.initLegend();
        },

        initLegend: function() {
            this.legendView = new ChainReactionLegendView();
        },

        /**
         * Renders everything
         */
        render: function() {
            NuclearFissionSimView.prototype.render.apply(this, arguments);

            this.renderPlaybackControls();

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

            this.$('.u-235-slider').noUiSlider({
                start: 1,
                connect: 'lower',
                range: {
                    'min': 0,
                    'max': 100
                }
            });

            this.$('.u-238-slider').noUiSlider({
                start: 0,
                connect: 'lower',
                range: {
                    'min': 0,
                    'max': 100
                }
            });

            this.$('select').selectpicker();
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

        /**
         * Renders everything
         */
        postRender: function() {
            NuclearFissionSimView.prototype.postRender.apply(this, arguments);

            this.renderLegend();

            return this;
        }

    });

    return ChainReactionSimView;
});

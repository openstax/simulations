define(function (require) {

    'use strict';

    var OneNucleusSimulation = require('nuclear-fission/models/simulation/one-nucleus');

    var NuclearFissionSimView = require('nuclear-fission/views/sim');
    var OneNucleusLegendView  = require('nuclear-fission/views/legend/one-nucleus');
    var OneNucleusSceneView   = require('nuclear-fission/views/scene/one-nucleus');

    var Constants = require('constants');

    // HTML
    var simHtml              = require('text!nuclear-fission/templates/one-nucleus-sim.html');
    var playbackControlsHtml = require('text!nuclear-fission/templates/simple-playback-controls.html');

    /**
     * One Nucleus tab
     */
    var OneNucleusSimView = NuclearFissionSimView.extend({

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
                title: 'Fission: One Nucleus',
                name: 'one-nucleus'
            }, options);

            NuclearFissionSimView.prototype.initialize.apply(this, [options]);

            this.initLegend();
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new OneNucleusSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new OneNucleusSceneView({
                simulation: this.simulation
            });
        },

        /**
         * Initializes the LegendView.
         */
        initLegend: function() {
            this.legendView = new OneNucleusLegendView({ renderer: this.sceneView.renderer });
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

    return OneNucleusSimView;
});

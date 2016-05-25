define(function (require) {

    'use strict';

    var _ = require('underscore');

    var NuclearReactorSimulation = require('nuclear-fission/models/simulation/nuclear-reactor');

    var NuclearFissionSimView    = require('nuclear-fission/views/sim');
    var NuclearReactorLegendView = require('nuclear-fission/views/legend/nuclear-reactor');
    var NuclearReactorSceneView  = require('nuclear-fission/views/scene/nuclear-reactor');

    var Constants = require('constants');

    // HTML
    var simHtml              = require('text!nuclear-fission/templates/nuclear-reactor-sim.html');
    var playbackControlsHtml = require('text!nuclear-fission/templates/simple-playback-controls.html');
    var pictureDialogHtml    = require('text!nuclear-fission/templates/nuclear-reactor-picture-dialog.html');

    // CSS
    require('less!nuclear-fission/styles/picture-dialog');

    /**
     * Nuclear Reactor tab
     */
    var NuclearReactorSimView = NuclearFissionSimView.extend({

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
                title: 'Nuclear Reactor',
                name: 'nuclear-reactor'
            }, options);

            NuclearFissionSimView.prototype.initialize.apply(this, [options]);

            this.initLegend();

            this.listenTo(this.simulation, 'change:energyReleasedPerSecond', this.updatePowerBar);
            this.listenTo(this.simulation, 'change:totalEnergyReleased',     this.updateEnergyBar);
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new NuclearReactorSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new NuclearReactorSceneView({
                simulation: this.simulation
            });
        },

        initLegend: function() {
            this.legendView = new NuclearReactorLegendView({ renderer: this.sceneView.renderer });
        },

        /**
         * Renders everything
         */
        render: function() {
            NuclearFissionSimView.prototype.render.apply(this, arguments);

            this.renderPlaybackControls();

            this.$el.append(pictureDialogHtml);

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

            this.$powerBar = this.$('#power-bar');
            this.$energyBar = this.$('#energy-bar');
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
        },

        updatePowerBar: function(simulation, energyReleasedPerSecond) {
            var percent = (energyReleasedPerSecond / NuclearReactorSimulation.ENERGY_PER_SECOND_GRAPH_RANGE) * 100;
            this.$powerBar.css('height', Math.min(percent, 100) + '%');
        },

        updateEnergyBar: function(simulation, totalEnergyReleased) {
            var percent = (totalEnergyReleased / NuclearReactorSimulation.TOTAL_ENERGY_GRAPH_RANGE) * 100;
            this.$energyBar.css('height', Math.min(percent, 100) + '%');
        }

    });

    return NuclearReactorSimView;
});

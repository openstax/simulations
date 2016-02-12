define(function (require) {

    'use strict';

    var SingleNucleusBetaDecaySimulation = require('beta-decay/models/simulation/single-nucleus');

    var BetaDecaySimView                = require('beta-decay/views/sim');
    var SingleNucleusBetaDecaySceneView = require('beta-decay/views/scene/single');
    var BetaDecayLegendView             = require('beta-decay/views/legend');

    var Constants = require('constants');

    /**
     * Single Atom tab
     */
    var SingleNucleusBetaDecaySimView = BetaDecaySimView.extend({

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Single Atom',
                link: 'beta-decay'
            }, options);

            BetaDecaySimView.prototype.initialize.apply(this, [options]);

            this.initLegend();
            this.initNucleusChooser();
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new SingleNucleusBetaDecaySimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new SingleNucleusBetaDecaySceneView({
                simulation: this.simulation
            });
        },

        initLegend: function() {
            this.legendView = new BetaDecayLegendView();
        },

        initNucleusChooser: function() {

        },

        /**
         * Renders everything
         */
        postRender: function() {
            BetaDecaySimView.prototype.postRender.apply(this, arguments);

            this.renderLegend();
            this.renderNucleusChooser();

            return this;
        },

        renderLegend: function() {
            this.legendView.render();
            this.$('.legend-panel').append(this.legendView.el);
        },

        renderNucleusChooser: function() {

        }

    });

    return SingleNucleusBetaDecaySimView;
});

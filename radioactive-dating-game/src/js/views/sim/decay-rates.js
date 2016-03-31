define(function (require) {

    'use strict';

    var DecayRatesSimulation = require('radioactive-dating-game/models/simulation/decay-rates');

    var RadioactiveDatingGameSimView = require('radioactive-dating-game/views/sim');
    var DecayRatesSceneView          = require('radioactive-dating-game/views/scene/decay-rates');
    var DecayRatesNucleusChooserView = require('radioactive-dating-game/views/nucleus-chooser/decay-rates');

    var Constants = require('constants');

    // HTML
    var simHtml              = require('text!radioactive-dating-game/templates/multi-nucleus-sim.html');
    var playbackControlsHtml = require('text!radioactive-dating-game/templates/decay-rates-playback-controls.html');

    /**
     * Multiple Atoms tab
     */
    var DecayRatesSimView = RadioactiveDatingGameSimView.extend({

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
                title: 'Decay Rates',
                name: 'decay-rates'
            }, options);

            RadioactiveDatingGameSimView.prototype.initialize.apply(this, [options]);

            this.initNucleusChooser();
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new DecayRatesSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new DecayRatesSceneView({
                simulation: this.simulation
            });
        },

        initNucleusChooser: function() {
            this.nucleusChooserView = new DecayRatesNucleusChooserView({
                simulation: this.simulation
            });
        },

        renderNucleusChooser: function() {
            this.nucleusChooserView.render();
            this.$('.choose-nucleus-panel').append(this.nucleusChooserView.el);
        },

        /**
         * Renders everything
         */
        postRender: function() {
            RadioactiveDatingGameSimView.prototype.postRender.apply(this, arguments);

            this.renderNucleusChooser();

            return this;
        }

    });

    return DecayRatesSimView;
});

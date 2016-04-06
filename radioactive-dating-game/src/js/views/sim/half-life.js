define(function (require) {

    'use strict';

    var HalfLifeSimulation = require('radioactive-dating-game/models/simulation/half-life');

    var RadioactiveDatingGameSimView = require('radioactive-dating-game/views/sim');
    var HalfLifeSceneView            = require('radioactive-dating-game/views/scene/half-life');
    var HalfLifeNucleusChooserView   = require('radioactive-dating-game/views/nucleus-chooser/half-life');

    var Constants = require('constants');

    // HTML
    var simHtml              = require('text!radioactive-dating-game/templates/multi-nucleus-sim.html');
    var playbackControlsHtml = require('text!radioactive-dating-game/templates/half-life-playback-controls.html');

    /**
     * Multiple Atoms tab
     */
    var HalfLifeSimView = RadioactiveDatingGameSimView.extend({

        events: _.extend({}, RadioactiveDatingGameSimView.prototype.events, {
            'click .show-labels-check' : 'toggleLabels'
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
                title: 'Half Life',
                name: 'half-life'
            }, options);

            RadioactiveDatingGameSimView.prototype.initialize.apply(this, [options]);

            this.initNucleusChooser();
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new HalfLifeSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new HalfLifeSceneView({
                simulation: this.simulation
            });
        },

        initNucleusChooser: function() {
            this.nucleusChooserView = new HalfLifeNucleusChooserView({
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
        },

        toggleLabels: function(event) {
            if ($(event.target).is(':checked'))
                this.sceneView.showLabels();
            else
                this.sceneView.hideLabels();
        }

    });

    return HalfLifeSimView;
});

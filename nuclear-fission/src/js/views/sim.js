define(function (require) {

    'use strict';

    var _ = require('underscore');

    var NuclearPhysicsSimView = require('views/sim');

    var NuclearFissionSimulation = require('nuclear-fission/models/simulation');
    var NuclearFissionSceneView  = require('nuclear-fission/views/scene');

    // CSS
    require('less!nuclear-fission/styles/sim');
    require('less!nuclear-fission/styles/playback-controls');

    /**
     * 
     */
    var NuclearFissionSimView = NuclearPhysicsSimView.extend({

        /**
         * Dom event listeners
         */
        events: {
            'click .play-btn'  : 'play',
            'click .pause-btn' : 'pause',
            'click .step-btn'  : 'step',
            'click .reset-btn' : 'reset'
        },

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Nuclear Fission',
                name: 'nuclear-fission',
                link: 'nuclear-fission'
            }, options);

            NuclearPhysicsSimView.prototype.initialize.apply(this, [options]);

            this.listenTo(this.simulation, 'change:paused', this.pausedChanged);
            this.pausedChanged(this.simulation, this.simulation.get('paused'));
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new NuclearFissionSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new NuclearFissionSceneView({
                simulation: this.simulation
            });
        },

        /**
         * Renders the scene view
         */
        renderSceneView: function() {
            NuclearPhysicsSimView.prototype.renderSceneView.apply(this, arguments);

            this.$el.append(this.sceneView.ui);
        },

        /**
         * The simulation changed its paused state.
         */
        pausedChanged: function() {
            if (this.simulation.get('paused'))
                this.$el.removeClass('playing');
            else
                this.$el.addClass('playing');
        }

    });

    return NuclearFissionSimView;
});

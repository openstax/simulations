define(function (require) {

    'use strict';

    var MeasurementSimulation = require('radioactive-dating-game/models/simulation/measurement');

    var RadioactiveDatingGameSimView = require('radioactive-dating-game/views/sim');
    var MeasurementSceneView         = require('radioactive-dating-game/views/scene/measurement');

    var Constants = require('constants');

    // HTML
    var simHtml = require('text!radioactive-dating-game/templates/measurement-sim.html');

    /**
     * Multiple Atoms tab
     */
    var MeasurementSimView = RadioactiveDatingGameSimView.extend({

        events: _.extend({}, RadioactiveDatingGameSimView.prototype.events, {
            
        }),

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
                title: 'Measurement',
                name: 'measurement'
            }, options);

            RadioactiveDatingGameSimView.prototype.initialize.apply(this, [options]);
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new MeasurementSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new MeasurementSceneView({
                simulation: this.simulation
            });
        },

        /**
         * Renders everything
         */
        postRender: function() {
            RadioactiveDatingGameSimView.prototype.postRender.apply(this, arguments);

            return this;
        }

    });

    return MeasurementSimView;
});

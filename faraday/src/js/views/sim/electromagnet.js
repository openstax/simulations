define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var ElectromagnetSimulation = require('models/simulation/electromagnet');
    var ElectromagnetSceneView  = require('views/scene/electromagnet');

    var FaradaySimView = require('views/sim');

    var Constants = require('constants');

    /**
     * 
     */
    var ElectromagnetSimView = FaradaySimView.extend({

        /**
         * Dom event listeners
         */
        events: _.extend(FaradaySimView.prototype.events, {
            
        }),

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Electromagnet',
                name: 'electromagnet'
            }, options);

            FaradaySimView.prototype.initialize.apply(this, [options]);
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new ElectromagnetSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new ElectromagnetSceneView({
                simulation: this.simulation
            });
        },

        /**
         * Renders everything
         */
        render: function() {
            FaradaySimView.prototype.render.apply(this);

            this.renderPlaybackControls();
            this.renderElectromagnetControls();

            return this;
        },

        /**
         * Resets all the components of the view.
         */
        resetComponents: function() {
            FaradaySimView.prototype.resetComponents.apply(this);
            
            this.resetElectromagnetControls();
        }

    });

    return ElectromagnetSimView;
});

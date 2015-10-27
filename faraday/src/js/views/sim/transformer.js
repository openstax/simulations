define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var TransformerSimulation = require('models/simulation/transformer');

    var TransformerSceneView = require('views/scene/transformer');
    var FaradaySimView         = require('views/sim');

    var Constants = require('constants');

    /**
     * 
     */
    var TransformerSimView = FaradaySimView.extend({

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
                title: 'Transformer',
                name: 'transformer',
                hideCompass: true
            }, options);

            FaradaySimView.prototype.initialize.apply(this, [options]);
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new TransformerSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new TransformerSceneView({
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
            this.renderPickupCoilControls();

            return this;
        },

        /**
         * Resets all the components of the view.
         */
        resetComponents: function() {
            FaradaySimView.prototype.resetComponents.apply(this);
            
        }

    });

    return TransformerSimView;
});

define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var GlassLayersSimulation = require('models/simulation/glass-layers');
    var GlassLayersSceneView  = require('views/scene/glass-layers');
    var BaseGreenhouseSimView = require('views/sim/base-greenhouse');

    var Constants = require('constants');

    // HTML
    var simHtml = require('text!templates/sim-glass-layers.html');

    /**
     * SimView for the Glass Layers tab
     */
    var GlassLayersSimView = BaseGreenhouseSimView.extend({

        /**
         * Template for rendering the basic scaffolding
         */
        template: _.template(simHtml),

        /**
         * Dom event listeners
         */
        events: _.extend(BaseGreenhouseSimView.prototype.events, {
            'click .add-glass-pane-btn'     : 'addGlassPane',
            'click .remove-glass-pane-btn'  : 'removeGlassPane'
        }),

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Glass Layers',
                name: 'glass-layers',
            }, options);

            BaseGreenhouseSimView.prototype.initialize.apply(this, [options]);
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new GlassLayersSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new GlassLayersSceneView({
                simulation: this.simulation
            });
        },

        /**
         * Adds a glass pane to the sim.
         */
        addGlassPane: function() {
            this.simulation.addGlassPane();
        },

        /**
         * Removes a glass pane from the sim.
         */
        removeGlassPane: function() {
            this.simulation.removeGlassPane();
        }

    });

    return GlassLayersSimView;
});

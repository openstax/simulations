define(function(require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var PrismBreakSimulation = require('models/simulation/prism-break');

    var BendingLightSimView = require('views/sim');
    var MediumControlsView  = require('views/medium-controls');
    var PrismBreakSceneView = require('views/scene/prism-break');
    var PrismsPanelView     = require('views/prisms-panel');

    var simHtml = require('text!templates/sim/prism-break.html');

    /**
     *
     */
    var PrismBreakSimView = BendingLightSimView.extend({

        template: _.template(simHtml),

        events: _.extend(BendingLightSimView.prototype.events, {
            
        }),

        initialize: function(options) {
            options = _.extend({
                title: 'Prism Break',
                name:  'prism-break'
            }, options);
            
            BendingLightSimView.prototype.initialize.apply(this, [ options ]);

            this.initEnvironmentMediumControls();
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new PrismBreakSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new PrismBreakSceneView({
                simulation: this.simulation
            });
        },

        initEnvironmentMediumControls: function() {
            this.environmentMediumControlsView = new MediumControlsView({
                model: this.simulation.environment,
                simulation: this.simulation,
                name: 'environment',
                label: 'Environment'
            });
        },

        initPrismsPanel: function() {
            this.prismsPanelView = new PrismsPanelView({
                simulation: this.simulation,
                prismImages: this.sceneView.getPrismIcons()
            });
        },

        render: function() {
            BendingLightSimView.prototype.render.apply(this);

            this.initPrismsPanel();

            this.prismsPanelView.render();
            this.environmentMediumControlsView.render();

            this.$el.append(this.prismsPanelView.el);
            this.$el.append(this.environmentMediumControlsView.el);

            return this;
        }

    });

    return PrismBreakSimView;
});

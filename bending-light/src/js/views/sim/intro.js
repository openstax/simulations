define(function(require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var IntroSimulation     = require('models/simulation/intro');
    var BendingLightSimView = require('views/sim');
    var IntroSceneView      = require('views/scene/intro');
    var MediumControlsView  = require('views/medium-controls');

    var simHtml = require('text!templates/sim/intro.html');

    /**
     *
     */
    var IntroSimView = BendingLightSimView.extend({

        template: _.template(simHtml),

        events: _.extend(BendingLightSimView.prototype.events, {
            
        }),

        initialize: function(options) {
            options = _.extend({
                title: 'Intro',
                name:  'intro'
            }, options);
            
            BendingLightSimView.prototype.initialize.apply(this, [ options ]);

            this.initMediumControls();
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new IntroSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new IntroSceneView({
                simulation: this.simulation
            });
        },

        initMediumControls: function() {
            this.topMediumControlsView = new MediumControlsView({
                model: this.simulation.topMedium,
                name: 'top'
            });

            this.bottomMediumControlsView = new MediumControlsView({
                model: this.simulation.bottomMedium,
                name: 'bottom'
            });
        },

        render: function() {
            BendingLightSimView.prototype.render.apply(this);

            this.topMediumControlsView.render();
            this.bottomMediumControlsView.render();

            this.$el.append(this.topMediumControlsView.el);
            this.$el.append(this.bottomMediumControlsView.el);

            return this;
        }

    });

    return IntroSimView;
});

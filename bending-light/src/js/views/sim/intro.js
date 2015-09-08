define(function(require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var IntroSimulation     = require('models/simulation/intro');
    var BendingLightSimView = require('views/sim');
    var IntroSceneView      = require('views/scene/intro');

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

        render: function() {
            BendingLightSimView.prototype.render.apply(this);

            return this;
        }

    });

    return IntroSimView;
});

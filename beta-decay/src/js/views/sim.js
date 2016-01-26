define(function (require) {

    'use strict';

    var NuclearPhysicsSimView = require('views/sim');
    var BetaDecaySceneView = require('beta-decay/views/scene');

    var Constants = require('constants');

    // HTML
    var simHtml = require('text!beta-decay/templates/sim.html');

    /**
     * This is a placeholder for now, because I don't think we'll actually want to extend the nuclear-physics sim view to make these tabs
     */
    var BetaDecaySimView = NuclearPhysicsSimView.extend({

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
                title: 'Beta Decay',
                link: 'beta-decay'
            }, options);

            NuclearPhysicsSimView.prototype.initialize.apply(this, [options]);
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new BetaDecaySceneView({
                simulation: this.simulation
            });
        }

    });

    return BetaDecaySimView;
});

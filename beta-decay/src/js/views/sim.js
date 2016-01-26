define(function (require) {

    'use strict';

    var CCKSimView = require('views/sim');
    var BetaDecaySceneView = require('./scene');

    var Constants = require('constants');

    // HTML
    var simHtml = require('text!beta-decay/templates/sim.html');

    /**
     * This is a placeholder for now, because I don't think we'll actually want to extend the nuclear-physics sim view to make these tabs
     */
    var BetaDecaySimView = CCKSimView.extend({

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
                link: 'beta-decay',
                dcOnly: true
            }, options);

            CCKSimView.prototype.initialize.apply(this, [options]);

            console.log(Constants.CENTRAL_CONSTANT, Constants.LOCAL_CONSTANT);
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

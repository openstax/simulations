define(function (require) {

    'use strict';

    var CCKSimView = require('views/sim');
    var BetaDecaySceneView = require('./scene');

    /**
     * This is a placeholder for now, because I don't think we'll actually want to extend the nuclear-physics sim view to make these tabs
     */
    var BetaDecaySimView = CCKSimView.extend({

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

define(function (require) {

    'use strict';

    var _ = require('underscore');

    var SOMSimView              = require('views/sim');
    var SolidLiquidGasSceneView = require('views/scene/solid-liquid-gas');

    var phaseChangeButtons = require('text!templates/phase-change-buttons.html');


    var SolidLiquidGasSimView = SOMSimView.extend({

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Solid, Liquid, Gas',
                name: 'solid-liquid-gas-sim',
            }, options);

            SOMSimView.prototype.initialize.apply(this, [options]);

            this.initSceneView();
        },

        /**
         * Renders page content. Should be overriden by child classes
         */
        renderScaffolding: function() {
            SOMSimView.prototype.renderScaffolding.apply(this);

            this.$('.side-panel').append(phaseChangeButtons);
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new SolidLiquidGasSceneView({
                simulation: this.simulation
            });
        },

    });

    return SolidLiquidGasSimView;
});

define(function (require) {

    'use strict';

    var _ = require('underscore');

    var PhaseStateChanger = require('models/phase-state-changer');

    var SOMSimView              = require('views/sim');
    var SolidLiquidGasSceneView = require('views/scene/solid-liquid-gas');

    var phaseChangeButtons = require('text!templates/phase-change-buttons.html');


    var SolidLiquidGasSimView = SOMSimView.extend({

        events: _.extend(SOMSimView.prototype.events, {
            // Playback controls
            'click #phase-solid'  : 'makeSolid',
            'click #phase-liquid' : 'makeSolid',
            'click #phase-gas'    : 'makeGas'
        }),

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

        makeSolid: function() {
            this.simulation.setPhase(PhaseStateChanger.SOLID);
        },

        makeLiquid: function() {
            this.simulation.setPhase(PhaseStateChanger.LIQUID);
        },

        makeGas: function() {
            this.simulation.setPhase(PhaseStateChanger.GAS);
        }

    });

    return SolidLiquidGasSimView;
});

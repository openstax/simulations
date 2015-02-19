define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var SOMSimView = require('views/sim');

    var Constants = require('constants');

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

        renderScaffolding: function() {
            SOMSimView.prototype.renderScaffolding.apply(this);

            this.$('.side-panel').append(phaseChangeButtons);
        }

    });

    return SolidLiquidGasSimView;
});

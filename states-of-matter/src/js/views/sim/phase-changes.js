define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var SOMSimView = require('views/sim');

    var Constants = require('constants');


    var PhaseChangesSimView = SOMSimView.extend({

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Solid, Liquid, Gass',
                name: 'solid-liquid-gas-sim',
            }, options);

            SOMSimView.prototype.initialize.apply(this, [options]);

            this.initSceneView();
        }

    });

    return PhaseChangesSimView;
});

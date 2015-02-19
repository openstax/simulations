define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var SOMSimView = require('views/sim');

    var Constants = require('constants');

    var phaseDiagram = require('text!templates/phase-diagram.html');


    var PhaseChangesSimView = SOMSimView.extend({

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Phase Changes',
                name: 'phase-changes-sim',
            }, options);

            SOMSimView.prototype.initialize.apply(this, [options]);

            this.initSceneView();
        },

        renderScaffolding: function() {
            SOMSimView.prototype.renderScaffolding.apply(this);

            this.$('.side-panel').append(phaseDiagram);
        }

    });

    return PhaseChangesSimView;
});

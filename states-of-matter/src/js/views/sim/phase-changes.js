define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var SOMSimView            = require('views/sim');
    var PhaseChangesSceneView = require('views/scene/phase-changes');

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

        /**
         * Renders page content. Should be overriden by child classes
         */
        renderScaffolding: function() {
            SOMSimView.prototype.renderScaffolding.apply(this);

            this.$('.side-panel').append(phaseDiagram);
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new PhaseChangesSceneView({
                simulation: this.simulation
            });
        },

    });

    return PhaseChangesSimView;
});

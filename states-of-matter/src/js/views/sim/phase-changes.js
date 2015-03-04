define(function (require) {

    'use strict';

    var _ = require('underscore');

    var SOMSimView            = require('views/sim');
    var PhaseChangesSceneView = require('views/scene/phase-changes');
    var PhaseDiagramView      = require('views/phase-diagram');

    var phaseDiagramHtml = require('text!templates/phase-diagram.html');


    var PhaseChangesSimView = SOMSimView.extend({

        events: _.extend(SOMSimView.prototype.events, {
            'click .btn-show-phase-diagram' : 'showPhaseDiagram'
        }),

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

            this.phaseDiagramView = new PhaseDiagramView();
            this.phaseDiagramView.render();

            this.$('.side-panel').append(phaseDiagramHtml);
            this.$phaseDiagramPanel = this.$('.phase-diagram-panel');
            this.$phaseDiagramPanel.append(this.phaseDiagramView.el);
            //this.$phaseDiagramPanel.hide();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new PhaseChangesSceneView({
                simulation: this.simulation
            });
        },

        /**
         * Called after every component on the page has rendered to make sure
         *   things like widths and heights and offsets are correct.
         */
        postRender: function() {
            SOMSimView.prototype.postRender.apply(this);

            this.phaseDiagramView.postRender();
        },

        showPhaseDiagram: function() {
            this.$phaseDiagramPanel.show();
        }

    });

    return PhaseChangesSimView;
});

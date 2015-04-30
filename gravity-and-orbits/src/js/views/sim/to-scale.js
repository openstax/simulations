define(function(require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var GOSimulation = require('models/simulation');
    var GOSimView    = require('views/sim');

    var Scenarios = require('scenarios');

    var advancedVisibilityControlsHtml = require('text!templates/advanced-visibility-controls.html');

    /**
     *
     */
    var ToScaleSimView = GOSimView.extend({

        advancedVisibilityControlsTemplate: _.template(advancedVisibilityControlsHtml),

        events: _.extend(GOSimView.prototype.events, {
            'click .mass-check'           : 'toggleMassLabels',
            'click .measuring-tape-check' : 'toggleMeasuringTape',
        }),

        initialize: function(options) {
            options = _.extend({
                title: 'Actual Scale',
                name:  'to-scale'
            }, options);
            
            GOSimView.prototype.initialize.apply(this, [ options ]);
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new GOSimulation({
                scenario: Scenarios.ToScale[0]
            });
        },

        getScenarios: function() {
            return Scenarios.ToScale;
        },

        renderScaffolding: function() {
            GOSimView.prototype.renderScaffolding.apply(this);

            var data = {
                name: this.name
            };
            this.$('.visibility-controls').append(this.advancedVisibilityControlsTemplate(data));
        },

        toggleMassLabels: function(event) {
            if ($(event.target).is(':checked'))
                this.sceneView.showMassLabels();
            else
                this.sceneView.hideMassLabels();
        },

        toggleMeasuringTape: function(event) {
            // if ($(event.target).is(':checked'))
            //     this.sceneView.showMassLabels();
            // else
            //     this.sceneView.hideMassLabels();
        }

    });

    return ToScaleSimView;
});

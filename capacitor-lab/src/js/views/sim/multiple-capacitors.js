define(function (require) {

    'use strict';

    var MultipleCapacitorsSimulation = require('models/simulation/multiple-capacitors');

    var CapacitorLabSimView         = require('views/sim');
    var MultipleCapacitorsSceneView = require('views/scene/multiple-capacitors');

    var Constants = require('constants');

    var metersHtml   = require('text!templates/meters-multiple-capacitors.html');
    var circuitsHtml = require('text!templates/circuits.html');

    /**
     * 
     */
    var MultipleCapacitorsSimView = CapacitorLabSimView.extend({

        /**
         * Templates
         */
        circuitsTemplate: _.template(circuitsHtml),
        metersTemplate:   _.template(metersHtml), // Replacing with with a customized template for this sim view

        /**
         * Dom event listeners
         */
        events: _.extend({}, CapacitorLabSimView.prototype.events, {
            'click input[name="circuit"]' : 'changeCircuit',

            'click .meters-panel   > h2' : 'toggleMetersPanel',
            'click .circuits-panel > h2' : 'toggleCircuitsPanel'
        }),

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Multiple Capacitors',
                name: 'multiple-capacitors',
            }, options);

            CapacitorLabSimView.prototype.initialize.apply(this, [options]);
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new MultipleCapacitorsSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new MultipleCapacitorsSceneView({
                simulation: this.simulation
            });
        },

        /**
         * Renders page content
         */
        renderScaffolding: function() {
            CapacitorLabSimView.prototype.renderScaffolding.apply(this, arguments);

            var data = {
                Constants: Constants,
                unique: this.cid,
                circuitLabels: this.simulation.circuitLabels
            };

            this.$('.sim-controls-wrapper').append(this.circuitsTemplate(data));

            // Hide the meters panel by default for small screens
            this.$('.meters-panel').addClass('collapsed');
        },

        changeCircuit: function(event) {
            var index = parseInt(this.$('input[name="circuit"]:checked').val());
            this.simulation.set('currentCircuitIndex', index);
        },

        toggleMetersPanel: function(event) {
            this.$('.meters-panel').toggleClass('collapsed');
            this.$('.circuits-panel').toggleClass('collapsed');
        },

        toggleCircuitsPanel: function(event) {
            this.$('.meters-panel').toggleClass('collapsed');
            this.$('.circuits-panel').toggleClass('collapsed');
        }

    });

    return MultipleCapacitorsSimView;
});

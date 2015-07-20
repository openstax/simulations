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

            var tempCircuitScenarios = [{
                label: 'Single',
                config: {}
            }, {
                label: '2 in Series',
                config: {}
            }, {
                label: '3 in Series',
                config: {}
            }, {
                label: '2 in Parallel',
                config: {}
            }, {
                label: '3 in Parallel',
                config: {}
            }, {
                label: '2 in Series + 1 in Parallel',
                config: {}
            }, {
                label: '2 in Parallel + 1 in Series',
                config: {}
            }];

            var data = {
                Constants: Constants,
                unique: this.cid,
                circuitScenarios: tempCircuitScenarios
            };

            this.$('.sim-controls-group-2').append(this.circuitsTemplate(data));
        }

    });

    return MultipleCapacitorsSimView;
});

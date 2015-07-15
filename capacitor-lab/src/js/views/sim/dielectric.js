define(function (require) {

    'use strict';

    var CapacitorLabSimView = require('views/sim');
    var DielectricSceneView = require('views/scene/dielectric');
    
    var DielectricSimulation = require('models/simulation/dielectric');

    var Constants = require('constants');

    var dielectricHtml = require('text!templates/dielectric.html');

    /**
     * 
     */
    var DielectricSimView = CapacitorLabSimView.extend({

        /**
         * Templates
         */
        dielectricTemplate: _.template(dielectricHtml),

        /**
         * Dom event listeners
         */
        events: _.extend({}, CapacitorLabSimView.prototype.events, {
            'slide .dielectric-constant-slider' : 'changeDielectricConstant',
        }),

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Dielectric',
                name: 'dielectric',
            }, options);

            CapacitorLabSimView.prototype.initialize.apply(this, [options]);
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new DielectricSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new DielectricSceneView({
                simulation: this.simulation
            });
        },

        /**
         * Renders page content
         */
        renderScaffolding: function() {
            CapacitorLabSimView.prototype.renderScaffolding.apply(this, arguments);

            // var tempMaterialsList = [{
            //     label: 'Custom',
            //     config: {}
            // }, {
            //     label: 'Teflon (2.1)',
            //     config: {}
            // }, {
            //     label: 'Paper (3.5)',
            //     config: {}
            // }, {
            //     label: 'Glass (4.7)',
            //     config: {}
            // }];

            var materials = _.map(this.simulation.dielectricMaterials, function(material) {
                return material.get('name') + ' (' + material.get('dielectricConstant').toFixed(1) + ')';
            });

            var data = {
                Constants: Constants,
                unique: this.cid,
                materials: materials
            };

            this.$('.sim-controls-group-2').append(this.dielectricTemplate(data));

            // Turn basic select into a nice one
            this.$('select').selectpicker();

            this.$('.dielectric-constant-slider').noUiSlider({
                start: 5,
                connect: 'lower',
                range: {
                    'min': 1,
                    'max': 5
                }
            });

            this.$dielectricConstant = this.$('.dielectric-constant-value');
        },

        changeDielectricConstant: function(event) {
            var dielectricConstant = parseFloat($(event.target).val());
            this.inputLock(function() {
                this.$dielectricConstant.text(dielectricConstant.toFixed(2));
                this.simulation.set('dielectricConstant', dielectricConstant);
            });
        }

    });

    return DielectricSimView;
});

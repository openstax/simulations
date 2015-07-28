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
            'change .dielectric-material'       : 'changeDielectricMaterial',
            
            'click #hide-all-charges'    : 'hideAllCharges',
            'click #show-all-charges'    : 'showAllCharges',
            'click #show-excess-charges' : 'showExcessCharges',

            'click .meters-panel       > h2' : 'toggleMetersPanel',
            'click .dielectric-options > h2' : 'toggleDielectricPanel'
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

            var materials = _.map(this.simulation.dielectricMaterials, function(material) {
                return material.get('name') + ' (' + material.get('dielectricConstant').toFixed(1) + ')';
            });

            var data = {
                Constants: Constants,
                unique: this.cid,
                materials: materials
            };

            this.$('.sim-controls-wrapper').append(this.dielectricTemplate(data));

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

            // Hide the meters panel by default for small screens
            this.$('.meters-panel').addClass('collapsed');

            this.$dielectricConstant = this.$('.dielectric-constant-value');
        },

        /**
         * Performs the actual resetting on everything
         */
        resetComponents: function() {
            CapacitorLabSimView.prototype.resetComponents.apply(this, arguments);

            this.$('.dielectric-material')
                .val(0)
                .selectpicker('refresh');

            this.$('#show-all-charges').click();

            var value = this.simulation.dielectricMaterials[0].get('dielectricConstant');
            this.$('.dielectric-constant-slider').val(value);
            this.$dielectricConstant.text(value.toFixed(2));
        },

        changeDielectricConstant: function(event) {
            var dielectricConstant = parseFloat($(event.target).val());
            this.inputLock(function() {
                this.$dielectricConstant.text(dielectricConstant.toFixed(2));
                this.simulation.customMaterial.set('dielectricConstant', dielectricConstant);
            });
        },

        changeDielectricMaterial: function(event){
            var index = parseInt($(event.target).val());

            // Set the selected projectile on the simulation
            this.simulation.circuit.capacitor.set('dielectricMaterial', this.simulation.dielectricMaterials[index]);

            // If it's the custom material, enable the slider
            if (this.simulation.circuit.capacitor.get('dielectricMaterial') === this.simulation.customMaterial)
                this.$('.dielectric-constant-slider').removeAttr('disabled');
            else
                this.$('.dielectric-constant-slider').attr('disabled', 'disabled');

            // Set the slider default value
            var value = this.simulation.dielectricMaterials[index].get('dielectricConstant');
            this.$('.dielectric-constant-slider').val(value);
            this.$dielectricConstant.text(value.toFixed(2));
        },

        toggleMetersPanel: function(event) {
            this.$('.meters-panel').toggleClass('collapsed');
            this.$('.dielectric-options').toggleClass('collapsed');
        },

        toggleDielectricPanel: function(event) {
            this.$('.meters-panel').toggleClass('collapsed');
            this.$('.dielectric-options').toggleClass('collapsed');
        },

        hideAllCharges: function() {
            this.sceneView.hideExcessDielectricCharges();
            this.sceneView.hideTotalDielectricCharges();
        },

        showAllCharges: function() {
            this.sceneView.hideExcessDielectricCharges();
            this.sceneView.showTotalDielectricCharges();
        },

        showExcessCharges: function() {
            this.sceneView.showExcessDielectricCharges();
            this.sceneView.hideTotalDielectricCharges();
        }

    });

    return DielectricSimView;
});

define(function(require) {

    'use strict';

    var $        = require('jquery');
    var _        = require('underscore');
    var Backbone = require('backbone'); Backbone.$ = $;

    var WavelengthSliderView = require('common/controls/wavelength-slider');

    var Constants = require('constants');

    var defineInputUpdateLocks = require('common/locks/define-locks');

    var html = require('text!../../templates/prism-break-controls.html');

    require('less!styles/prism-break-controls');

    /**
     * 
     */
    var PrismBreakControls = Backbone.View.extend({

        template: _.template(html),

        events: {
            'click #color-type-one'   : 'colorOneClicked',
            'click #color-type-white' : 'colorWhiteClicked',

            'slide .slider' : 'changeWavelength',

            'click #ray-count-single'   : 'rayCountSingleClicked',
            'click #ray-count-multiple' : 'rayCountMultipleClicked',

            'click #show-reflections-check' : 'toggleReflections',
            'click #show-normals-check'     : 'toggleNormals',
            'click #show-protractor-check'  : 'toggleProtractor'
        },

        initialize: function(options) {
            this.simulation = options.simulation;
            this.laser = this.simulation.laser;
            this.sceneView = options.sceneView;

            this.initWavelengthSliderView();
        },

        initWavelengthSliderView: function() {
            this.wavelengthSliderView = new WavelengthSliderView({
                defaultWavelength: this.laser.get('wavelength') * 1E9, // Convert between SI and nanometers
                minWavelength: Constants.MIN_WAVELENGTH,
                maxWavelength: Constants.MAX_WAVELENGTH
            });
        },

        /**
         * Renders content and canvas for heatmap
         */
        render: function() {
            var data = {
                
            };

            this.setElement($(this.template(data)));

            this.wavelengthSliderView.render();
            this.$('.wavelength-slider-wrapper').append(this.wavelengthSliderView.el);

            this.$value = this.$('.wavelength-value');

            return this;
        },

        postRender: function() {
            this.wavelengthSliderView.postRender();
        },

        changeWavelength: function(event) {
            this.inputLock(function() {
                var wavelength = parseInt($(event.target).val());
                this.$value.text(wavelength + 'nm');
                this.setSimulationWavelength(wavelength);
            });
        },

        colorOneClicked: function(event) {
            this.wavelengthSliderView.enable();
            this.$('.wavelength-selection-wrapper').removeClass('disabled');
            this.setSimulationWavelength(this.$('.slider').val());
        },

        colorWhiteClicked: function(event) {
            this.wavelengthSliderView.disable();
            this.$('.wavelength-selection-wrapper').addClass('disabled');
            this.simulation.set('wavelength', Constants.WHITE_LIGHT);
        },

        setSimulationWavelength: function(sliderWavelength) {
            this.simulation.set('wavelength', sliderWavelength / Constants.METERS_TO_NANOMETERS);
        },

        rayCountSingleClicked: function(event) {
            this.simulation.set('manyRays', false);
        },

        rayCountMultipleClicked: function(event) {
            this.simulation.set('manyRays', true);
        },

        toggleReflections: function(event) {
            if ($(event.target).is(':checked'))
                this.simulation.set('showReflections', true);
            else
                this.simulation.set('showReflections', false);
        },

        toggleNormals: function(event) {
            if ($(event.target).is(':checked'))
                this.sceneView.showIntersectionNormals();
            else
                this.sceneView.hideIntersectionNormals();
        },

        toggleProtractor: function(event) {
            if ($(event.target).is(':checked'))
                this.sceneView.showProtractor();
            else
                this.sceneView.hideProtractor();
        }

    });


    // Add input/update locking functionality to the prototype
    defineInputUpdateLocks(PrismBreakControls);
    

    return PrismBreakControls;
});
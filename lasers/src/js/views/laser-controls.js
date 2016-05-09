define(function(require) {

    'use strict';

    var $        = require('jquery');
    var _        = require('underscore');
    var Backbone = require('backbone'); Backbone.$ = $;

    var Constants = require('constants');

    var WavelengthSliderView   = require('common/controls/wavelength-slider');
    var QuantumConfig          = require('common/quantum/config');
    var defineInputUpdateLocks = require('common/locks/define-locks');

    var html = require('text!templates/laser-controls.html');
    
    require('less!styles/laser-controls');

    /**
     * 
     */
    var LaserControlsView = Backbone.View.extend({

        className: 'sim-controls beam-controls',

        template: _.template(html),

        events: {
            'slide .wavelength-slider' : 'changeWavelength',
            'slide .intensity-slider'  : 'changeIntensity'
        },

        initialize: function(options) {
            options = _.extend({
                number: ''
            }, options);
            
            this.number = options.number;
            
            this.wavelengthSliderView = new WavelengthSliderView({
                defaultWavelength: this.model.get('wavelength'),
                minWavelength: QuantumConfig.MIN_WAVELENGTH,
                maxWavelength: QuantumConfig.MAX_WAVELENGTH
            });
        },

        reset: function() {
            this.updateLock(function() {
                
            });
        },

        /**
         * Renders content and canvas for heatmap
         */
        render: function() {
            // Render the base template
            this.$el.append(this.template({
                unique: this.cid,
                number: this.number
            }));

            // Add a class to help position it
            if (this.number)
                this.$el.addClass('laser-' + this.number);

            // Create the intensity slider
            this.$('.intensity-slider').noUiSlider({
                start: this.model.get('photonsPerSecond'),
                range: {
                    min: 0,
                    max: this.model.get('maxPhotonsPerSecond')
                },
                connect: 'lower'
            });
            
            // Create the wavelength slider
            this.wavelengthSliderView.render();
            this.$('.wavelength-slider-wrapper').prepend(this.wavelengthSliderView.el);

            // Save the label elements for each slider header
            this.$intensityValue = this.$('.intensity-value');
            this.$wavelengthValue = this.$('.wavelength-value');

            // Set default values
            this.updateIntensityLabel(this.model.get('photonsPerSecond'));

            return this;
        },

        postRender: function() {
            this.wavelengthSliderView.postRender();
        },

        changeWavelength: function(event) {
            this.inputLock(function() {
                var wavelength = parseInt($(event.target).val());
                this.$wavelengthValue.text(wavelength + 'nm');
                this.model.set('wavelength', wavelength);
            });
        },

        changeIntensity: function(event) {
            this.inputLock(function() {
                var photonsPerSecond = parseInt(this.$('.intensity-slider').val());
                this.updateIntensityLabel(photonsPerSecond);
                this.model.set('photonsPerSecond', photonsPerSecond);
            });
        },

        updateIntensityLabel: function(photonsPerSecond) {
            var percent = Math.round((photonsPerSecond / this.model.get('maxPhotonsPerSecond')) * 100);
            this.$intensityValue.text(percent + '%');
        },

        show: function() {
            this.$el.show();
        },

        hide: function() {
            this.$el.hide();
        }

    });


    // Add input/update locking functionality to the prototype
    defineInputUpdateLocks(LaserControlsView);
    

    return LaserControlsView;
});

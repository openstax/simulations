define(function(require) {

    'use strict';

    var $        = require('jquery');
    var _        = require('underscore');
    var Backbone = require('backbone'); Backbone.$ = $;

    var defineInputUpdateLocks = require('../locks/define-locks');
    var WavelengthColors = require('../colors/wavelength');
    
    require('nouislider');
    require('less!./wavelength-slider');

    /**
     * This is a wrapper view for a slider control for wavelengths.
     *   Give it the minimum wavelength (in nanometers) and maximum
     *   wavelength, and it will handle all the color rendering and
     *   updating.  Note that this view needs postRender to be
     *   called during the sim's postRender operation in order for
     *   it to show up with the right dimensions.
     */
    var WavelengthSliderView = Backbone.View.extend({

        /**
         * Root element properties
         */
        tagName:   'div',
        className: 'slider wavelength-slider',

        events: {
            'slide' : 'changeWavelength'
        },

        initialize: function(options) {
            options = _.extend({
                minWavelength: WavelengthColors.MIN_WAVELENGTH,
                maxWavelength: WavelengthColors.MAX_WAVELENGTH,
                defaultWavelength: Math.floor((WavelengthColors.MAX_WAVELENGTH - WavelengthColors.MIN_WAVELENGTH) / 2) + WavelengthColors.MIN_WAVELENGTH
            }, options);

            this.minWavelength = options.minWavelength;
            this.maxWavelength = options.maxWavelength;
            this.defaultWavelength = options.defaultWavelength;
        },

        /**
         * Renders content and canvas for heatmap
         */
        render: function() {
            this.$el.noUiSlider({
                start: this.defaultWavelength, // Convert between SI and nanometers
                range: {
                    min: this.minWavelength,
                    max: this.maxWavelength
                }
            });

            // Create a canvas background for the wavelength slider
            this.$wavelengthSliderCanvas = $('<canvas class="wavelength-slider-canvas">').prependTo(this.$el);

            // Need to add an element to the handle because it's difficult to modify the css for a pseudo-element.
            this.$wavelengthSliderHandle = $('<div class="handle-content">').appendTo(this.$el.find('.noUi-handle'));

            return this;
        },

        /**
         * Called after every component on the page has rendered to make sure
         *   things like widths and heights and offsets are correct.
         */
        postRender: function() {
            // Resize the wavelength slider canvas
            var height = 16;
            var width  = this.$el.width() + height;
            this.$wavelengthSliderCanvas[0].width  = width;
            this.$wavelengthSliderCanvas[0].height = height;
            this.$wavelengthSliderCanvas.width(width);

            // Set up canvas rendering
            this.ctx = this.$wavelengthSliderCanvas[0].getContext('2d');
            this.canvasWidth  = this.$wavelengthSliderCanvas.width();
            this.canvasHeight = this.$wavelengthSliderCanvas.height();

            // Paint the spectrum colors
            this.paintVisibleLightSpectrum();

            // Set the starting color
            this.$el.trigger('slide');
        },

        /**
         * Draws the visible light spectrum to a canvas.  Interpolates
         *   wavelength values from MIN_WAVELENGTH to MAX_WAVELENGTH
         *   across the width of the element just like PhET in their
         *   SSRWavelengthSlider class.
         */
        paintVisibleLightSpectrum: function() {
            var ctx = this.ctx;
            var width  = this.canvasWidth;
            var height = this.canvasHeight;
            var percentage;
            var wavelength;
            var color;

            for (var i = 0; i < width; i++) {
                // Perform linear interpolation
                percentage = i / width;
                wavelength = this.minWavelength * (1 - percentage) + this.maxWavelength * percentage;

                // Convert wavelength to rgb and apply to fill style
                color = WavelengthColors.nmToHex(wavelength);
                ctx.fillStyle = color;
                ctx.fillRect(i, 0, 1, height);
            }
        },

        /**
         * Handles wavelength slider slide events
         */
        changeWavelength: function(event) {
            var wavelength = parseInt($(event.target).val());
            var color = WavelengthColors.nmToHex(wavelength);

            this.$wavelengthSliderHandle.css('background-color', color);
        },

        disable: function() {
            this.$el.attr('disabled', 'disabled');
        },

        enable: function() {
            this.$el.removeAttr('disabled');
        }

    });


    // Add input/update locking functionality to the prototype
    defineInputUpdateLocks(WavelengthSliderView);
    

    return WavelengthSliderView;
});

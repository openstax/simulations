define(function(require) {

    'use strict';

    var WavelengthSliderView = require('common/controls/wavelength-slider');

    var THUMB_HIGHLIGHT_THRESHOLD = 3; // nm

    /**
     * 
     */
    var HydrogenAtomWavelengthSliderView = WavelengthSliderView.extend({

        initialize: function(options) {
            WavelengthSliderView.prototype.initialize.apply(this, arguments);
        },

        render: function() {
            WavelengthSliderView.prototype.render.apply(this, arguments);

            // Add another canvas as the sibling of the spectrum canvas
            var canvas = document.createElement('canvas');
            this.$wavelengthSliderCanvas.parent().append(canvas);
            this.absorptionWavelengthsCanvas = canvas;
            this.$absorptionWavelengthsCanvas = $(canvas);
        },

        postRender: function() {
            WavelengthSliderView.prototype.postRender.apply(this, arguments);

            var wavelengthCanvas = this.$wavelengthSliderCanvas[0];
            var canvas = this.absorptionWavelengthsCanvas;
            canvas.width = wavelengthCanvas.width;
            canvas.height = wavelengthCanvas.height;
            canvas.style.width = wavelengthCanvas.clientWidth + 'px';
            canvas.style.height = wavelengthCanvas.clientHeight + 'px';
            canvas.style.position = 'absolute';
            canvas.style.top = '-7px';
            canvas.style.left = '-7px';
            canvas.style.borderRadius = '8px';
        },

        setTransitionWavelengths: function(transitionWavelengths) {
            this.transitionWavelengths = transitionWavelengths;
            this.drawTransitionWavelengths();
            this.updateColor();
        },

        drawTransitionWavelengths: function() {
            var canvas = this.absorptionWavelengthsCanvas;
            var ctx = canvas.getContext('2d');
            var wavelengths = this.transitionWavelengths;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (wavelengths) {
                var offset = 7;
                var minWavelength = this.minWavelength;
                var maxWavelength = this.maxWavelength;
                var width = canvas.width - offset * 2;
                var height = canvas.height;

                for (var i = 0; i < wavelengths.length; i++) {
                    var wavelength = wavelengths[i];
                    var x = offset + (width * (wavelength - minWavelength) / (maxWavelength - minWavelength));
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, height);
                }

                ctx.lineWidth = 1;
                ctx.strokeStyle = '#fff';
                ctx.stroke();
            }
        },

        updateColor: function() {
            var match = this.getTransitionWavelengthMatch(this.val());
            if (match && this._absorptionWavelengthsVisible)
                this.$wavelengthSliderHandle.css('background-color', '#fff');    
            else
                WavelengthSliderView.prototype.updateColor.apply(this, arguments);
        },

        getTransitionWavelengthMatch: function(wavelength) {
            var bestMatch = null;
            var difference = 0;
            var prevDifference = 1000000000;
            var wavelengths = this.transitionWavelengths;

            // Find the best match for the current wavelength
            if (wavelengths && wavelengths.length !== 0) {
                for (var i = 0; i < wavelengths.length; i++) {
                    if (this.isClose(wavelength, wavelengths[i])) {
                        difference = Math.abs(wavelengths[i] - wavelength);
                        if (difference < prevDifference) {
                            prevDifference = difference;
                            bestMatch = wavelengths[i];
                        }
                    }
                }
            }

            return bestMatch;
        },

        /*
         * Determines whether some wavelength is sufficiently 
         *   close to some transition wavelength.
         */
        isClose: function(wavelength, transitionWavelength) {
            var min = transitionWavelength - THUMB_HIGHLIGHT_THRESHOLD;
            var max = transitionWavelength + THUMB_HIGHLIGHT_THRESHOLD;
            return ((wavelength >= min) && (wavelength <= max));
        },

        showAbsorptionWavelengths: function() {
            this.$absorptionWavelengthsCanvas.show();
            this._absorptionWavelengthsVisible = true;
            this.updateColor();
        },

        hideAbsorptionWavelengths: function() {
            this.$absorptionWavelengthsCanvas.hide();
            this._absorptionWavelengthsVisible = false;
            this.updateColor();
        }

    });
    

    return HydrogenAtomWavelengthSliderView;
});

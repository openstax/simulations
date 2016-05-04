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
            
            this.simulation = options.simulation;
            
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
            var data = {
                unique: this.cid
            };

            this.$el.append(this.template(data));
            
            this.wavelengthSliderView.render();
            this.$('.wavelength-slider-wrapper').prepend(this.wavelengthSliderView.el);

            this.$wavelengthValue = this.$('.wavelength-value');

            return this;
        },

        postRender: function() {
            this.wavelengthSliderView.postRender();
        },

        changeWavelength: function(event) {
            this.inputLock(function() {
                var wavelength = parseInt($(event.target).val());
                this.$wavelengthValue.text(wavelength + 'nm');
                this.simulation.seedBeam.set('wavelength', wavelength);
            });
        },

        changeIntensity: function(event) {
            this.inputLock(function() {
                var value = parseInt(this.$('.intensity-slider').val());
                var percent = Math.round((value / this.simulation.seedBeam.get('maxPhotonsPerSecond')) * 100);
                var photonsPerSecond;
                // If we're in intensity mode, then the photons/sec is proportional to
                //   the energy of each photon
                if (this.simulation.get('controlMode') === PEffectSimulation.INTENSITY)
                    photonsPerSecond = this.simulation.intensityToPhotonRate(value, this.simulation.seedBeam.get('wavelength'));
                else
                    photonsPerSecond = value;

                this.$intensityValue.text(percent + '%');
                this.simulation.seedBeam.set('photonsPerSecond', photonsPerSecond);
            });
        }

    });


    // Add input/update locking functionality to the prototype
    defineInputUpdateLocks(LaserControlsView);
    

    return LaserControlsView;
});

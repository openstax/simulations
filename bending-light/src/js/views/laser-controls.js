define(function(require) {

    'use strict';

    var $        = require('jquery');
    var _        = require('underscore');
    var Backbone = require('backbone'); Backbone.$ = $;

    var Constants = require('constants');

    var WavelengthSliderView   = require('common/controls/wavelength-slider');
    var defineInputUpdateLocks = require('common/locks/define-locks');

    var html = require('text!../../templates/laser-controls.html');
    
    require('less!styles/laser-controls');

    /**
     * 
     */
    var LaserControlsView = Backbone.View.extend({

        template: _.template(html),

        events: {
            'click .ray'    : 'rayClicked',
            'click .wave'   : 'waveClicked',
            'slide .slider' : 'changeWavelength'
        },

        initialize: function(options) {
            this.showWavelengthControls = options.showWavelengthControls;
            this.simulation = options.simulation;
            
            this.wavelengthSliderView = new WavelengthSliderView({
                defaultWavelength: this.model.get('wavelength') * 1E9, // Convert between SI and nanometers
                minWavelength: Constants.MIN_WAVELENGTH,
                maxWavelength: Constants.MAX_WAVELENGTH
            });
        },

        reset: function() {
            if (this.model.get('wave'))
                this.$('.wave').click();
            else
                this.$('.ray').click();

            this.updateLock(function() {
                this.wavelengthSliderView.reset();
                this.$value.text(parseInt(this.wavelengthSliderView.val()) + 'nm');
            });
        },

        /**
         * Renders content and canvas for heatmap
         */
        render: function() {
            var data = {
                showWavelengthControls: this.showWavelengthControls,
                unique: this.cid
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
                this.simulation.set('wavelength', wavelength / Constants.METERS_TO_NANOMETERS);
            });
        },

        rayClicked: function(event) {
            this.model.set('wave', false);
        },

        waveClicked: function(event) {
            this.model.set('wave', true);
        }

    });


    // Add input/update locking functionality to the prototype
    defineInputUpdateLocks(LaserControlsView);
    

    return LaserControlsView;
});

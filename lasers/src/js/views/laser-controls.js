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

        },

        initialize: function(options) {
            
            this.simulation = options.simulation;
            
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

            this.setElement($(this.template(data)));
            
            
            this.$value = this.$('.wavelength-value');

            return this;
        },

        postRender: function() {
            
        }

    });


    // Add input/update locking functionality to the prototype
    defineInputUpdateLocks(LaserControlsView);
    

    return LaserControlsView;
});

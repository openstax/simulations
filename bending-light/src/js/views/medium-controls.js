define(function(require) {

    'use strict';

    var $        = require('jquery');
    var _        = require('underscore');
    var Backbone = require('backbone'); Backbone.$ = $;

    var defineInputUpdateLocks = require('common/locks/define-locks');

    var html = require('text!../../templates/medium-controls.html');

    /**
     * 
     */
    var MediumControlsView = Backbone.View.extend({

        template: _.template(html),

        events: {
            'slide .slider' : 'changeIndexOfRefraction'
        },

        initialize: function(options) {
            this.name = options.name;


        },

        /**
         * Renders content and canvas for heatmap
         */
        render: function() {
            var data = {
                name: this.name,
                mediums: {}
            };

            this.$el.remove();
            this.setElement($(this.template(data)));
            
            this.$('.slider').noUiSlider({
                start: 0.5,
                range: {
                    'min': 0.01,
                    'max': 1
                }
            });

            this.$value = this.$('index-of-refraction-value');

            return this;
        },

        changeIndexOfRefraction: function(event) {
            var indexOfRefraction = parseFloat($(event.target).val());
            this.inputLock(function() {
                this.$value.text(indexOfRefraction.toFixed(2));
                
            });
        }

    });


    // Add input/update locking functionality to the prototype
    defineInputUpdateLocks(MediumControlsView);
    

    return MediumControlsView;
});

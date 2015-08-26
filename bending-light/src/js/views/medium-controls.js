define(function(require) {

    'use strict';

    var $        = require('jquery');
    var _        = require('underscore');
    var Backbone = require('backbone'); Backbone.$ = $;

    var MediumPropertiesPresets = require('medium-properties-presets');
    var Constants = require('constants');

    var defineInputUpdateLocks = require('common/locks/define-locks');

    var html = require('text!../../templates/medium-controls.html');

    /**
     * 
     */
    var MediumControlsView = Backbone.View.extend({

        template: _.template(html),

        events: {
            'slide  .slider' : 'changeIndexOfRefraction',
            'change .select' : 'changeMaterial'
        },

        initialize: function(options) {
            this.name = options.name;
            
            this.listenTo(this.model, 'change:mediumProperties', this.materialChanged);
        },

        /**
         * Renders content and canvas for heatmap
         */
        render: function() {
            var data = {
                name: this.name,
                mediums: _.map(MediumPropertiesPresets, function(preset, key) {
                    return {
                        name: preset.name,
                        key: key
                    };
                })
            };

            this.$el.remove();
            this.setElement($(this.template(data)));
            
            this.$('.slider').noUiSlider({
                start: 0.5,
                range: {
                    min: Constants.MIN_INDEX_OF_REFRACTION,
                    max: Constants.MAX_INDEX_OF_REFRACTION
                }
            });

            this.$value = this.$('.index-of-refraction-value');

            this.$('select').selectpicker();

            return this;
        },

        changeIndexOfRefraction: function(event) {
            var indexOfRefraction = parseFloat($(event.target).val());
            this.inputLock(function() {
                this.$value.text(indexOfRefraction.toFixed(2));
            });
        },

        changeMaterial: function(event) {
            var key = $(event.target).val();
            this.inputLock(function() {
                this.model.set('mediumProperties', MediumPropertiesPresets[key]);
            });
        },

        materialChanged: function(medium, mediumProperties) {
            
            this.updateLock(function() {
                // Select one with matching name
            });
        }

    });


    // Add input/update locking functionality to the prototype
    defineInputUpdateLocks(MediumControlsView);
    

    return MediumControlsView;
});

define(function(require) {

    'use strict';

    var $        = require('jquery');
    var _        = require('underscore');
    var Backbone = require('backbone'); Backbone.$ = $;

    var MediumPropertiesPresets = require('medium-properties-presets');
    var Constants = require('constants');

    var defineInputUpdateLocks = require('common/locks/define-locks');

    var html = require('text!../../templates/medium-controls.html');
    
    require('less!styles/medium-controls');

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
            this.simulation = options.simulation;
            
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
            
            this.$slider = this.$('.slider');
            this.$slider.noUiSlider({
                start: 0.5,
                range: {
                    min: Constants.MIN_INDEX_OF_REFRACTION,
                    max: Constants.MAX_INDEX_OF_REFRACTION
                }
            });

            this.$noMystery = this.$('.no-mystery');
            this.$mystery   = this.$('.mystery');
            this.$value     = this.$('.index-of-refraction-value');

            this.$('select').selectpicker();

            this.materialChanged(this.model, this.model.get('mediumProperties'));

            return this;
        },

        changeIndexOfRefraction: function(event) {
            // If this is happening inside the input lock, we know the user is sliding
            //   it, and that means the medium material is now "custom"
            var indexOfRefraction = parseFloat($(event.target).val());
            MediumPropertiesPresets.CUSTOM.setIndexOfRefraction(indexOfRefraction);
            MediumPropertiesPresets.CUSTOM.setReferenceWavelength(this.simulation.get('wavelength'));
            this.model.set('mediumProperties', MediumPropertiesPresets.CUSTOM);
            this.model.updateColor();
            this.model.trigger('change');

            this.$value.text(indexOfRefraction.toFixed(2));

            this.inputLock(function() {

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
                var selectedKey;
                _.each(MediumPropertiesPresets, function(preset, key) {
                    if (preset === mediumProperties) {
                        selectedKey = key;
                        return false;
                    }
                });
                this.$('select')
                    .val(selectedKey)
                    .selectpicker('refresh');
            });

            if (mediumProperties.mystery) {
                this.$noMystery.hide();
                this.$mystery.show();
            }
            else {
                this.$mystery.hide();
                this.$noMystery.show();
                var indexOfRefraction = mediumProperties.getIndexOfRefractionForRedLight();
                this.$slider.val(indexOfRefraction);
                this.$value.text(indexOfRefraction.toFixed(2));    
            }
        }

    });


    // Add input/update locking functionality to the prototype
    defineInputUpdateLocks(MediumControlsView);
    

    return MediumControlsView;
});

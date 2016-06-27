define(function(require) {

    'use strict';

    var _        = require('underscore');
    var $        = require('jquery');
    var Backbone = require('backbone');

    var defineInputUpdateLocks = require('common/locks/define-locks');
    var Vector2                = require('common/math/vector2');
    var range                  = require('common/math/range');

    var Assets = require('assets');

    require('nouislider');

    var templateHtml = require('text!templates/body-settings-item.html');

    /**
     * 
     */
    var BodySettingsView = Backbone.View.extend({

        tagName: 'tr',
        className: 'body-settings-view',
        template: _.template(templateHtml),

        events: {
            'slide .mass-slider': 'changeMass',
        },

        initialize: function(options) {
            this.simulation = options.simulation;

            this._position = new Vector2();

            this.listenTo(this.model, 'change:mass', this.massChanged);
        },

        /**
         * Renders content and canvas for heatmap
         */
        render: function() {
            var data = this.model.toJSON();
            data.src = Assets.ImageFromModel(this.model);
            data.Assets = Assets;

            this.$el.html(this.template(data));

            var massRange = range({ min: this.model.get('minMass'), max: this.model.get('maxMass') });
            var referenceMassPercent = massRange.percent(this.model.get('referenceMass')) * 100 + '%';

            var sliderRange = {
                'min': this.model.get('minMass'),
                'max': this.model.get('maxMass')
            };
            sliderRange[referenceMassPercent] = this.model.get('referenceMass');

            this.$('.mass-slider').noUiSlider({
                start: this.model.get('mass'),
                connect: 'lower',
                range: sliderRange
            });

            return this;
        },

        massChanged: function(ball, mass) {
            this.updateLock(function() {
                if (this.moreDataMode)
                    this.$('.mass').val(mass.toFixed(2));
                else
                    this.$('.mass').val(mass.toFixed(1));
                this.$('.mass-slider').val(mass);
            });
        },

        changeMass: function(event) {
            var mass = parseFloat($(event.target).val());
            if (!isNaN(mass)) {
                this.inputLock(function() {
                    this.model.set('mass', mass);
                    if (this.simulation.get('paused'))
                        this.simulation.updateForceVectors();
                });
            }
        }

    });

    // Add input/update locking functionality to the prototype
    defineInputUpdateLocks(BodySettingsView);

    return BodySettingsView;
});

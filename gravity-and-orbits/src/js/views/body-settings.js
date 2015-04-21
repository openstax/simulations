define(function(require) {

    'use strict';

    var $        = require('jquery');
    var _        = require('underscore');
    var Backbone = require('backbone'); Backbone.$ = $;

    var defineInputUpdateLocks = require('common/locks/define-locks');
    var Vector2 = require('common/math/vector2');

    var Constants = require('constants');

    require('nouislider');

    var templateHtml = require('text!templates/body-settings-item.html');

    /**
     * 
     */
    var BodySettingsView = Backbone.View.extend({

        tagName: 'div',
        className: 'body-settings-view',
        template: _.template(templateHtml),

        events: {
            'slide .mass-slider': 'changeMassFromSlider',
        },

        initialize: function(options) {
            options = _.extend({

            }, options);

            this.simulation = options.simulation;

            this._position = new Vector2();

            this.listenTo(this.model, 'change:mass', this.massChanged);
        },

        /**
         * Renders content and canvas for heatmap
         */
        render: function() {
            var data = this.model.toJSON();
            _.extend(data, Constants.Body);

            this.$el.html(this.template(data));

            this.$('.mass-slider').noUiSlider({
                start: this.model.get('mass'),
                connect: 'lower',
                range: {
                    'min': Constants.Body.MIN_MASS,
                    'max': Constants.Body.MAX_MASS
                }
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
                });
            }
        }

    });

    // Add input/update locking functionality to the prototype
    defineInputUpdateLocks(BodySettingsView);

    return BodySettingsView;
});

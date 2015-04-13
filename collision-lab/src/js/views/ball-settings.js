define(function(require) {

    'use strict';

    var $        = require('jquery');
    var _        = require('underscore');
    var Backbone = require('backbone'); Backbone.$ = $;

    var defineInputUpdateLocks = require('common/locks/define-locks');

    var Constants = require('constants');

    require('nouislider');

    var template1DHtml = require('text!templates/ball-settings-1d-item.html');
    var template2DHtml = require('text!templates/ball-settings-2d-item.html');

    /**
     * 
     */
    var BallSettingsView = Backbone.View.extend({

        tagName: 'tr',
        //className: '',
        template1D: _.template(template1DHtml),
        template2D: _.template(template2DHtml),

        events: {
            'keyup .mass' : 'changeMassFromText',
            'slide .mass-slider': 'changeMassFromSlider'
        },

        initialize: function(options) {
            options = _.extend({
                oneDimensional: false,
                showMoreData: false
            }, options);

            this.oneDimensional = options.oneDimensional;
            this.moreDataMode = options.showMoreData;

            this.listenTo(this.model, 'change:mass', this.massChanged);
        },

        /**
         * Renders content and canvas for heatmap
         */
        render: function() {
            var data = this.model.toJSON();
            _.extend(data, Constants.Ball);

            if (this.oneDimensional)
                this.$el.html(this.template1D(data));
            else
                this.$el.html(this.template2D(data));

            this.$more = this.$('.more');
            this.$less = this.$('.less');

            this.$('.mass-slider').noUiSlider({
                start: this.model.get('mass'),
                connect: 'lower',
                range: {
                    'min': Constants.Ball.MIN_MASS,
                    'max': Constants.Ball.MAX_MASS
                }
            });

            if (this.moreDataMode)
                this.showMoreData();
            else
                this.showLessData();

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

        changeMassFromText: function(event) {
            var mass = parseFloat($(event.target).val());
            if (!isNaN(mass)) {
                this.inputLock(function() {
                    this.model.set('mass', mass);
                });
                this.$('.mass-slider').val(mass);
            }
        },

        changeMassFromSlider: function(event) {
            var mass = parseFloat($(event.target).val());
            if (!isNaN(mass)) {
                this.inputLock(function() {
                    this.model.set('mass', mass);
                });
                this.$('.mass').val(mass.toFixed(1));
            }
        },

        showMoreData: function() {
            this.$less.hide();
            this.$more.show();
            this.moreDataMode = true;
            this.massChanged(this.model, this.model.get('mass'));
        },

        showLessData: function() {
            this.$more.hide();
            this.$less.show();
            this.moreDataMode = false;
            this.massChanged(this.model, this.model.get('mass'));
        }

    });

    // Add input/update locking functionality to the prototype
    defineInputUpdateLocks(BallSettingsView);

    return BallSettingsView;
});

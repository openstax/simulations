define(function(require) {

    'use strict';

    var $        = require('jquery');
    var _        = require('underscore');
    var Backbone = require('backbone'); Backbone.$ = $;

    var Constants = require('constants');

    require('nouislider');

    var templateHtml = require('text!templates/ball-settings-1d-item.html');

    /**
     * 
     */
    var BallSettingsView = Backbone.View.extend({

        tagName: 'tr',
        //className: '',
        template: _.template(templateHtml),

        events: {

        },

        initialize: function(options) {

            
        },

        /**
         * Renders content and canvas for heatmap
         */
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));

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

            this.showLessData();

            return this;
        },

        showMoreData: function() {
            this.$less.hide();
            this.$more.show();
        },

        showLessData: function() {
            this.$more.hide();
            this.$less.show();
        }

    });

    return BallSettingsView;
});

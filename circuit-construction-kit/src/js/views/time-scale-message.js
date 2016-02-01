define(function(require) {

    'use strict';

    var $        = require('jquery');
    var Backbone = require('backbone'); Backbone.$ = $;

    /**
     * 
     */
    var TimeScaleMessageView = Backbone.View.extend({

        className: 'time-scale-message-view',

        initialize: function(options) {
            this.simulation = options.simulation;
            this.electronsView = options.electronsView;

            this.$el.hide();
            this.visible = false;
        },

        /**
         * Renders content and canvas for heatmap
         */
        render: function() {
            return this;
        },

        update: function() {
            var percent = this.simulation.particleSet.propagator.getTimeScalingPercentPercent();
            if (percent < 95) {
                if (this.electronsView.visible()) {
                    var speed = (percent === 1) ? '< 1%' : percent + '%';
                    this.$el.html('Animation speed limit reached! Simulation speed reduced to ' + speed + ' normal!');
                    this.show();
                }
                else {
                    this.hide();
                }
            }
            else {
                this.hide();
            }
        },

        show: function() {
            if (!this.visible) {
                this.visible = true;
                this.$el.show();
            }
        },

        hide: function() {
            if (this.visible) {
                this.visible = false;
                this.$el.hide();
            }
        }

    });

    return TimeScaleMessageView;
});

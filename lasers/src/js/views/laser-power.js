define(function(require) {

    'use strict';

    var $        = require('jquery');
    var _        = require('underscore');
    var Backbone = require('backbone'); Backbone.$ = $;

    var Constants = require('constants');

    var html = require('text!templates/laser-power.html');
    
    require('less!styles/laser-power');

    /**
     * 
     */
    var LaserPowerView = Backbone.View.extend({

        className: 'sim-controls laser-power-panel',

        template: _.template(html),

        initialize: function(options) {
            this.simulation = options.simulation;

            this.listenTo(this.simulation.lasingPhotons, 'add remove', this.lasingPhotonCountChanged);
        },

        /**
         * Renders content and canvas for heatmap
         */
        render: function() {
            // Render the base template
            this.$el.append(this.template({
                unique: this.cid
            }));

            this.$internalPowerMeter = this.$('.internal-power-meter');
            this.$outputPowerMeter = this.$('.output-power-meter');

            return this;
        },

        postRender: function() {
            this.renderBars(this.$internalPowerMeter);
            this.renderBars(this.$outputPowerMeter);
        },

        renderBars: function($container) {
            var width = $container.width();
            var segmentWidth = 3;
            var segmentMargin = 1;
            var numSegments = Math.floor(width / (segmentWidth + segmentMargin));

            var segmentHtml = '<div class="power-meter-segment"></div>';
            var segments = [];

            for (var i = 0; i < numSegments; i++) {
                var $segment = $(segmentHtml);
                segments.push($segment);
                $container.append($segment);
            }

            $container.segments = segments;

            var $lasing = $container.find('.lasing-label');
            var $danger = $container.find('.danger-label');
            if ($lasing.length) {
                var lasingWidth = Math.round($container.width() * (this.getDangerPercent() - this.getLasingPercent()));
                var lasingLeft = Math.round($container.width() * this.getLasingPercent()) + 4;
                $lasing.css({
                    width: lasingWidth + 'px',
                    left: lasingLeft + 'px'
                });

                var dangerWidth = Math.round($container.width() * (1 - this.getDangerPercent()));
                var dangerLeft = Math.round($container.width() * this.getDangerPercent()) + 4;
                $danger.css({
                    width: dangerWidth + 'px',
                    left: dangerLeft + 'px'
                });
            }
        },

        updateBar: function($container, percent, simple) {
            if (percent === 0)
                return;
            
            var segments = $container.segments;
            var lasingPercent = this.getLasingPercent();
            var dangerPercent = this.getDangerPercent();

            for (var i = 0; i < segments.length; i++) {
                var segmentPercent = (i / segments.length);
                if (simple) {
                    if (segmentPercent > percent)
                        segments[i].removeClass('filled');
                    else
                        segments[i].addClass('filled');
                }
                else {
                    if (segmentPercent > percent) {
                        segments[i].removeClass('filled filled-lasing filled-danger');
                    }
                    else if (segmentPercent >= dangerPercent) {
                        segments[i].addClass('filled-danger');
                    }
                    else if (segmentPercent >= lasingPercent) {
                        segments[i].addClass('filled-lasing');
                    }
                    else {
                        segments[i].addClass('filled');
                    }
                }
            }
        },

        getLasingPercent: function() {
            return Constants.LASING_THRESHOLD / Constants.KABOOM_THRESHOLD;
        },

        getDangerPercent: function() {
            return 0.75;
        },

        lasingPhotonCountChanged: function(photon, lasingPhotons) {
            var count = lasingPhotons.length;
            var internalPowerPercent = count / Constants.KABOOM_THRESHOLD;
            var outputPowerPercent = (count / Constants.KABOOM_THRESHOLD) * (1 - this.simulation.rightMirror.getReflectivity());
            
            this.updateBar(this.$internalPowerMeter, internalPowerPercent, false);
            this.updateBar(this.$outputPowerMeter, outputPowerPercent, true);
        }

    });


    return LaserPowerView;
});

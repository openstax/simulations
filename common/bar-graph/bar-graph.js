
define(function(require) {

    'use strict';

    var _ = require('underscore');

    var html = require('text!./bar-graph.html');

    require('less!./bar-graph')

    var Constants = require('constants');

    /**
     * A view that represents a movable target model
     */
    var BarGraphView = Backbone.View.extend({

        template : _.template(html),

        tagName : 'div',
        className : 'energy-graph-view',

        initialize: function(options) {
            options = _.extend({
                title: '',
                totalLabel : 'Total E',
                maxValue : 6 // can calculate this later
            }, options);

            this.title = options.title;
            this.totalLabel = options.totalLabel;
            this.maxValue = options.maxValue;

            this.listenTo(this.model, 'change:bar', this.updateBar);
        },

        render: function(){
            var data = {
                title : this.title,
                totalLabel : this.totalLabel,
                bars : this.model.get('bars')
            };

            this.$el.html(this.template(data));

            this.initBars();
        },

        initBars: function() {
            var width = 100 / this.model.get('bars').length + '%';

            this.$el.find('.attribute').css({
                width: width
            });

            _.each(this.model.get('bars').reverse(), function(bar, iter){
                var $bar;

                if(bar.class === 'total'){
                    return;
                }

                $bar = $('<div class="bar ' + bar.linkTo + '"></div>');
                $bar.css({
                    zIndex: iter
                });
                this.$el.find('.total').append($bar);
            }, this);

            this.$el.find('.total .bar').wrapAll('<div class="bar-wrapper"/>');
        },

        updateBar: function(bar){
            this.$el.find('.' + bar.linkTo).css({
                maxHeight: bar.value/this.maxValue + 'em'
            });

            if(bar.class === 'total'){
                this.$el.find('#total-marker').css({
                    bottom: bar.value/this.maxValue + 'em'
                });
            }
        }

    });

    return BarGraphView;
});

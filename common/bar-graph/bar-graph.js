
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
                maxValue : 9.5 // can calculate this later
            }, options);

            this.title = options.title;
            this.maxValue = options.maxValue;

            this.listenTo(this.model, 'change:bars', this.updateBar);
        },

        render: function(){
            var data = {
                title : this.title,
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
        },

        drawBarGraphView : function(){
            // this.graphics.clear();


        },

        updateBar: function(bar){
            this.$el.find('#' + bar.linkTo).children('.bar').css({
                transform: 'scale(1, ' + bar.value/this.maxValue + ')'
            });
        }

    });

    return BarGraphView;
});

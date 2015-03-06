
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
        className : 'bar-graph-view',

        initialize: function(options) {
            options = _.extend({
                title: '',
                totalLabel : 'Total E',
                maxValue : 6, // can calculate this later
                graphHeight: 440,
                zoom: 1
            }, options);

            this.title = options.title;
            this.totalLabel = options.totalLabel;
            this.maxValue = options.maxValue;
            this.graphHeight = options.graphHeight;
            this._zoom = options.zoom;

            this.listenTo(this.model, 'change:bar', this.updateBar);
        },

        render: function(){
            var data = {
                title : this.title,
                totalLabel : this.totalLabel,
                bars : this.model.get('bars'),
                zoom : this._zoom
            };

            this.$el.html(this.template(data));

            this.initBars();
            this.resize();
        },

        initBars: function() {
            var width = 100 / this.model.get('bars').length + '%';

            this.$barGraph = this.$el.find('.bar-graph');
            this.$title = this.$barGraph.find('.title');
            this.$totalMarker = this.$barGraph.find('.total-marker');
            this.$attribute = this.$barGraph.find('.attribute');
            this.$total = this.$barGraph.find('.total');

            this.$attribute.css({
                width: width
            });

            _.each(this.model.get('bars'), function(bar, iter){
                var $bar;

                if(bar.class === 'total'){
                    return;
                }

                $bar = $('<div class="bar ' + bar.linkTo + '"></div>');
                $bar.css({
                    zIndex: iter
                });
                this.$total.append($bar);
            }, this);

            this.$total.find('.bar').wrapAll('<div class="bar-wrapper"/>');

            this.$bar = this.$barGraph.find('.bar');
        },

        updateBar: function(bar){
            this.$el.find('.' + bar.linkTo).css({
                maxHeight: bar.value/this.maxValue + 'em'
            });

            if(bar.class === 'total'){
                this.$el.find('.total-marker').css({
                    bottom: bar.value/this.maxValue + 'em'
                });
            }
        },

        zoomIn: function(){
            this._zoom = Math.round(this._zoom);
            this._zoom ++;
            this.zoom();
        },

        zoomOut: function(){

            if(this._zoom < 0.25){
                return;
            }

            if(this._zoom <= 1){
                this._zoom = this._zoom * 0.5;                
            }else{
                this._zoom --;
            }

            this.zoom();
        },

        zoom: function(){
            var zoomSize = this._zoom * this.graphHeight;

            this.$bar.add(this.$totalMarker).css({
                fontSize: zoomSize + 'px'
            });
        },

        resize: function(){
            this.$title.css({
                width: this.graphHeight + 'px'
            });

            this.$barGraph.add(this.$bars).add(this.$attribute).css({
                height: this.graphHeight + 'px'
            });

            this.$bar.css({
                height: (10 * this.graphHeight)+ 'px'
            });

            this.zoom();
        }

    });

    return BarGraphView;
});

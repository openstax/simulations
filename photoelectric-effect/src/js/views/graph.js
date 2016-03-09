define(function(require) {

    'use strict';

    var $        = require('jquery');
    var _        = require('underscore');
    var Backbone = require('backbone'); Backbone.$ = $;

    var html = require('text!templates/graph.html');
    
    require('less!styles/graph');

    /**
     * 
     */
    var GraphView = Backbone.View.extend({

        className: 'graph-view',

        events: {
            'click .zoom-in-btn'  : 'zoomIn',
            'click .zoom-out-btn' : 'zoomOut'
        },

        initialize: function(options) {
            // Default values
            options = _.extend({
                title: 'Value',
                x: {
                    start: 0,
                    end: 100,
                    step: 10,
                    label: 'X Axis',
                    showNumbers: true
                },
                y: {
                    start: 0,
                    end: 100,
                    step: 10,
                    label: 'Y Axis',
                    showNumbers: false
                },
                lineThickness: 5,
                lineColor: '#000',
                gridColor: '#ddd'
            }, options);

            this.simulation = options.simulation;

            this.title = options.title;
            this.x = options.x;
            this.y = options.y;

            this.lineThickness = options.lineThickness;
            this.lineColor = options.lineColor;
            this.gridColor = options.gridColor;
        },

        /**
         * Renders the view
         */
        render: function() {
            this.$el.html(html);
            return this;
        },

        /**
         * Sizes the canvas and initializes the canvas context
         */
        postRender: function() {
            var $canvas = this.$('canvas');
            var canvas = $canvas[0];
            canvas.width = $canvas.outerWidth();
            canvas.height = $canvas.outerHeight();

            this.

            return this;
        },

        /**
         * Updates the graph
         */
        update: function() {
            this.draw();
        },

        /**
         * Draws the graph
         */
        draw: function() {
            this.drawEmptyGraph();
            this.drawData();
        },

        drawEmptyGraph: function() {
            
        },

        drawData: function() {

        },

        zoomIn: function() {

        },

        zoomOut: function() {

        }

    });


    return GraphView;
});

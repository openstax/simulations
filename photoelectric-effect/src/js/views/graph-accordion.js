define(function(require) {

    'use strict';

    var $        = require('jquery');
    var _        = require('underscore');
    var Backbone = require('backbone'); Backbone.$ = $;

    var html = require('text!templates/graph-accordion.html');
    
    require('less!styles/graph-accordion');

    /**
     * 
     */
    var GraphAccordionView = Backbone.View.extend({

        className: 'graph-accordion-view',

        template: _.template(html),

        events: {
            'click .graph-accordion-title': 'titleClicked'
        },

        initialize: function(options) {
            this.simulation = options.simulation;

            if (!options || !options.graphs)
                this.initDefaultGraphViews();
            else
                this.graphs = options.graphs;
        },

        initDefaultGraphViews: function() {
            this.graphs = [];

            this.graphs.push({ title: 'Current vs Battery Voltage', render: function() {}, el: '' });
            this.graphs.push({ title: 'Current vs Light Intensity', render: function() {}, el: '' });
            this.graphs.push({ title: 'Electron Energy vs Light Frequency', render: function() {}, el: '' });
        },

        /**
         * Renders content and canvas for heatmap
         */
        render: function() {
            var data = {
                graphs: this.graphs
            };

            this.$el.html(this.template(data));

            return this;
        },

        postRender: function() {
            // for (var i = 0; i < this.graphs.length; i++)
            //     this.graphs[i].postRender();
        },

        titleClicked: function(event) {
            var $item = $(event.target).closest('.graph-accordion-item');
            $item.toggleClass('open');
        }

    });


    return GraphAccordionView;
});

define(function(require) {

    'use strict';

    var $        = require('jquery');
    var _        = require('underscore');
    var Backbone = require('backbone'); Backbone.$ = $;

    var AppView = require('common/app/app');

    var GraphView = require('views/graph');

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

            this.graphs.push(new GraphView({ title: 'Current vs Battery Voltage' }));
            this.graphs.push(new GraphView({ title: 'Current vs Light Intensity' }));
            this.graphs.push(new GraphView({ title: 'Electron Energy vs Light Frequency' }));
        },

        /**
         * Renders content and canvas for heatmap
         */
        render: function() {
            var data = {
                graphs: this.graphs
            };

            // Render the template
            this.$el.html(this.template(data));

            // Populate the item contents with the elements from the rendered graph views
            this.$('.graph-accordion-content').each(function(index, element) {
                $(element).html(data.graphs[index].render().el);
            });

            return this;
        },

        postRender: function() {
            for (var i = 0; i < this.graphs.length; i++)
                this.graphs[i].postRender();
        },

        resize: function() {
            this.closeItemsAsNecessary();
        },

        takeSnapshot: function() {
            console.log('snapshot');

            // To create the snapshot, update all graph views and then get images
            //   from the canvases and composite them together with the tabular
            //   data.  This way, it'll show all of the canvases even if we can't
            //   view all of them at once on the screen.
            // TODO
        },

        titleClicked: function(event) {
            var $item = $(event.target).closest('.graph-accordion-item');

            // Open or close the graph whose title was clicked on
            if ($item.hasClass('open')) {
                // Close it
                $item.removeClass('open');
            }
            else {
                // Get the item index and update the graph view before we show it
                this.graphs[$item.index()].update();

                // Open it
                $item.addClass('open');

                // // See if we need to close any graphs because of a lack of vertical space
                var itemBeingOpened = $item[0];
                this.closeItemsAsNecessary(itemBeingOpened);

                // Remember that this is the last one we opened for next time
                this.lastItemOpened = itemBeingOpened;
            }
        },

        closeItemsAsNecessary: function(itemBeingOpened) {
            // See if we need to close any graphs because of a lack of vertical space
            var numItemsToShow = AppView.windowIsShort() ? 1 : 2;
            var openItems = this.$('.graph-accordion-item.open').toArray();
            while (openItems.length > numItemsToShow) {
                // If we've got more than one too many open, we aren't going to keep the last one we opened open
                var lastItemOpened = ((openItems.length - 1) === numItemsToShow) ? null : this.lastItemOpened;

                // Find which graph we need to close
                var $graphToClose;
                for (var i = 0; i < openItems.length; i++) {
                    // Don't close the one we're trying to open, and don't open the
                    //   last one we opened, because that's more likely the one we
                    //   want to keep open if we have to choose
                    if (openItems[i] !== itemBeingOpened && openItems[i] !== lastItemOpened) {
                        $graphToClose = $(openItems[i]);
                        openItems.splice(i, 1);
                        break;
                    }
                }
                
                // And close it
                if ($graphToClose)
                    $graphToClose.removeClass('open');
                else {
                    console.warn('Couldn\'t find an item to close');
                    break;
                }
            }
        }

    });


    return GraphAccordionView;
});

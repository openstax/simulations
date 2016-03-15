define(function(require) {

    'use strict';

    var $        = require('jquery');
    var _        = require('underscore');
    var Backbone = require('backbone'); Backbone.$ = $;

    var AppView = require('common/app/app');

    var PEffectSimulation = require('models/simulation');

    var CurrentVsVoltageGraphView   = require('views/graph/current-vs-voltage');
    var CurrentVsIntensityGraphView = require('views/graph/current-vs-intensity');
    var EnergyVsFrequencyGraphView  = require('views/graph/energy-vs-frequency');

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

            this.graphs.push(new CurrentVsVoltageGraphView({   simulation: this.simulation }));
            this.graphs.push(new CurrentVsIntensityGraphView({ simulation: this.simulation }));
            this.graphs.push(new EnergyVsFrequencyGraphView({  simulation: this.simulation }));
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

        takeSnapshot: function(linkElement) {
            // To create the snapshot, update all graph views and then get images
            //   from the canvases and composite them together with the tabular
            //   data.  This way, it'll show all of the canvases even if we can't
            //   view all of them at once on the screen.

            var headerHeight = 100;
            var graphMargin = 30;
            var graphWidth  = this.graphs[0].elementWidth;
            var graphHeight = this.graphs[0].elementHeight;
            var y;

            if (!this._snapshotCtx) {
                this._snapshotCanvas = document.createElement('canvas');
                this._snapshotCanvas.width = graphWidth;
                this._snapshotCanvas.height = this.graphs.length * (graphHeight + graphMargin) + headerHeight;

                this._snapshotCtx = this._snapshotCanvas.getContext('2d');
            }

            var canvas = this._snapshotCanvas;
            var ctx = this._snapshotCtx;
            var width  = canvas.width;
            var height = canvas.height;
            var leftPadding = 8;
            var bottomPadding = 2;

            ctx.clearRect(0, 0, width, height);

            // Draw the titles and graphs
            ctx.font = 'bold 12px Helvetica Neue';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#777';

            ctx.textBaseline = 'bottom';
            for (var i = 0; i < this.graphs.length; i++) {
                y = headerHeight + i * (graphHeight + graphMargin) + graphMargin;

                ctx.fillText(this.graphs[i].title, leftPadding, y - bottomPadding);
                ctx.drawImage(
                    this.graphs[i].canvas,
                    0, 0,                                                      // Source (x, y)
                    this.graphs[i].canvas.width, this.graphs[i].canvas.height, // Source width, height
                    0, y,                                                      // Dest (x, y)
                    graphWidth, graphHeight                                    // Dest width, height
                );
            }

            // Draw the experimental parameters
            ctx.textBaseline = 'top';
            ctx.fillText('Experimental Parameters', leftPadding, leftPadding);

            ctx.fillStyle = '#000';
            
            var intensityTitle;
            var intensityPercent;

            if (this.simulation.get('controlMode') === PEffectSimulation.INTENSITY) {
                intensityTitle = 'Intensity';
                intensityPercent = this.simulation.photonRateToIntensity( 
                    this.simulation.beam.get('photonsPerSecond') / PEffectSimulation.MAX_PHOTONS_PER_SECOND,
                    this.simulation.getWavelength()
                );
            }
            else {
                intensityTitle = 'Photon Rate';
                intensityPercent = this.simulation.beam.get('photonsPerSecond') / PEffectSimulation.MAX_PHOTONS_PER_SECOND;
            }

            var params = [
                ['Material', this.simulation.target.getMaterial().get('name')],
                ['Wavelength', this.simulation.getWavelength() + 'nm'],
                [intensityTitle, Math.round(intensityPercent * 100) + '%'],
                ['Voltage', this.simulation.getVoltage().toFixed(2) + 'V']
            ];
            var paramLineHeight = 18;
            var paramsStartY = 26;

            for (var j = 0; j < params.length; j++) {
                y = paramsStartY + (j * paramLineHeight);

                ctx.font = 'bold 14px Helvetica Neue';
                ctx.textAlign = 'left';
                ctx.fillText(params[j][0], leftPadding, y);

                ctx.font = '14px Helvetica Neue';
                ctx.textAlign = 'right';
                ctx.fillText(params[j][1], width - leftPadding, y);
            }

            // Then download it
            linkElement.href = canvas.toDataURL();
            linkElement.download = 'Photoelectric Effect - Snapshot ' + this.simulation.time + '.png';
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

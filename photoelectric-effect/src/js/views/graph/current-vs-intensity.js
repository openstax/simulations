define(function(require) {

    'use strict';

    var _ = require('underscore');

    var PEffectSimulation = require('models/simulation');

    var GraphView = require('views/graph');

    /**
     * 
     */
    var CurrentVsIntensityGraphView = GraphView.extend({

        initialize: function(options) {
            // Default values
            options = _.extend({
                title: 'Current vs Light Intensity',
                x: {
                    start: 0,
                    end:   PEffectSimulation.MAX_PHOTONS_PER_SECOND,
                    step:  100,
                    label: 'Intensity',
                    showNumbers: false
                },
                y: {
                    start: 0,
                    end:   PEffectSimulation.MAX_CURRENT,
                    step:  PEffectSimulation.MAX_CURRENT / 6,
                    label: 'Current',
                    showNumbers: false
                },
                lineColor: '#349E34'
            }, options);

            GraphView.prototype.initialize.apply(this, [options]);
        },

        /**
         * Updates the graph
         */
        update: function() {
            this.draw();
        }

    });


    return CurrentVsIntensityGraphView;
});

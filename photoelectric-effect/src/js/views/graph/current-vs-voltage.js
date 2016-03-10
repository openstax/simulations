define(function(require) {

    'use strict';

    var _ = require('underscore');

    var PEffectSimulation = require('models/simulation');

    var GraphView = require('views/graph');

    /**
     * 
     */
    var CurrentVsVoltageGraphView = GraphView.extend({

        initialize: function(options) {
            // Default values
            options = _.extend({
                title: 'Current vs Battery Voltage',
                x: {
                    start: PEffectSimulation.MIN_VOLTAGE,
                    end:   PEffectSimulation.MAX_VOLTAGE,
                    step:  2,
                    label: 'Voltage',
                    showNumbers: true
                },
                y: {
                    start: 0,
                    end:   PEffectSimulation.MAX_CURRENT,
                    step:  PEffectSimulation.MAX_CURRENT / 6,
                    label: 'Current',
                    showNumbers: false
                },
                lineColor: '#f00'
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


    return CurrentVsVoltageGraphView;
});

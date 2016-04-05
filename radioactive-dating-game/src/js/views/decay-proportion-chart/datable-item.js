define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var Colors = require('common/colors/colors');

    var HalfLifeInfo  = require('models/half-life-info');
    var NucleusType   = require('models/nucleus-type');
    var AtomicNucleus = require('models/atomic-nucleus');

    var DecayProportionChartView = require('radioactive-dating-game/views/decay-proportion-chart');

    var Constants = require('constants');

    /**
     * A panel that contains a chart showing the timeline for decay of nuclei over time.
     */
    var DatableItemDecayProportionChartView = DecayProportionChartView.extend({

        /**
         * Initializes the new DatableItemDecayProportionChartView.
         */
        initialize: function(options) {
            options = _.extend({
                lineMode: false
            }, options);

            DecayProportionChartView.prototype.initialize.apply(this, [options]);

            this.listenTo(this.simulation, 'reset', this.simulationReset);
            this.listenTo(this.simulation.meter, 'change:nucleus-type', this.nucleusTypeChanged);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            DecayProportionChartView.prototype.initGraphics.apply(this, arguments);
        },

        drawCurrentGraphData: function() {
            var time = this.simulation.getAdjustedTime();

            this.drawDataPoint(time, activePercent,  this.isotope1Color);
        },

        update: function(time, deltaTime, paused) {
            
        },

        updateTimeSpan: function() {
            // Set the time span of the chart based on the nucleus type.
            var nucleusType = this.simulation.meter.get('nucleusType');
            var halfLife = HalfLifeInfo.getHalfLifeForNucleusType(nucleusType);
            this.setTimeParameters(halfLife * 3.2, halfLife);
        },

        nucleusTypeChanged: function(meter, nucleusType) {
            this.updateTimeSpan();
        },

        simulationReset: function() {
            this.clearData();
        },

    });


    return DatableItemDecayProportionChartView;
});
define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var Colors = require('common/colors/colors');

    var HalfLifeInfo  = require('models/half-life-info');
    var NucleusType   = require('models/nucleus-type');
    var AtomicNucleus = require('models/atomic-nucleus');

    var IsotopeSymbolGenerator = require('views/isotope-symbol-generator');

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
            this.listenTo(this.simulation, 'change:mode', this.clearData);
            this.listenTo(this.simulation.meter, 'change:nucleusType', this.nucleusTypeChanged);
            this.nucleusTypeChanged(this.simulation.meter, this.simulation.meter.get('nucleusType'));
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            DecayProportionChartView.prototype.initGraphics.apply(this, arguments);
        },

        drawCurrentGraphData: function() {
            var percentage = this.simulation.meter.getPercentageOfDatingElementRemaining();
            if (!isNaN(percentage)) {
                var time = this.simulation.getAdjustedTime();
                this.drawDataPoint(time, percentage / 100, this.isotopeColor);
            }
        },

        update: function(time, deltaTime, paused) {
            if (!paused && this.simulation.time > 0) {
                this.drawCurrentGraphData();
            }
        },

        updateTimeSpan: function() {
            // Set the time span of the chart based on the nucleus type.
            var nucleusType = this.simulation.meter.get('nucleusType');
            var halfLife = HalfLifeInfo.getHalfLifeForNucleusType(nucleusType);
            this.setTimeParameters(halfLife * 3.2, halfLife);
        },

        updateIsotope: function() {
            var nucleusType = this.simulation.meter.get('nucleusType');

            this.isotopeColor = Colors.parseHex(IsotopeSymbolGenerator.getElementColor(nucleusType));
        },

        nucleusTypeChanged: function(meter, nucleusType) {
            this.updateTimeSpan();
            this.updateIsotope();
            this.clearData();
        },

        simulationReset: function() {
            this.clearData();
        }

    });


    return DatableItemDecayProportionChartView;
});
define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var DatableItemDecayProportionChartView = require('radioactive-dating-game/views/decay-proportion-chart/datable-item');

    var Constants = require('constants');
    var NUM_SAMPLES_ON_DECAY_CHART = 500;

    /**
     * A panel that contains a chart showing the timeline for decay of nuclei over time.
     */
    var PrePopulatedDatableItemDecayProportionChartView = DatableItemDecayProportionChartView.extend({

        events: _.extend({}, DatableItemDecayProportionChartView.prototype.events, {
            
        }),

        /**
         * Initializes the new PrePopulatedDatableItemDecayProportionChartView.
         */
        initialize: function(options) {
            options = _.extend({
                
            }, options);

            DatableItemDecayProportionChartView.prototype.initialize.apply(this, [options]);       
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            DatableItemDecayProportionChartView.prototype.initGraphics.apply(this, arguments);

            
        },

        generateData: function() {
            var timeIncrement = this.timeSpan / NUM_SAMPLES_ON_DECAY_CHART;
            var lambda = Math.log(2) / this.halfLife;
            for (var time = 0; time < this.timeSpan; time += timeIncrement) {
                // Calculate the proportion of the element that should be decayed at this point in time.
                var percentDecayed = Math.exp(-time * lambda);
                this.recordDataPoint(time, percentDecayed);
            }
        },

        update: function(time, deltaTime, paused) {
            
        },

        nucleusTypeChanged: function() {
            DatableItemDecayProportionChartView.prototype.nucleusTypeChanged.apply(this, arguments);

            this.generateData();
            this.drawGraphData();
        },

        halfLifeChanged: function() {
            DatableItemDecayProportionChartView.prototype.halfLifeChanged.apply(this, arguments);

            this.generateData();
            this.drawGraphData();
        }

    });


    return PrePopulatedDatableItemDecayProportionChartView;
});
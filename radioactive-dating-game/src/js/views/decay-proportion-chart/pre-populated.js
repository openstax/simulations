define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var DatableItemDecayProportionChartView = require('radioactive-dating-game/views/decay-proportion-chart/datable-item');

    var Constants = require('constants');

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

        update: function(time, deltaTime, paused) {
            
        }

    });


    return PrePopulatedDatableItemDecayProportionChartView;
});
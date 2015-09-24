define(function (require) {

    'use strict';

    var _ = require('underscore');

    var NumberSeries = require('common/math/number-series');

    var Law = require('models/law');

    /**
     * 
     */
    var AverageCurrent = function(numSamples) {
        this.series = new NumberSeries(numSamples);
        this.resistance = 0;
        this.voltage = 0;
        this.display = 0;
    };

    /**
     * Instance functions/properties
     */
    _.extend(AverageCurrent.prototype, Law.prototype, {
        
        update: function(deltaTime, system) {
            var hollyscale = 3.5 * 3.3;
            var hollywood = this.resistance / this.voltage * hollyscale;
            this.series.add(hollywood);
            this.display = this.series.average();
            console.log('does anything need to listen to this?');
        },

        voltageChanged: function(voltage) {
            this.resistance = voltage;
        },

        coreCountChanged: function(x) {
            this.voltage = x;
        },

        getDisplay: function() {
            return this.display;
        }

    });

    return AverageCurrent;
});

define(function (require) {

    'use strict';

    var _ = require('underscore');

    var BarMeterView = require('views/bar-meter');

    var CapacitanceMeterView = BarMeterView.extend({

        initialize: function(options) {
            options = _.extend({
                units: 'F',
                barColor: '#21366b',
                title: 'Capacitance'
            }, options);

            this.lastCapacitance = 0;

            BarMeterView.prototype.initialize.apply(this, [options]);
        },

        renderBarMeter: function() {
            BarMeterView.prototype.renderBarMeter.apply(this, arguments);

        },

        update: function(time, delta, paused, timeScale) {
            var capacitance;

            if (this.model.circuits)
                capacitance = this.model.get('circuit').getTotalCapacitance();
            else
                capacitance = this.model.circuit.getTotalCapacitance();

            if (capacitance !== this.lastCapacitance) {
                this.setValue(capacitance);
                this.updateZoomButtons();
            }

            BarMeterView.prototype.update.apply(this, arguments);

            this.lastCapacitance = capacitance;
        }

    });

    return CapacitanceMeterView;
});

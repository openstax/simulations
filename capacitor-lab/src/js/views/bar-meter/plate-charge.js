define(function (require) {

    'use strict';

    var _ = require('underscore');

    var BarMeterView = require('views/bar-meter');

    var Constants = require('constants');

    var PlateChargeMeterView = BarMeterView.extend({

        positiveColor: Constants.POSITIVE_COLOR,
        negativeColor: Constants.NEGATIVE_COLOR,

        initialize: function(options) {
            options = _.extend({
                units: 'C',
                barColor: this.positiveColor,
                title: 'Plate Charge (Top)'
            }, options);

            this.lastPlateCharge = undefined;

            BarMeterView.prototype.initialize.apply(this, [options]);
        },

        renderBarMeter: function() {
            BarMeterView.prototype.renderBarMeter.apply(this, arguments);

        },

        update: function(time, delta, paused, timeScale) {
            var plateCharge;

            if (this.model.circuits)
                plateCharge = this.model.get('circuit').getTotalCharge();
            else
                plateCharge = this.model.circuit.getTotalCharge();

            if (plateCharge !== this.lastPlateCharge) {
                this.setValue(Math.abs(plateCharge));
                this.updateZoomButtons();

                if (plateCharge > 0) {
                    this.$bar.css('background-color', this.positiveColor);
                    this.$overflow.css('color', this.positiveColor);
                }
                else {
                    this.$bar.css('background-color', this.negativeColor);
                    this.$overflow.css('color', this.negativeColor);
                }
            }

            BarMeterView.prototype.update.apply(this, arguments);

            this.lastPlateCharge = plateCharge;
        }

    });

    return PlateChargeMeterView;
});

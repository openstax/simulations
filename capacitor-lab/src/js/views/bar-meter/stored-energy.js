define(function (require) {

    'use strict';

    var _ = require('underscore');

    var BarMeterView = require('views/bar-meter');

    var StoredEnergyMeterView = BarMeterView.extend({

        initialize: function(options) {
            options = _.extend({
                units: 'J',
                barColor: '#ffc601',
                title: 'Stored Energy'
            }, options);

            this.lastStoredEnergy = undefined;

            BarMeterView.prototype.initialize.apply(this, [options]);
        },

        renderBarMeter: function() {
            BarMeterView.prototype.renderBarMeter.apply(this, arguments);

        },

        update: function(time, delta, paused, timeScale) {
            var storedEnergy;

            if (this.model.circuits)
                storedEnergy = this.model.get('circuit').getStoredEnergy();
            else
                storedEnergy = this.model.circuit.getStoredEnergy();

            if (storedEnergy !== this.lastStoredEnergy) {
                this.setValue(storedEnergy);
                this.updateZoomButtons();
            }

            BarMeterView.prototype.update.apply(this, arguments);

            this.lastStoredEnergy = storedEnergy;
        }

    });

    return StoredEnergyMeterView;
});

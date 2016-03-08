define(function (require) {

    'use strict';

    var _ = require('underscore');

    var ScalarDataRecorder = require('models/scalar-data-recorder');


    /**
     * Calculates the current from number of electrons per span of time
     */
    var Ammeter = function() {
        ScalarDataRecorder.apply(this, arguments);
    };

    _.extend(Ammeter.prototype, ScalarDataRecorder.prototype, {

        recordElectron: function(time) {
            this.recordElectrons(time, 1);
        },

        recordElectrons: function(time, numElectrons) {
            this.addDataRecord(time, numElectrons);
        },

        getCurrent: function() {
            var current = this.total / this.timeSpanOfEntries;
            if (Number.isNaN(current) || !Number.isFinite(current))
                current = 0;
            return current;
        }

    });


    return Ammeter;
});
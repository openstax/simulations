define(function (require) {

    'use strict';

    var _ = require('underscore');


    var ScalarDataRecorder = function() {
        this.values = [];
        this.times  = [];

        this.total = 0;
        this.average = 0;

        this.minVal = 0;
        this.maxVal = 0;

        this.timeSpanOfEntries = 0;

        this.timeSinceLastUpdate = 0;
    };

    _.extend(ScalarDataRecorder.prototype, {

        timeWindow: 1,
        updateInterval: 0.5,

        clear: function() {
            for (var i = this.values.length - 1; i >= 0; i--) {
                this.values.splice(i, 1);
                this.times.splice(i, 1);
            }

            this.computeStatistics();
        },

        update: function(time, deltaTime) {
            this.timeSinceLastUpdate += deltaTime;
            if (this.timeSinceLastUpdate >= this.updateInterval) {
                this.timeSinceLastUpdate %= this.updateInterval;
                this.computeStatistics(time);
            }
        },

        /**
         * Computes various statistics on the data collected during the last
         * simulation time window. Data older than that is discarded from the
         * record.
         */
        computeStatistics: function(time) {
            // Remove entries from the data record that have aged out of the time window
            if (this.getDataLength() > 0) {
                var startTime = this.times[0];
                while (this.getDataLength() > 0 && time - startTime > this.timeWindow) {
                    this.removeDataRecordAtIndex(0);
                    if (this.getDataLength() > 0)
                        startTime = this.times[0];
                }
            }

            // Calculate total
            this.total = 0;
            this.minVal = Number.MAX_VALUE;
            this.maxVal = Number.MIN_VALUE;
            for (var i = 0; i < this.getDataLength(); i++) {
                var value = this.values[i];
                this.total += value;

                // Track the range of the entries
                this.minVal = this.minVal > value ? value : this.minVal;
                this.maxVal = this.maxVal < value ? value : this.maxVal;
            }

            // Calculate average
            this.average = 0;
            if (this.getDataLength() > 0) {
                // Get the time span of the entries
                var timeOfFirstEntry = this.times[0];
                var timeOfLastEntry = this.times[this.getDataLength() - 1];
                this.timeSpanOfEntries = timeOfLastEntry - timeOfFirstEntry;

                // Compute the average of the entries
                this.average = this.total / this.getDataLength();
            }
        },

        /**
         * Records a data point
         */
        addDataRecord: function(time, value) {
            this.values.push(time);
            this.times.push(value);
        },

        removeDataRecordAtIndex: function(index) {
            this.values.splice(index, 1);
            this.times.splice(index, 1);
        },

        getDataLength: function() {
            return this.values.length;
        },

        getSimulationTimeWindow: function() {
            return this.timeWindow;
        }

    });

    return ScalarDataRecorder;
});
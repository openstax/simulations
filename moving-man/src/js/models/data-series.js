
define(function(require) {

    'use strict';

    var _ = require('underscore');

    /**
     *  I don't really know how important the listeners are yet.  If I do
     *    indeed need to have listeners on this object, I'll give it the
     *    Backbone events functionality.
     */
    var DataSeries = function(options) {
        this.initialize(options);
    };

    _.extend(DataSeries.prototype, {

        /**
         *
         */
        initialize: function() {
            this.data = [];
        },

        /**
         *
         */
        add: function(value, time) {
            if (_.isObject(value)) {
                this.data.push(value);
            }
            else {
                this.data.push({
                    value: value,
                    time: time
                });
            }
        },

        /**
         *
         */
        size: function() {
            return this.data.length;
        },

        /**
         *
         */
        getPoint: function(i) {
            return this.data[i];
        },

        /**
         *
         */
        getPointsInRange: function(start, end) {
            var points = [];
            var size = this.size();
            for (var i = start; i <= end; i++) {
                if (i >= 0 && i < size)
                    points.push(this.data[i]);
            }
            return points;
        },

        /**
         *
         */
        getLastPoint: function() {
            if (this.data.length)
                return this.data[this.data.length - 1];
            else
                return null;
        },

        /**
         * In the series [0, 1, 2, 3, 4], this would return 2 as expected,
         *   but in the series [0, 1, 2, 3], this would return 2 as well,
         *   so I guess it just always takes the right-of-center value in
         *   the case of an even length.  This is from PhET.
         */
        getMidPoint: function() {
            if (this.data.length)
                return this.data[Math.floor(this.data.length / 2)];
            else
                return null;
        },

        /**
         *
         */
        clear: function() {
            this.data = [];
        },

        /**
         *
         */
        clearPointsAfter: function(time) {
            var points = [];
            for (var i = 0; i < this.data.length; i++) {
                if (this.data[i].time < time)
                    points.push(this.data[i]);
            }
            this.data = points;
        },

        /**
         *
         */
        setData: function(data) {
            this.data = data;
        }

    });

    /**
     * Version of the DataSeries that ignores points with times greater than
     *   a certain value so that we're only storing what we need and don't
     *   just keep expanding until the app crashes.
     */
    DataSeries.LimitedTime = function(options) {
        this.initialize(options);
    };

    _.extend(DataSeries.LimitedTime.prototype, DataSeries.prototype, {

        /**
         *
         */
        initialize: function(options) {
            DataSeries.prototype.initialize.apply(this, [options]);

            if (options && options.maxTime)
                this.maxTime = options.maxTime;
        },

        /**
         * For some reason the PhET version calls addPoint twice--once no
         *   matter what and then once again if it fits within the max time.
         *   I'm just going to call it once until I further notice.
         */
        add: function(value, time) {
            if (_.isObject(value)) {
                var obj = value;
                value = obj.value;
                time  = obj.time;
            }
            if (time <= this.maxTime)
                DataSeries.prototype.add.apply(this, [value, time]);
        }

    });

    /**
     * Version of the DataSeries that acts like a fixed-length queue.
     */
    DataSeries.LimitedSize = function(options) {
        this.initialize(options);
    };

    _.extend(DataSeries.LimitedSize.prototype, DataSeries.prototype, {

        /**
         *
         */
        initialize: function(options) {
            DataSeries.prototype.initialize.apply(this, [options]);
            
            if (options && options.maxSize)
                this.maxSize = options.maxSize;
        },

        /**
         *
         */
        add: function(value, time) {
            DataSeries.prototype.add.apply(this, [value, time]);

            while (this.data.length > this.maxSize)
                this.data.shift();
        }

    });

    return DataSeries;
});
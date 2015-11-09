define(function (require) {

    'use strict';

    var _ = require('underscore');

    /**
     * 
     */
    var Grid = function(bxCsvString, byCsvString, size, spacing) {
        this.size = size;
        this.spacing = spacing;
        this.bxArray = this.parseCSV(bxCsvString);
        this.byArray = this.parseCSV(byCsvString);
    };

    /**
     * Instance functions/properties
     */
    _.extend(Grid.prototype, {

        getSize: function() {
            return this.size;
        },

        getSpacing: function() {
            return this.spacing;
        },

        getBxArray: function() {
            return this.bxArray;
        },

        getByArray: function() {
            return this.byArray;
        },

        /**
         * Returns whether this grid contains the specified point.  Since the grid
         *   consists one quadrant of the the space (where x & y are positive), this
         *   is determined based on the absolute value of the xy coordinates.
         */
        contains: function(x, y) {
            var absX = Math.abs(x);
            var absY = Math.abs(y);
            return (absX >= 0 && absX <= this.getMaxX() && absY >= 0 && absY <= this.getMaxY());
        },

        getMaxX: function() {
            return this.spacing * (this.size.width - 1);
        },

        getMaxY: function() {
            return this.spacing * (this.size.height - 1);
        },

        /**
         * 
         */
        parseCSV: function(csv) {
            var data = [];
            var row = 0;
            var col = 0;
            var height = this.size.height;
            var lines = csv.split('\n');

            for (var i = 0; i < lines.length; i++) {
                data[col] = [];

                var records = lines[i].split(',');

                for (var j = 0; j < records.length; j++) {
                    data[col][row] = parseFloat(records[j]);

                    row++;
                    if (row === height) {
                        row = 0;
                        col++;
                    }
                }
            }

            return data;
        }

    });

    return Grid;
});

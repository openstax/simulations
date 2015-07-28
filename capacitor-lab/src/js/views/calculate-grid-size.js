define(function(require) {

    'use strict';

    var returnObj = {
        columns: 0,
        rows: 0
    };

    /**
     * Strategy developed by Sam Reid, here's how he described it: The main change
     *   is to use rounding instead of clamping to get the rows and columns. Also,
     *   for one row or column, it should be exact (similar to the intent of the
     *   ModifiedCCKGridSizeStrategy subclass). It looks like it exhibits better
     *   (though understandably imperfect) behavior in the problem cases. Also, as
     *   opposed to the previous versions, the visible number of objects can
     *   exceed the specified numberOfObjects. This may be the best we can do if
     *   we are showing a rectangular grid of charges.  We could get the count
     *   exactly right if we show some (or one) of the columns having different
     *   numbers of charges than the others, but then it may look nonuniform (and
     *   would require more extensive changes to the sim).
     */
    var calculateGridSize = function(numberOfObjects, width, height) {
        var columns = 0;
        var rows = 0;

        if (numberOfObjects > 0) {
            var alpha = Math.sqrt(numberOfObjects / width / height);
            columns = Math.round(width * alpha);

            // Compute rows 2 ways, choose the best fit
            var rows1 = Math.round(height * alpha);
            var rows2 = Math.round(numberOfObjects / columns);
            if (rows1 !== rows2) {
                var error1 = Math.abs(numberOfObjects - (rows1 * columns));
                var error2 = Math.abs(numberOfObjects - (rows2 * columns));
                rows = ( error1 < error2 ) ? rows1 : rows2;
            }
            else {
                rows = rows1;
            }

            // Handle boundary cases
            if (columns === 0) {
                columns = 1;
                rows = numberOfObjects;
            }
            else if (rows === 0) {
                rows = 1;
                columns = numberOfObjects;
            }
        }
        
        returnObj.columns = columns;
        returnObj.rows = rows;

        return returnObj;
    };

    return calculateGridSize;
});
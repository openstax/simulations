define(function (require) {

    'use strict';

    var Vector2 = require('common/math/vector2');

    var AbstractMagnet = require('models/magnet');
    var Grid           = require('models/grid');

    var Constants = require('constants');

    /**
     * Mostly original PhET documentation:
     *
     * Model of a bar magnet that uses a grid of precomputed B-field values.
     * 
     * It was not feasible to implement a numerical model directly in Java, as
     *   it relies on double integrals. So the model was implemented in MathCAD,
     *   and MathCAD was used to create 3 grids of B-field vectors. The MathCAD
     *   model can be found at faraday/doc/BarMagnet-MathCAD.pdf.
     * 
     * The 3 B-field grids are:
     *   - internal: field internal to the magnet
     *   - external-near: field near the magnet
     *   - external-far: field far from the magnet
     *
     * In order to model the discontinuity that appears at the top and bottom
     *   magnet edges, internal and external-near have points that lie exactly
     *   on those edges, and have different values for those points.
     * 
     * The external-far grid is a sparse grid, and provides an approximate 
     *   B-field for use by the compass.
     * 
     * The 3 grids overlap such that external-near contains internal, and
     *   external-far contains external-near. Each grid assumes that the
     *   magnet's center is at the origin, starts are xy=(0,0), and includes
     *   only the quadrant where x and y are both positive (lower-right quadrant
     *   in our coordinate system).
     * 
     * Each grid is stored in 2 files - one for Bx, one for By. This simulation
     *   reads those files, and computes the B-field at a specified point using a
     *   linear interpolation algorithm.
     * 
     * Our coordinate system has +x to the left, and +y down, with quadrants
     *   numbered like this:
     * 
     *    Q3 | Q2
     *    -------
     *    Q4 | Q1
     *    
     * The grid files contain the B-field components for Q1, with values in
     *   column-major order. (This means that the x coordinate changes more
     *   slowly than the y coordinate.) x and y coordinates both start at 0.
     * 
     * After locating a B-field vector in Q1, here's how to map it to one of the
     *   other quadrants:
     *   - Q2: reflect about the x axis, so multiply By by -1
     *   - Q3: reflect through the origin, so no change
     *   - Q4: reflect about the x axis and reflect through the origin, so so 
     *         multiply By by -1
     *
     */
    var BarMagnet = AbstractMagnet.extend({

        initialize: function(attributes, options) {
            AbstractMagnet.prototype.initialize.apply(this, arguments);

            this.internalGrid     = new Grid(BarMagnet.BX_INTERNAL,      BarMagnet.BY_INTERNAL,      BarMagnet.INTERNAL_GRID_SIZE,      BarMagnet.INTERNAL_GRID_SPACING);      // internal to the magnet
            this.externalNearGrid = new Grid(BarMagnet.BX_EXTERNAL_NEAR, BarMagnet.BY_EXTERNAL_NEAR, BarMagnet.EXTERNAL_NEAR_GRID_SIZE, BarMagnet.EXTERNAL_NEAR_GRID_SPACING); // near the magnet
            this.externalFarGrid  = new Grid(BarMagnet.BX_EXTERNAL_FAR,  BarMagnet.BY_EXTERNAL_FAR,  BarMagnet.EXTERNAL_FAR_GRID_SIZE,  BarMagnet.EXTERNAL_FAR_GRID_SPACING);  // far from the magnet

            this._bField = new Vector2();
        },

        /**
         * Gets the B-field vector at a point in the magnet's local 2D coordinate frame.
         *   In the magnet's local 2D coordinate frame, it is located at (0,0), and its
         *   north pole is pointing down the positive x-axis.
         *
         * @param Vector2 the point
         * @param Vector2 B-field is written here if provided, may NOT be null
         * @return Vector2
         */
        getBFieldRelative: function(point) {
            var bField = this._bField;
            // find B-field by interpolating grid points
            bField.x = this.getBx(point.x, point.y);
            bField.y = this.getBy(point.x, point.y);

            // scale based on magnet strength
            bField.scale(this.get('strength') / BarMagnet.GRID_MAGNET_STRENGTH);

            return bField;
        },

        /*
         * Get Bx component for a point relative to the magnet's origin.
         * This component is identical in all 4 quadrants.
         */
        getBx: function(x, y) {
            var grid = this.chooseGrid(x, y);
            return this.interpolate(
                Math.abs( x ), 
                Math.abs( y ), 
                grid.getMaxX(), 
                grid.getMaxY(), 
                grid.getBxArray(), 
                grid.getSpacing()
            );
        },

        /*
         * Get By component for a point relative to the magnet's origin.
         * This component is the same in 2 quadrants, but must be reflected about the y axis for 2 quadrants.
         */
        getBy: function(x, y) {
            var grid = this.chooseGrid(x, y);
            var by = this.interpolate(
                Math.abs( x ),
                Math.abs( y ),
                grid.getMaxX(),
                grid.getMaxY(),
                grid.getByArray(),
                grid.getSpacing()
            );

            if ((x > 0 && y < 0) || (x < 0 && y > 0))
                by *= -1; // Reflect about the y axis
            
            return by;
        },

        /*
         * Chooses the appropriate grid.
         */
        chooseGrid: function(x, y) {
            if (this.internalGrid.contains(x, y))
                return this.internalGrid;
            else if (this.externalNearGrid.contains(x, y))
                return this.externalNearGrid;
            else
                return this.externalFarGrid;
        },

        /*
         * Locates the 4 grid points that form a rectangle enclosing the specified point.
         * Then performs a linear interpolation of the B-field component at those 4 points.
         * Variable names in this method corresponds to those used in Mike Dubson's documentation, ie:
         *
         * f00-----------f10
         *  |             |
         *  |      xy     |
         *  |             |
         * f01-----------f11
         */
        interpolate: function(x, y, maxX, maxY, componentValues, gridSpacing) {
            if (!(x >= 0 && y >= 0))
                throw 'x and y must be positive'; // ...because our grid is for that quadrant

            var value = 0; // B-field outside the grid is zero
            if (x >= 0 && x <= maxX && y >= 0 && y <= maxY) {

                // Compute array indicies
                var columnIndex = Math.floor(x / gridSpacing);
                var rowIndex    = Math.floor(y / gridSpacing);

                /* 
                 * If we're at one of the index maximums, then we're exactly on the outer edge of the grid.
                 * Back up by 1 so that we'll have a bounding rectangle.
                 */
                if (columnIndex === componentValues.length - 1)
                    columnIndex -= 1;
                if (rowIndex === componentValues[0].length - 1)
                    rowIndex -= 1;

                // xy coordinates that define the enclosing rectangle
                var x0 = columnIndex * gridSpacing;
                var y0 = rowIndex    * gridSpacing;
                var x1 = x0 + gridSpacing;
                var y1 = y0 + gridSpacing;

                // values at the 4 corners of the enclosing rectangle
                var f00 = componentValues[columnIndex    ][rowIndex    ];
                var f10 = componentValues[columnIndex + 1][rowIndex    ];
                var f01 = componentValues[columnIndex    ][rowIndex + 1];
                var f11 = componentValues[columnIndex + 1][rowIndex + 1];

                // interpolate
                value = (f00 * ((x1 - x)  / (x1 - x0)) * ((y1 - y)  / (y1 - y0))) +
                        (f10 * ((x  - x0) / (x1 - x0)) * ((y1 - y)  / (y1 - y0))) +
                        (f01 * ((x1 - x)  / (x1 - x0)) * ((y  - y0) / (y1 - y0))) +
                        (f11 * ((x  - x0) / (x1 - x0)) * ((y  - y0) / (y1 - y0)));
            }
            return value;
        }

    }, Constants.BarMagnet);

    return BarMagnet;
});

define(function(require) {

    'use strict';

    var _ = require('underscore');

    var Rectangle = require('common/math/rectangle');

    var Constants = require('constants');
    var TILE_SIZE = Constants.TILE_SIZE;

    /**
     * Shared variables
     */
    var _rect = new Rectangle();
    var position = { col: 0, row: 0 };

    /**
     * A level object contains the level data and functions
     *   for determining collisions and positions of walls.
     */
    var Level = function(data) {
        if (data.length !== Level.HEIGHT)
            throw 'Level does not comply with height requirements.';

        for (var j = 0; j < data.length; j++) {
            if (data[j].length !== Level.WIDTH)
                throw 'Level does not comply with width requirements.';
        }

        this.data = data;
    };

    /**
     * Static constants
     */
    Level.WIDTH  = 32;
    Level.HEIGHT = 14;
    Level.HALF_WIDTH  = Level.WIDTH / 2;
    Level.HALF_HEIGHT = Level.HEIGHT / 2;

    var HALF_WIDTH  = Level.HALF_WIDTH;
    var HALF_HEIGHT = Level.HALF_HEIGHT;

    // Define tile values
    Level.TILE_FLOOR  = 0;
    Level.TILE_WALL   = 1;
    Level.TILE_START  = 2;
    Level.TILE_FINISH = 3;

    /**
     * Prototype functions/properties
     */
    _.extend(Level.prototype, {

        /**
         * Converts an x location to the index of the column
         *   that contains it.
         */
        xToCol: function(x) {
            return Math.floor(x / TILE_SIZE) + HALF_WIDTH;
        },

        /**
         * Converts a y location to the index of the row
         *   that contains it.
         */
        yToRow: function(y) {
            return Math.floor(y / TILE_SIZE) + HALF_HEIGHT;
        },

        /**
         * Converts a column number to the x position of
         *   its left edge.
         */
        colToX: function(col) {
            return (col - HALF_WIDTH) * TILE_SIZE;
        },

        /**
         * Converts a row number to the y position of
         *   its top edge.
         */
        rowToY: function(row) {
            return (row - HALF_HEIGHT) * TILE_SIZE;
        },

        /**
         * Returns the kind of tile present at (x, y).
         */
        tileAt: function(x, y) {
            return this.data[this.yToRow(y)][this.xToCol(x)];
        },

        inBounds: function(row, col) {
            return (row > 0 && row < Level.HEIGHT && col > 0 && col < Level.WIDTH);
        },

        /**
         * Returns wether or not the given tile type is
         *   touched by a circle at position (x, y) with
         *   the given radius.
         */
        collidesWithTileTypeAt: function(tileType, x, y, radius) {
            var c = this.xToCol(x);
            var r = this.yToRow(y);

            if (this.inBounds(r, c) && this.data[r][c] === tileType) 
                return true;

            for (var i = -1; i <= 1; i++) {
                for (var j = -1; j <= 1; j++) {
                    if (this.inBounds(r + j,c + i)) {
                        var tileRect = this.getTileRect(c + i, r + j);
                        if (tileRect.overlapsCircle(x, y, radius) && this.data[r + j][c + i] === tileType)
                            return true;
                    }
                }
            }

            return false;
        },

        /**
         * Returns a list of all the places where the
         *   circle collides with a certain tile type.
         */
        getAllCollisionsWithTileType: function(typeType, x, y, radius) {},

        /**
         * Returns a Rectangle object of the bounds of the
         *   specified tile.  Note that it returns a shared
         *   instance, so the calling function must use it
         *   or lose it (or clone it).
         */
        getTileRect: function(col, row) {
            return _rect.set(
                this.colToX(col),
                this.rowToY(row),
                TILE_SIZE,
                TILE_SIZE
            );
        },

        /**
         * Returns an object containing the column and row
         *   of the start position or false if it doesn't
         *   exist.
         */
        startPosition: function() {
            return this.findFirst(Level.TILE_START);
        },

        /**
         * Returns an object containing the column and row
         *   of the finish position or false if it doesn't
         *   exist.
         */
        finishPosition: function() {
            return this.findFirst(Level.TILE_FINISH);
        },

        /**
         * Returns an object containing the column and row
         *   of the first tile of the specified tile type
         *   or false if it can't find one.
         */
        findFirst: function(tileType) {
            var data = this.data;
            for (var r = 0; r < data.length; r++) {
                for (var c = 0; c < data[r].length; c++) {
                    if (data[r][c] === tileType) {
                        position.col = c;
                        position.row = r;
                        return position;
                    }
                }
            }
            return false;
        }

    });

    return Level;
});
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

	/**
	 * A level object contains the level data and functions
	 *   for determining collisions and positions of walls.
	 */
	var Level = function(data) {
		if (data.length !== Level.LEVEL_HEIGHT)
		    throw 'Level does not comply with height requirements.';

		for (var j = 0; j < data.length; j++) {
			if (data[j].length !== Level.LEVEL_WIDTH)
                throw 'Level does not comply with width requirements.';
		}

		this.data = data;
	};

	/**
	 * Static constants
	 */
	Level.LEVEL_WIDTH  = 32;
	Level.LEVEL_HEIGHT = 14;
	var HALF_LEVEL_WIDTH  = Level.LEVEL_WIDTH / 2;
	var HALF_LEVEL_HEIGHT = Level.LEVEL_HEIGHT / 2;

	// Define tile values
	Level.TILE_FLOOR  = 0;
	Level.TILE_WALLS  = 1;
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
			return Math.floor(x / TILE_SIZE) + HALF_LEVEL_WIDTH;
		},

		/**
		 * Converts a y location to the index of the row
		 *   that contains it.
		 */
		yToRow: function(y) {
			return Math.floor(y / TILE_SIZE) + HALF_LEVEL_HEIGHT;
		},

		/**
		 * Returns the kind of tile present at (x, y).
		 */
		tileAt: function(x, y) {
			return this.data[this.yToRow(y)][this.xToCol(x)];
		},

		/**
		 * Returns wether or not the given tile type is
		 *   touched by a circle at position (x, y) with
		 *   the given radius.
		 */
		collidesWithTileTypeAt: function(tileType, x, y, radius) {
			var c = this.xToCol(x);
			var r = this.yToRow(y);

			if (this.data[r][c] === tileType) 
				return true;

			for (var i = -1; i <= 1; i++) {
				for (var j = -1; j <= 1; j++) {
					var tileRect = this.getTileRect(c + i, r + j);
					if (tileRect.overlapsCircle(x, y, radius) && this.data[r + j][c + i] === tileType)
						return true;
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
				(col - HALF_LEVEL_WIDTH)  * TILE_SIZE,
				(row - HALF_LEVEL_HEIGHT) * TILE_SIZE,
				TILE_SIZE,
				TILE_SIZE
			);
		}

	});

	return Level;
});
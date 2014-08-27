/*
 * Based on a gist from Dan Tello
 * https://gist.github.com/greypants/3739036
 */

define(function (require) {

	'use strict';

	var dist,
	    lengthSquared;

	return {

		/* 
		 * Just classic Pythagoras, Babe!
		 */	
		lineLength: function(x0, y0, x1, y1) {
			return Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
		},

		/**
		 * Finds the right angle distance between a point and a line
		 *   defined by two endpoints.  It's the length of the vector
		 *   that is perpendicular with the line and goes to the point.
		 *   
		 * Source:
		 *   http://mathworld.wolfram.com/Point-LineDistance2-Dimensional.html
		 *
		 * If more flexibility is needed in the future, maybe see
		 *   http://jsfromhell.com/math/dot-line-length
		 */
		distanceFromLine: function(x, y, x0, y0, x1, y1) {
			if (x1 - x0 === 0 && y1 - y0 === 0) {
				/* 
				 * If the line is collapsed into a single point, 
				 *   it's just the distance to that point.
				 */	
				return this.lineLength(x, y, x0, y0);
			}
			else {
				/* 
				 * Calculate the length of right-angle vector and return it.
				 */	
				return Math.abs( (x1 - x0) * (y1 - y) - (x0 - x) * (y1 - y0) ) / this.lineLength(x0, y0, x1, y1);
			}
		},

		sqr: function(x) {
			return x * x;
		},

		distanceSquared: function(x0, y0, x1, y1) {
			return this.sqr(x1 - x0) + this.sqr(y1 - y0);
		},

		/*
		 * From http://stackoverflow.com/a/1501725 by Grumdrig. This one's better.
		 */
		distanceFromSegmentSquared: function(x, y, x0, y0, x1, y1) {
			lengthSquared = this.distanceSquared(x0, y0, x1, y1);

			if (lengthSquared === 0) 
				return this.distanceSquared(x, y, x0, y0);

			// Get the magnitude of the projection of vector from the point to (x0, y0) on the segment
			dist = ((x - x0) * (x1 - x0) + (y - y0) * (y1 - y0)) / lengthSquared;

			if (dist < 0) 
				return this.distanceSquared(x, y, x0, y0);

			if (dist > 1) 
				return this.distanceSquared(x, y, x1, y1);

			return this.distanceSquared(x, y, x0 + dist * (x1 - x0), y0 + dist * (y1 - y0));
		},

		distanceFromSegment: function(x, y, x0, y0, x1, y1) {
			return Math.sqrt(this.distanceFromSegmentSquared(x, y, x0, y0, x1, y1));
		}
	};
});

/*
 * Based on a gist from Dan Tello
 * https://gist.github.com/greypants/3739036
 */

define(function (require) {

	'use strict';

	var dist,
	    lengthSquared,
	    i,
	    j,
	    magnitude;

	return {

		sqr: function(x) {
			return x * x;
		},

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
		},

		/**
		 * Get the normal to the line segment and then convert it
		 *   into a unit vector.
		 */
		normalVectorFromLine: function(x0, y0, x1, y1) {
			// Normal vector to the line
			i = (y1 - y0) * -1;
			j =  x1 - x0;

			// Unitize
			magnitude = Math.sqrt(this.sqr(i) + this.sqr(j));

			i /= magnitude;
			j /= magnitude;

			return {
				x: i,
				y: j
			};
		},

		/**
		 * Returns angle of line in degrees where zero is pointing to the right and goes clockwise
		 */
		angleFromLine: function(x0, y0, x1, y1) {
			// Slope vector
			i = x1 - x0;
			j = y1 - y0;

			return Math.atan2(j, i) * (180 / Math.PI);
		},

		/**
		 * http://stackoverflow.com/a/5624139
		 */
		hexToRgb: function(hex) {
			// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
			var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
			hex = hex.replace(shorthandRegex, function(m, r, g, b) {
				return r + r + g + g + b + b;
			});

			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result ? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			} : null;
		},

		/**
		 * Parses an rgb/rgba string into its component parts and returns them as an object.
		 */
		parseRgba: function(rgbString) {
			var result = /^rgba?\(\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\s*(?:,\s*([\d\.]+))?\)$/.exec(rgbString);
			if (result) {
				if (result[4] !== undefined) {
					return {
						r: result[1],
						g: result[2],
						b: result[3],
						a: result[4]
					};
				}
				else {
					return {
						r: result[1],
						g: result[2],
						b: result[3]
					};
				}
			}
			else
				return null;
		},

		/**
		 * Takes either hex or rgba format and converts it into an rgba string with alpha.
		 */
		toRgba: function(sourceColor, alpha) {
			var rgb = this.hexToRgb(sourceColor);

			if (!rgb)
				rgb = this.parseRgba(sourceColor);

			if (rgb) {
				if (alpha !== undefined)
					rgb.a = alpha;
				if (rgb.a === undefined)
					rgb.a = 1;

				return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + rgb.a + ')';
			} 
			else
				return null;	
		},

		/**
		 * http://stackoverflow.com/a/987376
		 */
		selectText: function(element) {
			var doc = document
			  , range
			  , selection;

			if (doc.body.createTextRange) { //ms
				range = doc.body.createTextRange();
				range.moveToElementText(element);
				range.select();
			} 
			else if (window.getSelection) { //all others
				selection = window.getSelection();        
				range = doc.createRange();
				range.selectNodeContents(element);
				selection.removeAllRanges();
				selection.addRange(range);
			}
		}
	};
});

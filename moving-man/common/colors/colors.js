
define(function (require) {

	'use strict';

	var Colors = {
		/**
		 * http://stackoverflow.com/a/5624139
		 */
		rgbToHex: function(r, g, b) {
			return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
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
		 * If alpha isn't specified, defaults to 1.  If alpha is a boolean, it takes the
		 *   place of return Object.
		 */
		toRgba: function(sourceColor, alpha, returnObject) {
			var rgb = this.hexToRgb(sourceColor);

			if (!rgb)
				rgb = this.parseRgba(sourceColor);

			if (rgb) {
				if (alpha !== undefined && alpha !== false && alpha !== true)
					rgb.a = alpha;
				if (rgb.a === undefined)
					rgb.a = 1;

				if (returnObject || alpha === true)
					return rgb;
				else
					return 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + rgb.a + ')';
			} 
			else
				return null;	
		}
	};

	return Colors;
});

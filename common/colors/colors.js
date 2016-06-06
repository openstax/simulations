
define(function (require) {

	'use strict';

	// Regex from http://stackoverflow.com/a/5624139, http://stackoverflow.com/a/5624139
	var hexRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
	var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	var _replaceShorthandFunction = function(m, r, g, b) {
		return r + r + g + g + b + b;
	};

	/**
	 * Expands shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	 */
	var replaceShorthand = function(hex) {
		return hex.replace(shorthandRegex, _replaceShorthandFunction);
	};


	var Colors = {

		/**
		 * 
		 */
		parseHex: function(string) {
			// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
			var fullHex = replaceShorthand(string);

			// Remove the hash sign on the front
			var numbers = fullHex.replace('#', '');

			// Now we can parse it as hex
			return parseInt(numbers, 16);
		},

		/**
		 * http://stackoverflow.com/a/5624139
		 */
		rgbToHex: function(r, g, b) {
			if (typeof r === 'object') {
				b = r.b;
				g = r.g;
				r = r.r;
			}
			return '#' + this.rgbToHexInteger(r, g, b).toString(16).slice(1);
		},

		/**
		 * http://stackoverflow.com/a/5624139
		 */
		rgbToHexInteger: function(r, g, b) {
			if (typeof r === 'object') {
				b = r.b;
				g = r.g;
				r = r.r;
			}
			return (1 << 24) + (r << 16) + (g << 8) + b;
		},

		/**
		 * http://stackoverflow.com/a/5624139
		 */
		hexToRgb: function(hex) {
			hex = replaceShorthand(hex);

			var result = hexRegex.exec(hex);
			return result ? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			} : null;
		},

		/**
		 * 
		 */
		hexToValue: function(hex) {
			hex = replaceShorthand(hex);

			var result = hexRegex.exec(hex);
			return parseInt(result[1], 16) + parseInt(result[2], 16) + parseInt(result[3], 16);
		},

		/**
		 * Parses an rgb/rgba string into its component parts and returns them as an object.
		 */
		parseRgba: function(rgbString) {
			var result = /^rgba?\(\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\s*(?:,\s*([\d\.]+))?\)$/.exec(rgbString);
			if (result) {
				if (result[4] !== undefined) {
					return {
						r: parseInt(result[1]),
						g: parseInt(result[2]),
						b: parseInt(result[3]),
						a: parseFloat(result[4])
					};
				}
				else {
					return {
						r: parseInt(result[1]),
						g: parseInt(result[2]),
						b: parseInt(result[3])
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
		},

		/**
		 * Algorithm from http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
		 */
		darkenRgba: function(rgba, percent) {
			var type = typeof rgba;
			if (type !== 'object')
				rgba = this.toRgba(rgba);
			var amount = Math.round(255 * percent);
			rgba.r -= amount;
			rgba.g -= amount;
			rgba.b -= amount;
			if      (rgba.r > 255) rgba.r = 255;
			else if (rgba.r < 0)   rgba.r = 0;
			if      (rgba.g > 255) rgba.g = 255;
			else if (rgba.g < 0)   rgba.g = 0;
			if      (rgba.b > 255) rgba.b = 255;
			else if (rgba.b < 0)   rgba.b = 0;

			if (type === 'object')
				return rgba;
			else
				return 'rgba(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ',' + rgba.a + ')';
		},

		darkenHex: function(colorString, percent) {
			var rgba = this.toRgba(colorString, true);
			this.darkenRgba(rgba, percent);
			return this.rgbToHex(rgba.r, rgba.g, rgba.b);
		},

		lightenRgba: function(rgba, percent) {
			return this.darkenRgba(rgba, -percent);
		},

		lightenHex: function(colorString, percent) {
			return this.darkenHex(colorString, -percent);
		},

		interpolateRgba: function(rgba1, rgba2, t, rgba) {
			if (!rgba)
				rgba = {};

			rgba.r = Math.round((rgba1.r * t) + (rgba2.r * (1 - t)));
			rgba.g = Math.round((rgba1.g * t) + (rgba2.g * (1 - t)));
			rgba.b = Math.round((rgba1.b * t) + (rgba2.b * (1 - t)));
			if (rgba1.a !== undefined && rgba2.a !== undefined)
				rgba.a = Math.round((rgba1.a * t) + (rgba2.a * (1 - t)));

			return rgba;
		},

		interpolateHex: function(hex1, hex2, t) {
			var rgba = this.interpolateRgba(this.hexToRgb(hex1), this.hexToRgb(hex2), t);
			return this.rgbToHex(rgba);
		},

		interpolateHexInteger: function(int1, int2, t) {
			var b1 =  int1 & 255;
			var g1 = (int1 >> 8) & 255;
			var r1 = (int1 >> 16) & 255;

			var b2 =  int2 & 255;
			var g2 = (int2 >> 8) & 255;
			var r2 = (int2 >> 16) & 255;

			var r = Math.round((r1 * t) + (r2 * (1 - t)));
			var g = Math.round((g1 * t) + (g2 * (1 - t)));
			var b = Math.round((b1 * t) + (b2 * (1 - t)));

			return (1 << 24) + (r << 16) + (g << 8) + b;
		}
	};

	return Colors;
});

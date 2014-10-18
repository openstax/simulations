
define(function(require) {

	'use strict';

	var $ = require('jquery');

	require('../lib/wavelength');

	/**
	 * Draws the visible light spectrum to a canvas.  Interpolates
	 *   wavelength values from MIN_WAVELENGTH to MAX_WAVELENGTH
	 *   across the width of the element just like PhET in their
	 *   SSRWavelengthSlider class.
	 */
	$.fn.paintVisibleLightSpectrum = function() {
		return this.each(function() {
			if (!$(this).is('canvas'))
				return;

			var ctx = this.getContext('2d');

			var width  = $(this).width();
			var height = $(this).height();
			var percentage;
			var wavelength;
			var rgb;

			for (var i = 0; i < width; i++) {
				// Perform linear interpolation
				percentage = i / width;
				wavelength = Math.MIN_WAVELENGTH * (1 - percentage) + Math.MAX_WAVELENGTH * percentage;

				// Convert wavelength to rgb and apply to fill style
				rgb = Math.nmToRGB(wavelength);
				ctx.fillStyle = 'rgba(' + rgb.red + ',' + rgb.green + ',' + rgb.blue + ', 1)';
				ctx.fillRect(i, 0, 1, height);
			}

			return;
		});
	};

	return $;
});

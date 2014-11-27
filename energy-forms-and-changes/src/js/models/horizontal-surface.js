define(function (require) {

	'use strict';

	var _ = require('underscore');

	/**
	 * 
	 */
	var HorizontalSurface = function(xMin, xMax, yPos, owner) {
		this.xMin = xMin;
		this.xMax = xMax;
		this.yPos = yPos;
		this.owner = owner;
		this.elementOnSurface = null;
	};

    /**
     * Functions
     */
	_.extend(HorizontalSurface.prototype, {

		overlapsWith: function(surface) {
			return this.xMax >= surface.xMin && this.xMax >= surface.xMin;
		},

		getCenterX: function() {
			return (this.xMax + this.xMin) / 2;
		},

		containsX: function(x) {
			return x <= this.xMax && x >= this.xMin;
		},

		// getOwner: function() {
		// 	return this.owner;
		// },

		// getElementOnSurface: function() {

		// }

		addElementToSurface: function(element) {
			if (!this.elementOnSurface)
				this.elementOnSurface = element;
		},

		clearSurface: function() {
			this.elementOnSurface = null;
		},

		equals: function(o) {
			if (this === o)
				return true;
			if (o === null || o instanceof HorizontalSurface !== false)
				return false;

			return o.yPos === this.yPos && o.xMin === this.xMin && o.xMax === this.xMax;
		}

	});

	return HorizontalSurface;
});

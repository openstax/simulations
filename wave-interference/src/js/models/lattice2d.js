
// Maybe later I should make these little models node.js compatible too.

define([
	'underscore'
], function(_) {

	'use strict';

	var Lattice2D = function(options) {

		// Default values
		options = _.extend({
			initialValue: 0
		}, options);
		
		// Object properties
		this.data = options.data || []; // The lattice point values
		this.w = options.w || (options.data && options.data.length ? options.data[0].length : 60);
		this.h = options.h || (options.data ? options.data.length : 60);

		// Set initial value of lattice points
		if (!options.data) {
			var row, x, y;
			for (x = 0; x < this.w; x++) {
				row = [];
				for (y = 0; y < this.h; y++) {
					row.push(options.initialValue);
				}
				this.data.push(row);
			}
		}
		
	};

	/*
	 * I'm declaring some variables that exist in this function's scope so that
	 *   1) These functions aren't pushing and popping off the stack every time
	 *        they're called (and this is important because these functions are
	 *        called very frequently) and
	 *   2) I don't want to make them public properties on the object.
	 *
	 *                                                               -- Patrick
	 */

	var sum,
	    count,
	    i,
	    j,
	    clone,
	    row;

	_.extend(Lattice2D.prototype, {

		/**
		 * Finds the average value in a square sample space centered on the
		 *   specified (x,y) cooridnate. Sample size here is more like a 
		 *   radius in that it's half [- 1] of the square's side length.
		 */
		avg: function(x, y, sampleSize) {
			sum = 0.0;

			// In the PhET version, they generated the count by incrementing.
			count = Math.pow(2, (sampleSize * 2 + 1));

			for (i = x - sampleSize; i <= x + sampleSize; i++) {
				for (j = y - sampleSize; j <= y + sampleSize; j++) {
					sum += this.data[i][j];
				}
			}
			return sum / count;
		},

		/**
		 * This is my version of PhET's "copy" function, but their wave
		 *   simulation model was calling this every step, creating a
		 *   whole bunch of objects and arrays to be garbage collected,
		 *   so I'm only going to use this like three times and then
		 *   reuse them with my "copy" function down below.
		 */
		clone: function() {
			clone = this._deepCloneArray(this.data);

			return new Lattice2D({
				w: this.w,
				h: this.h,
				data: clone
			});
		},

		/**
		 * Used internally in a couple places
		 */
		_deepCloneArray: function(src) {
			clone = [];
			for (i = 0; i < src.length; i++) {
				row = [];
				for (j = 0; j < src[i].length; j++) {
					row.push(src[i][j]);
				}
				clone.push(row);
			}
			return clone;
		},

		/**
		 * This function copies the data from a source Lattice2D into
		 *   this Lattice2D. Forces it to change size if the source
		 *   is a different size.
		 */
		copy: function(source) {
			if (source.h != this.h || source.w != this.h) {
				/*
				 * If it changed size, we can't get around recreating
				 *   the whole array.
				 */
				this.w = source.w;
				this.h = source.h;
				this.data = this._deepCloneArray(source.data);
			}
			else {
				for (i = 0; i < this.w; i++) {
					for (j = 0; j < this.h; j++) {
						this.data[i][j] = source.data[i][j];
					}
				}
			}
		},

		/**
		 * Copies just a specified area from a source lattice to a 
		 *   specified area in this one.
		 */
		copyArea: function(source, w, h, srcOffsetX, srcOffsetY, dstOffsetX, dstOffsetY) {
			for (i = 0; i < w; i++) {
				for (j = 0; j < h; j++) {
					this.data[i + dstOffsetX][j + dstOffsetY] = source.data[i + srcOffsetX][j + srcOffsetY];
				}
			}
		},


	});

	return Lattice2D;
});
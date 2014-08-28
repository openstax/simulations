define(function (require) {

	'use strict';

	var _    = require('underscore');
	var PIXI = require('pixi');

	var SegmentPotentialView = function(options) {

		// Default values
		options = _.extend({
			
		}, options);

		if (options.segment)
			this.segment = options.segment;
		else
			throw 'SegmentPotentialView requires a Barrier model.';

		if (options.heatmapView)
			this.heatmapView = options.heatmapView;
		else
			throw 'SegmentPotentialView requires a HeatmapView to render.';
	};

	var segment,
	    xSpacing,
	    ySpacing,
	    halfYSpacing,
	    halfXSpacing,
	    height,
	    scaledNormal,
	    sX,
	    sY,
	    eX,
	    eY,
	    firstX,
	    firstY,
	    i,
	    j;

	_.extend(SegmentPotentialView.prototype, {

		render: function() {
			this.graphics = new PIXI.Graphics();
			this.graphics.alpha = 0;

			this.update(0, 0);

			this.heatmapView.stage.addChild(this.graphics);
		},

		remove: function() {
			this.heatmapView.stage.removeChild(this.graphics);
		},

		update: function(time, delta) {
			segment = this.segment;

			if (!segment.enabled)
				return;

				this.graphics.clear();

			if (this.graphics.alpha < 1)
				this.graphics.alpha += delta * 0.005;

			this.graphics.beginFill(0xFFFFFF, 0.5);
			this.graphics.lineStyle(2, 0xFFFFFF, 0.9);

			height = this.heatmapView.waveSimulation.lattice.height;

			xSpacing = this.heatmapView.xSpacing;
			ySpacing = this.heatmapView.ySpacing;
			halfYSpacing = ySpacing / 2.0;
			halfXSpacing = xSpacing / 2.0;

			/*
			 * I'm using the normal vector and thickness to paint lines
			 *   around the four corners of the rectangle that surrounds
			 *   at the appropriate thickness.
			 * Each offset vector is the sum of two vectors that are
			 *   derrived from the scaled normal vector.
			 */

			scaledNormal = segment.getNormalUnitVector();
			scaledNormal.x *= (segment.thickness / 2.0) * xSpacing;
			scaledNormal.y *= (segment.thickness / 2.0) * ySpacing * -1;
			i = scaledNormal.x;
			j = scaledNormal.y;

			sX = segment.start.x * xSpacing - halfXSpacing;
			sY = (height - segment.start.y) * ySpacing - halfYSpacing;
			eX = segment.end.x * xSpacing - halfXSpacing;
			eY = (height - segment.end.y) * ySpacing - halfYSpacing;

			firstX = sX - i - j;
			firstY = sY + i - j;

			this.graphics.moveTo(firstX, firstY);
			this.graphics.lineTo(sX - j + i, sY + i + j);
			this.graphics.lineTo(eX + j + i, eY - i + j);
			this.graphics.lineTo(eX + j - i, eY - i - j);
			this.graphics.lineTo(firstX, firstY);	
		}

	});

	return SegmentPotentialView;
});

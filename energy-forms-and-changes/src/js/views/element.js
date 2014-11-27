define(function(require) {

	'use strict';

	var _    = require('underscore');
	var PIXI = require('pixi');

	var PixiView       = require('common/pixi/view');
	var PiecewiseCurve = require('common/math/piecewise-curve');

	/**
	 * A view that represents an element model
	 */
	var ElementView = PixiView.extend({

		/**
		 *
		 */
		initialize: function(options) {
			
		},

		update: function(time, deltaTime) {},

		showEnergyChunks: function() {},

		hideEnergyChunks: function() {},

		createSpriteFromLines: function(lines, style) {
			if (lines.length === 0)
				return new PIXI.Sprite();

			if (!_.isArray(lines[0]))
				lines = [ lines ];

			_.extend({
				lineWidth: 1,
				strokeStyle: '#000',
				lineJoin: 'miter'
			}, style || {});

			// Determine the bounds for all the points
			var curve = PiecewiseCurve.fromPointArrays(lines);
			var bounds = curve.getBounds();

			// Determine if we need to shift the points to fit within the bounds
			var xShift = 0 - bounds.x;
			var yShift = 0 - bounds.y;

			xShift += style.lineWidth;
			yShift += style.lineWidth;

			// Draw the lines
			var canvas = document.createElement('canvas');
			canvas.width  = bounds.w + (2 * style.lineWidth);
			canvas.height = bounds.h + (2 * style.lineWidth);

			var ctx = canvas.getContext('2d');

			ctx.lineWidth   = style.lineWidth;
			ctx.strokeStyle = style.strokeStyle;
			ctx.lineJoin    = style.lineJoin;
			
			_.each(lines, function(line) {
				ctx.beginPath();

				ctx.moveTo(line[0].x + xShift, line[0].y + yShift);
				for (var i = 1; i < line.length; i++)
					ctx.lineTo(line[i].x + xShift, line[i].y + yShift);

				ctx.closePath();
				ctx.stroke();
			});

			// Create the sprite and shift the anchor proportionally to the shift
			var sprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(canvas));
			sprite.anchor.x = xShift / sprite.width;
			sprite.anchor.y = yShift / sprite.height;

			return sprite;
		},

		createMaskedSprite: function(maskingPoints, texture) {
			/*
			 * The masking points are not necessarily within the bounds of 
			 *   the texture, so we need to calculate the bounding box for
			 *   the masking points, scale the texture to fit those bounds,
			 *   shift all the points down to where the texture is so it
			 *   can be masked correctly, and then shift the sprite that
			 *   holds the texture to the origin of the bounding box of the
			 *   masking points to place it in its rightful location.
			 */

			// Calculate the bounding box for the masking points
			var curve = PiecewiseCurve.fromPoints(maskingPoints);
			var bounds = curve.getBounds();

			// Ratio for scaling the texture to the size of the bounds
			var xScale = bounds.w / texture.width;
			var yScale = bounds.h / texture.height;

			// Calculate the offset for taking the mask to the texture
			var xShift = 0 - bounds.x;
			var yShift = 0 - bounds.y;

			// Create the mask shape
			var mask = new PIXI.Graphics();
			mask.lineStyle(0);
			mask.beginFill(0x8bc5ff, 0.4);

			// Draw the masking points shifted
			mask.moveTo(maskingPoints[0].x + xShift, maskingPoints[0].y + yShift);
			for (var i = 0; i < maskingPoints.length; i++)
				mask.lineTo(maskingPoints[i].x + xShift, maskingPoints[i].y + yShift);

			// Create a sprite with the texture, scaled to the size of the bounds
			var sprite = new PIXI.Sprite(texture);
			sprite.scale.x = xScale;
			sprite.scale.y = yScale;

			// Apply the mask
			sprite.mask = mask;

			// Shift the sprite back to where the masking points are supposed to be
			sprite.x = bounds.x;
			sprite.y = bounds.y;

			return sprite;
		}

	});

	return ElementView;
});
define(function(require) {

	'use strict';

	var _    = require('underscore');
	var PIXI = require('pixi');

	var PixiView = require('common/pixi/view');

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
			var minX = Number.POSITIVE_INFINITY;
			var minY = Number.POSITIVE_INFINITY;
			var maxX = Number.NEGATIVE_INFINITY;
			var maxY = Number.NEGATIVE_INFINITY;

			for (var i = 0; i < lines.length; i++) {
				for (var j = 0; j < lines[i].length; j++) {
					if (lines[i][j].x < minX)
						minX = lines[i][j].x;

					if (lines[i][j].x > maxX)
						maxX = lines[i][j].x;

					if (lines[i][j].y < minY)
						minY = lines[i][j].y;

					if (lines[i][j].y > maxY)
						maxY = lines[i][j].y;
				}
			}

			var width  = maxX - minX;
			var height = maxY - minY;

			// Determine if we need to shift the points to fit within the bounds
			var xShift = 0;
			var yShift = 0;

			if (minX < 0)
				xShift = 0 - minX;
			else if (maxX > width)
				xShift = width - maxX;

			if (minY < 0)
				yShift = 0 - minY;
			else if (maxY > height)
				yShift = height - maxY;

			xShift += style.lineWidth;
			yShift += style.lineWidth;

			// Draw the lines
			var canvas = document.createElement('canvas');
			canvas.width  = width + (2 * style.lineWidth);
			canvas.height = height + (2 * style.lineWidth);

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
			var mask = new PIXI.Graphics();
			mask.lineStyle(0);
			mask.beginFill(0x8bc5ff, 0.4);

			mask.moveTo(maskingPoints[0].x, maskingPoints[0].y);

			for (var i = 0; i < maskingPoints.length; i++) {
				mask.lineTo(maskingPoints[i].x, maskingPoints[i].y);
			}

			var sprite = new PIXI.Sprite(texture);
			sprite.mask = mask;
			return sprite;
		}

	});

	return ElementView;
});
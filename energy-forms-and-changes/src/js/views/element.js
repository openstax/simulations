define(function(require) {

	'use strict';

	var _    = require('underscore');
	var PIXI = require('pixi');

	var PixiView       = require('common/pixi/view');
	var Colors         = require('common/colors/colors');
	var PiecewiseCurve = require('common/math/piecewise-curve');
	var Constants      = require('constants');

	/**
	 * A view that represents an element model
	 */
	var ElementView = PixiView.extend({

		/**
		 *
		 */
		initialize: function(options) {
			this.mvt = options.mvt;
			this.fillColor = options.fillColor;
			this.fillAlpha = options.fillAlpha !== undefined ? options.fillAlpha : 1;
			this.lineWidth = options.lineWidth !== undefined ? options.lineWidth : 3;
			this.lineColor = options.lineColor || '#444444';
			this.lineJoin  = options.lineJoin  || 'round';
			this.textColor = options.textColor || '#000000';
			this.textFont  = options.textFont  || ElementView.TEXT_FONT;
			this.labelText = options.labelText || '';

			if (this.fillColor === undefined)
				this.fillColor = 0x000000;
			else if (_.isString(this.fillColor))
				this.fillColor =  Colors.parseHex(options.fillColor);
		},

		update: function(time, deltaTime) {},

		showEnergyChunks: function() {},

		hideEnergyChunks: function() {},

		createOutlineFromPointArrays: function(pointArrays, style) {
			if (pointArrays.length === 0)
				return new PIXI.Sprite();

			if (!_.isArray(pointArrays[0]))
				pointArrays = [ pointArrays ];

			_.extend({
				lineWidth: 1,
				strokeStyle: '#000',
				lineJoin: 'miter'
			}, style || {});

			// Determine the bounds for all the points
			var curve = PiecewiseCurve.fromPointArrays(pointArrays);
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
			
			_.each(pointArrays, function(points) {
				ctx.beginPath();

				ctx.moveTo(points[0].x + xShift, points[0].y + yShift);
				for (var i = 1; i < points.length; i++)
					ctx.lineTo(points[i].x + xShift, points[i].y + yShift);

				ctx.closePath();
				ctx.stroke();
			});

			// Create the sprite and shift the anchor proportionally to the shift
			var sprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(canvas));
			sprite.anchor.x = xShift / sprite.width;
			sprite.anchor.y = yShift / sprite.height;

			return sprite;
		},

		createTexturedPolygonFromPoints: function(maskingPoints, texture) {
			/*
			 * The masking points are not necessarily within the bounds of 
			 *   the texture, so we need to calculate the bounding box for
			 *   the masking points, scale the texture to fit those bounds,
			 *   create a masking shape with the points, and then shift 
			 *   the sprite that holds the texture to the origin of the 
			 *   bounding box of the masking points to place it in its 
			 *   rightful location.
			 */

			// Calculate the bounding box for the masking points
			var curve = PiecewiseCurve.fromPoints(maskingPoints);
			var bounds = curve.getBounds();

			// Ratio for scaling the texture to the size of the bounds
			var xScale = bounds.w / texture.width;
			var yScale = bounds.h / texture.height;

			// Create the mask shape
			var mask = new PIXI.Graphics();
			mask.lineStyle(0);
			mask.beginFill(0x000000, 1);
			this.displayObject.addChild(mask);

			// Draw the masking points shifted
			mask.moveTo(maskingPoints[0].x, maskingPoints[0].y);
			for (var i = 1; i < maskingPoints.length; i++)
				mask.lineTo(maskingPoints[i].x, maskingPoints[i].y);

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
		},

		createColoredPolygonFromPoints: function(points, color, alpha) {
			var graphics = new PIXI.Graphics();
			graphics.lineStyle(0);
			graphics.beginFill(color, (alpha === undefined) ? 1 : alpha);

			graphics.moveTo(points[0].x, points[0].y);
			for (var i = 1; i < points.length; i++)
				graphics.lineTo(points[i].x, points[i].y);
			
			return graphics;
		}

	}, Constants.ElementView);

	return ElementView;
});
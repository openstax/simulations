define(function(require) {

	'use strict';

	var _    = require('underscore');
	var PIXI = require('pixi');
	

	var PixiView       = require('common/pixi/view');
	var Colors         = require('common/colors/colors');
	var PiecewiseCurve = require('common/math/piecewise-curve');
	var Rectangle      = require('common/math/rectangle');
	var Vector2        = require('common/math/vector2');

	var Constants      = require('constants');

	var defaultMovementConstraintBounds = new Rectangle(
		Number.NEGATIVE_INFINITY,
		Number.NEGATIVE_INFINITY,
		Number.POSITIVE_INFINITY,
		Number.POSITIVE_INFINITY
	);

	/**
	 * A view that represents an element model
	 */
	var ElementView = PixiView.extend({

		events: {
			'touchstart      .displayObject': 'dragStart',
			'mousedown       .displayObject': 'dragStart',
			'touchmove       .displayObject': 'drag',
			'mousemove       .displayObject': 'drag',
			'touchend        .displayObject': 'dragEnd',
			'mouseup         .displayObject': 'dragEnd',
			'touchendoutside .displayObject': 'dragEnd',
			'mouseupoutside  .displayObject': 'dragEnd',
		},

		/**
		 *
		 */
		initialize: function(options) {
			options = _.extend({
				fillAlpha: 1,
				lineWidth: 3,
				lineColor: '#444444',
				lineJoin:  'round',
				textColor: '#000000',
				textFont:  ElementView.TEXT_FONT,
				labelText: '',
			}, options);

			this.mvt = options.mvt;

			this.movable = options.movable || false;
			this.movementConstraintBounds = options.movementConstraintBounds || defaultMovementConstraintBounds;
			this.movementConstraint = options.movementConstraint || function() { return true; };

			this.fillColor = options.fillColor;
			this.fillAlpha = options.fillAlpha;
			this.lineWidth = options.lineWidth;
			this.lineColor = options.lineColor;
			this.lineJoin  = options.lineJoin;
			this.textColor = options.textColor;
			this.textFont  = options.textFont;
			this.labelText = options.labelText;

			if (this.fillColor === undefined)
				this.fillColor = 0x000000;
			else if (_.isString(this.fillColor))
				this.fillColor =  Colors.parseHex(options.fillColor);

			// To give some feedback on the cursor
			if (this.movable)
				this.displayObject.buttonMode = true;

			this._dragBounds = new Rectangle();
			this._dragOffset = new PIXI.Point();
			this._newPosition = new Vector2();
		},

		calculateDragBounds: function(dx, dy) {
			var bounds = this.displayObject.getBounds();
			return this._dragBounds.set(
				bounds.x + dx,
				bounds.y + dy,
				bounds.width,
				bounds.height
			);
		},

		dragStart: function(data) {
			this.dragOffset = data.getLocalPosition(this.displayObject, this._dragOffset);
			this.dragging = true;
			this.model.set('userControlled', true);
		},

		drag: function(data) {
			if (this.dragging) {
				var dx = data.global.x - this.displayObject.x - this.dragOffset.x;
				var dy = data.global.y - this.displayObject.y - this.dragOffset.y;
				
				var newBounds = this.calculateDragBounds(dx, dy);
				var constraintBounds = this.movementConstraintBounds;

				if (!constraintBounds.contains(newBounds)) {
					var overflowLeft   = constraintBounds.left() - newBounds.left();
					var overflowRight  = newBounds.right() - constraintBounds.right();
					var overflowTop    = constraintBounds.bottom() - newBounds.bottom();
					var overflowBottom = newBounds.top() - constraintBounds.top();

					// Backtrack if we need to
					if (overflowLeft > 0)
						dx += overflowLeft;
					else if (overflowRight > 0)
						dx -= overflowRight;

					if (overflowTop > 0)
						dy += overflowTop;
					else if (overflowBottom > 0)
						dy -= overflowBottom;
				}

				dx = this.mvt.viewToModelDeltaX(dx);
				dy = this.mvt.viewToModelDeltaY(dy);

				var newPosition = this._newPosition
					.set(this.model.get('position'))
					.add(dx, dy);

				var validatedPosition = this.movementConstraint(this.model, newPosition);
					this.model.setPosition(validatedPosition);

				this.dragX = data.global.x;
				this.dragY = data.global.y;
			}
		},

		dragEnd: function(data) {
			this.dragging = false;
			this.dragData = null;
			this.model.set('userControlled', false);
		},

		update: function(time, deltaTime) {

		},

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
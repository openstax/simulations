define(function(require) {

	'use strict';

	var _       = require('underscore');
	var PIXI    = require('pixi');
	var Vector2 = require('vector2-node');

	var PixiView = require('common/pixi/view');
	var Block    = require('models/element/block');

	var Constants = require('constants');

	/**
	 * A view that represents a block model
	 */
	var BlockView = PixiView.extend({

		/**
		 *
		 */
		initialize: function(options) {
			this.mvt = options.mvt;

			this.listenTo(this.model, 'change:position', this.updatePosition);

			this.initGraphics();

			this.updatePosition(this.model, this.model.get('position'));
		},

		initGraphics: function() {

			this.outlineFront = new PIXI.DisplayObjectContainer();
			this.outlineBack  = new PIXI.DisplayObjectContainer();

			this.displayObject.addChild(this.outlineBack);
			this.displayObject.addChild(this.outlineFront);
			
			var rect = this.mvt.modelToViewScale(Block.getRawShape());
			var perspectiveEdgeSize = this.mvt.modelToViewDeltaX(this.model.getRect().w * Constants.PERSPECTIVE_EDGE_PROPORTION);

			var blockFaceOffset  = (new Vector2(-perspectiveEdgeSize / 2, 0)).rotate(-Constants.PERSPECTIVE_ANGLE);
			var backCornerOffset = (new Vector2(perspectiveEdgeSize,      0)).rotate(-Constants.PERSPECTIVE_ANGLE);

			// Front face
			var lowerLeftFrontCorner  = (new Vector2(rect.left(),   rect.bottom())).add(blockFaceOffset);
			var lowerRightFrontCorner = (new Vector2(rect.right(),  rect.bottom())).add(blockFaceOffset);
			var upperRightFrontCorner = (new Vector2(rect.right(), -rect.top()   )).add(blockFaceOffset);
			var upperLeftFrontCorner  = (new Vector2(rect.left(),  -rect.top()   )).add(blockFaceOffset);

			// var frontFaceShape = new PIXI.Rectangle(
			// 	lowerLeftFrontCorner.x,
			// 	upperLeftFrontCorner.x,
			// 	rect.w,
			// 	rect.h
			// );
			var frontFacePoints = [
				lowerLeftFrontCorner,
				lowerRightFrontCorner,
				upperRightFrontCorner,
				upperLeftFrontCorner,
				lowerLeftFrontCorner
			];
			var frontFaceShape = this._createPolygon(frontFacePoints);

			// Top face
			var upperLeftBackCorner  = upperLeftFrontCorner.clone().add(backCornerOffset);
			var upperRightBackCorner = upperRightFrontCorner.clone().add(backCornerOffset);

			var topFacePoints = [
				upperLeftFrontCorner,
				upperRightFrontCorner,
				upperRightBackCorner,
				upperLeftBackCorner,
				upperLeftFrontCorner
			];
			var topFaceShape = this._createPolygon(topFacePoints);

			// Side face
			var lowerRightBackCorner = lowerRightFrontCorner.clone().add(backCornerOffset);

			var sideFacePoints = [
				upperRightFrontCorner,
				lowerRightFrontCorner,
				lowerRightBackCorner,
				upperRightBackCorner,
				upperRightFrontCorner
			];
			var sideFaceShape = this._createPolygon(sideFacePoints);

			// Front outline
			var lineStyle = {
				lineWidth: 4,
				strokeStyle: '#444',
				lineJoin: 'round'
			};
			var lines = [frontFacePoints, topFacePoints, sideFacePoints];
			this.outlineFront.addChild(this.renderLinesAsSprite(lines, lineStyle));

			// Back outline
			var lowerLeftBackCorner = lowerLeftFrontCorner.clone().add(backCornerOffset);

			lines = [[
				lowerLeftBackCorner,
				lowerRightBackCorner
			],[
				lowerLeftBackCorner,
				lowerLeftFrontCorner
			],[
				lowerLeftBackCorner,
				upperLeftBackCorner
			]];
			this.outlineBack.addChild(this.renderLinesAsSprite(lines, lineStyle));

			var origin = new PIXI.Graphics();
			origin.beginFill(0xFF0000, 1);
			origin.drawCircle(0, 0, 3);
			origin.endFill();
			this.displayObject.addChild(origin);

			var top = new PIXI.Graphics();
			top.beginFill(0x0000FF, 1);
			top.drawCircle(0, this.mvt.modelToViewDeltaY(this.model.topSurface.yPos - this.model.get('position').y), 3);
			top.endFill();
			this.displayObject.addChild(top);

			// _.each(frontFacePoints, function(point) {
			// 	var dot = new PIXI.Graphics();
			// 	dot.beginFill(0x00FF00, 1);
			// 	dot.drawCircle(point.x, point.y, 3);
			// 	dot.endFill();
			// 	this.displayObject.addChild(dot);
			// }, this);
		},

		renderLinesAsSprite: function(lines, style) {
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

		_createPolygon: function(points) {
			var flattened = [];
			_.each(points, function(point) {
				flattened.push(point.x);
				flattened.push(point.y);
			});
			return new PIXI.Polygon(flattened);
		},

		updatePosition: function(model, position) {
			var viewPoint = this.mvt.modelToView(position);
			this.displayObject.x = viewPoint.x;
			this.displayObject.y = viewPoint.y;
		}

	});

	return BlockView;
});
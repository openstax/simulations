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
			var lowerLeftFrontCorner  = (new Vector2(rect.left(),  rect.bottom())).add(blockFaceOffset);
			var lowerRightFrontCorner = (new Vector2(rect.right(), rect.bottom())).add(blockFaceOffset);
			var upperRightFrontCorner = (new Vector2(rect.right(), rect.top()   )).add(blockFaceOffset);
			var upperLeftFrontCorner  = (new Vector2(rect.left(),  rect.top()   )).add(blockFaceOffset);

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
			this.outlineFront.addChild(new PIXI.Sprite(this.renderLinesAsTexture(lines, 200, 200, lineStyle)));

			// Back outline
			var lowerLeftBackCorner = lowerLeftFrontCorner.clone().add(backCornerOffset);

			// this.outlineBack.drawShape(this._createPolygon([
			// 	lowerLeftBackCorner,
			// 	lowerRightBackCorner
			// ]));
			// this.outlineBack.drawShape(this._createPolygon([
			// 	lowerLeftBackCorner,
			// 	lowerLeftFrontCorner
			// ]));
			// this.outlineBack.drawShape(this._createPolygon([
			// 	lowerLeftBackCorner,
			// 	upperLeftBackCorner
			// ]));
		},

		renderLinesAsTexture: function(lines, canvasWidth, canvasHeight, style) {
			var canvas = document.createElement('canvas');
			canvas.width  = canvasWidth;
			canvas.height = canvasHeight;

			style = style || {};

			var ctx = canvas.getContext('2d');

			ctx.lineWidth   = style.lineWidth || 1;
			ctx.strokeStyle = style.strokeStyle || '#000';
			ctx.lineJoin    = style.lineJoin || 'miter';

			if (lines.length > 0) {
				if (!_.isArray(lines[0]))
					lines = [ lines ];

				_.each(lines, function(line) {
					ctx.beginPath();
					
					ctx.moveTo(line[0].x, line[0].y);

					for (var i = 1; i < line.length; i++) {
						ctx.lineTo(line[i].x, line[i].y);
					}

					ctx.closePath();

					ctx.stroke();
				});
			}

			return new PIXI.Texture.fromCanvas(canvas);
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
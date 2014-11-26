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

			this.outlineFront = new PIXI.Graphics();
			this.outlineBack  = new PIXI.Graphics();

			this.displayObject.addChild(this.outlineBack);
			this.displayObject.addChild(this.outlineFront);

			this.outlineFront.lineStyle(2, '#000', 1);
			
			var rect = this.mvt.modelToViewScale(Block.getRawShape());
			var perspectiveEdgeSize = this.mvt.modelToViewDeltaX(this.model.getRect().w * Constants.PERSPECTIVE_EDGE_PROPORTION);

			var blockFaceOffset  = (new Vector2(-perspectiveEdgeSize / 2, 0)).rotate(-Constants.PERSPECTIVE_ANGLE);
			var backCornerOffset = (new Vector2(perspectiveEdgeSize,      0)).rotate(-Constants.PERSPECTIVE_ANGLE);

			// Front face
			var lowerLeftFrontCorner  = (new Vector2(rect.left(),  rect.bottom()   )).add(blockFaceOffset);
			var lowerRightFrontCorner = (new Vector2(rect.right(), rect.bottom()   )).add(blockFaceOffset);
			var upperRightFrontCorner = (new Vector2(rect.right(), rect.top())).add(blockFaceOffset);
			var upperLeftFrontCorner  = (new Vector2(rect.left(),  rect.top())).add(blockFaceOffset);

			var frontFaceShape = new PIXI.Rectangle(
				lowerLeftFrontCorner.x,
				upperLeftFrontCorner.x,
				rect.w,
				rect.h
			);

			// Top face
			var upperLeftBackCorner  = upperLeftFrontCorner.clone().add(backCornerOffset);
			var upperRightBackCorner = upperRightFrontCorner.clone().add(backCornerOffset);

			var topFaceShape = this._createPolygon([
				upperLeftFrontCorner,
				upperRightFrontCorner,
				upperRightBackCorner,
				upperLeftBackCorner,
				upperLeftFrontCorner
			]);

			// Side face
			var lowerRightBackCorner = lowerRightFrontCorner.clone().add(backCornerOffset);

			var sideFaceShape = this._createPolygon([
				upperRightFrontCorner,
				lowerRightFrontCorner,
				lowerRightBackCorner,
				upperRightBackCorner,
				upperRightFrontCorner
			]);

			// Front outline
			this.outlineFront.drawShape(frontFaceShape);
			this.outlineFront.drawShape(topFaceShape);
			this.outlineFront.drawShape(sideFaceShape);

			// Back outline
			var lowerLeftBackCorner = lowerLeftFrontCorner.clone().add(backCornerOffset);

			this.outlineBack.drawShape(this._createPolygon([
				lowerLeftBackCorner,
				lowerRightBackCorner
			]));
			this.outlineBack.drawShape(this._createPolygon([
				lowerLeftBackCorner,
				lowerLeftFrontCorner
			]));
			this.outlineBack.drawShape(this._createPolygon([
				lowerLeftBackCorner,
				upperLeftBackCorner
			]));
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
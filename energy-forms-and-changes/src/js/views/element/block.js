define(function(require) {

	'use strict';

	//var _       = require('underscore');
	var PIXI    = require('pixi');
	var Vector2 = require('common/math/vector2');
	var PiecewiseCurve = require('common/math/piecewise-curve');

	var ElementView = require('views/element');
	var Block       = require('models/element/block');
	//var Assets      = require('assets');

	var Constants = require('constants');

	/**
	 * A view that represents a block model
	 */
	var BlockView = ElementView.extend({

		/**
		 *
		 */
		initialize: function(options) {
			options = _.extend({
                movable: true
            }, options);

			ElementView.prototype.initialize.apply(this, [options]);

			this.initGraphics();
		},

		initGraphics: function() {

			this.outlineBack  = new PIXI.DisplayObjectContainer();
			this.faces        = new PIXI.DisplayObjectContainer();
			this.outlineFront = new PIXI.DisplayObjectContainer();

			this.displayObject.addChild(this.outlineBack);
			this.displayObject.addChild(this.faces);
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

			var frontFacePoints = [
				lowerLeftFrontCorner,
				lowerRightFrontCorner,
				upperRightFrontCorner,
				upperLeftFrontCorner,
				lowerLeftFrontCorner
			];
			this.faces.addChild(this.createFrontFace(frontFacePoints));

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
			this.faces.addChild(this.createTopFace(topFacePoints));

			// Side face
			var lowerRightBackCorner = lowerRightFrontCorner.clone().add(backCornerOffset);

			var rightFacePoints = [
				upperRightFrontCorner,
				lowerRightFrontCorner,
				lowerRightBackCorner,
				upperRightBackCorner,
				upperRightFrontCorner
			];
			this.faces.addChild(this.createRightFace(rightFacePoints));

			// Front outline
			var lineStyle = {
				lineWidth: this.lineWidth,
				strokeStyle: this.lineColor,
				lineJoin: 'bevel'
			};
			var pointArrays = [frontFacePoints, topFacePoints, rightFacePoints];
			this.outlineFront.addChild(this.createShapeFromPointArrays(pointArrays, lineStyle));

			// Back outline
			var lowerLeftBackCorner = lowerLeftFrontCorner.clone().add(backCornerOffset);

			pointArrays = [[
				lowerLeftBackCorner,
				lowerRightBackCorner
			],[
				lowerLeftBackCorner,
				lowerLeftFrontCorner
			],[
				lowerLeftBackCorner,
				upperLeftBackCorner
			]];
			this.outlineBack.addChild(this.createShapeFromPointArrays(pointArrays, lineStyle));

			this.outlineBack.visible = false;

			// Label
			this.label = new PIXI.Text(this.labelText, {
				font: this.textFont,
				fill: this.textColor
			});
			this.label.anchor.x = this.label.anchor.y = 0.5;
			this.label.x = blockFaceOffset.x;
			this.label.y = -(rect.h / 2) + blockFaceOffset.y;
			this.displayObject.addChild(this.label);


			// Calculate the bounding box for the dragging bounds
			var outline = PiecewiseCurve.fromPointArrays(pointArrays);
			this.boundingBox = outline.getBounds().clone();
			this.boundingBox.x -= (this.lineWidth / 2);
			this.boundingBox.y -= (this.lineWidth / 2);
			this.boundingBox.w += this.lineWidth;
			this.boundingBox.h += (this.lineWidth / 2) - blockFaceOffset.y;

			// Just for debugging
			//this.renderTopCenterPoint();
			//this.renderBottomCenterPoint();
		},

		createFrontFace: function(points) {
			return this.createColoredPolygonFromPoints(points, this.fillColor, this.fillAlpha);
		},

		createTopFace: function(points) {
			return this.createColoredPolygonFromPoints(points, this.fillColor, this.fillAlpha);
		},

		createRightFace: function(points) {
			return this.createColoredPolygonFromPoints(points, this.fillColor, this.fillAlpha);
		},

		/**
		 * For debugging purposes
		 */
		renderTopCenterPoint: function() {
			var top = new PIXI.Graphics();
			top.beginFill(0x0000FF, 1);
			top.drawCircle(0, this.mvt.modelToViewDeltaY(this.model.topSurface.yPos - this.model.get('position').y), 3);
			top.endFill();
			this.displayObject.addChild(top);
		},

		/**
		 * For debugging purposes
		 */
		renderBottomCenterPoint: function() {
			var origin = new PIXI.Graphics();
			origin.beginFill(0xFF0000, 1);
			origin.drawCircle(0, 0, 3);
			origin.endFill();
			this.displayObject.addChild(origin);
		},

		calculateDragBounds: function(dx, dy) {
			return this._dragBounds
				.set(this.boundingBox)
				.translate(this.displayObject.x + dx, this.displayObject.y + dy);
		},

		updatePosition: function(model, position) {
			var viewPoint = this.mvt.modelToView(position);
			this.displayObject.x = viewPoint.x;
			this.displayObject.y = viewPoint.y;
		},

		showEnergyChunks: function() {
			this.outlineBack.visible = true;
			this.faces.alpha = 0.5;
			this.label.alpha = 0.5;
		},

		hideEnergyChunks: function() {
			this.outlineBack.visible = false;
			this.faces.alpha = 1;
			this.label.alpha = 1;
		},

		update: function(time, deltaTime) {}

	});

	return BlockView;
});
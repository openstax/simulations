define(function(require) {

	'use strict';

	//var _       = require('underscore');
	var PIXI    = require('pixi');
	var Vector2 = require('vector2-node');

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
			this.mvt = options.mvt;

			this.listenTo(this.model, 'change:position', this.updatePosition);

			this.initGraphics();

			this.updatePosition(this.model, this.model.get('position'));
		},

		initGraphics: function() {

			this.outlineFront = new PIXI.DisplayObjectContainer();
			this.faces        = new PIXI.DisplayObjectContainer();
			this.outlineBack  = new PIXI.DisplayObjectContainer();

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
			this.faces.addChild(this.createMaskedSprite(frontFacePoints, Assets.Texture(Assets.Images.BRICK_TEXTURE_FRONT)));

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
			this.faces.addChild(this.createMaskedSprite(topFacePoints, Assets.Texture(Assets.Images.BRICK_TEXTURE_TOP)));

			// Side face
			var lowerRightBackCorner = lowerRightFrontCorner.clone().add(backCornerOffset);

			var sideFacePoints = [
				upperRightFrontCorner,
				lowerRightFrontCorner,
				lowerRightBackCorner,
				upperRightBackCorner,
				upperRightFrontCorner
			];
			this.faces.addChild(this.createMaskedSprite(sideFacePoints, Assets.Texture(Assets.Images.BRICK_TEXTURE_RIGHT)));

			// Front outline
			var lineStyle = {
				lineWidth: 3,
				strokeStyle: '#444',
				lineJoin: 'round'
			};
			var lines = [frontFacePoints, topFacePoints, sideFacePoints];
			this.outlineFront.addChild(this.createSpriteFromLines(lines, lineStyle));

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
			this.outlineBack.addChild(this.createSpriteFromLines(lines, lineStyle));

			this.outlineBack.visible = false;

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

		updatePosition: function(model, position) {
			var viewPoint = this.mvt.modelToView(position);
			this.displayObject.x = viewPoint.x;
			this.displayObject.y = viewPoint.y;
		},

		showEnergyChunks: function() {
			this.outlineBack.visible = true;
			this.faces.alpha = 0.5;
		},

		hideEnergyChunks: function() {
			this.outlineBack.visible = false;
			this.faces.alpha = 1;
		},

	});

	return BlockView;
});
define(function(require) {

	'use strict';

	var BlockView = require('views/element/block');
	var Assets    = require('assets');

	/**
	 * A view that represents a brick model
	 */
	var BrickView = BlockView.extend({

		createFrontFace: function(points) {
			return this.createTexturedPolygonFromPoints(points, Assets.Texture(Assets.Images.BRICK_TEXTURE_FRONT));
		},

		createTopFace: function(points) {
			return this.createTexturedPolygonFromPoints(points, Assets.Texture(Assets.Images.BRICK_TEXTURE_TOP));
		},

		createRightFace: function(points) {
			return this.createTexturedPolygonFromPoints(points, Assets.Texture(Assets.Images.BRICK_TEXTURE_RIGHT))
		}

	});

	return BrickView;
});
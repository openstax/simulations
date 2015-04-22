define(function(require) {

	'use strict';

	var _    = require('underscore');
	var PIXI = require('pixi');

	var PixiView = require('common/pixi/view');
	var Colors   = require('common/colors/colors');

	var Assets = require('assets');

	/**
	 * A view that represents a heavenly body.
	 */
	var BodyView = PixiView.extend({

		/**
		 *
		 */
		initialize: function(options) {

			var haloTexture = this._generateHaloTexture(120, 32, '#fff');
			var haloSprite = new PIXI.Sprite(haloTexture);
			haloSprite.anchor.x = 0.5;
			haloSprite.anchor.y = 0.5;
			this.displayObject.addChild(haloSprite);

			var planetSprite = Assets.createSprite(Assets.Images.EARTH);
			planetSprite.anchor.x = 0.5;
			planetSprite.anchor.y = 0.5;
			this.displayObject.addChild(planetSprite);

			this.displayObject.position.x = 400;
			this.displayObject.position.y = 200;
		},

		/**
		 *
		 */
		_generateHaloTexture: function(baseRadius, haloThickness, color) {
			var paddedRadius = baseRadius + haloThickness;

			// Draw on a canvas and then use it as a texture for our particles
			var canvas = document.createElement('canvas');
			canvas.width  = paddedRadius * 2;
			canvas.height = paddedRadius * 2;

			var rgba = Colors.toRgba(color, true);

			var ctx = canvas.getContext('2d');

			var gradient = ctx.createRadialGradient(paddedRadius, paddedRadius, baseRadius, paddedRadius, paddedRadius, paddedRadius);
			gradient.addColorStop(0, 'rgba(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ',1)');
			gradient.addColorStop(1, 'rgba(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ',0)');

			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			return new PIXI.Texture.fromCanvas(canvas);
		},

		update: function(time, delta) {
			this.displayObject.rotation += delta * 0.0001;
		}

	});

	return BodyView;
});
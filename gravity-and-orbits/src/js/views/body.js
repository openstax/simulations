define(function(require) {

	'use strict';

	var _    = require('underscore');
	var PIXI = require('pixi');

	var PixiView = require('common/pixi/view');

	/**
	 * A view that represents a heavenly body.
	 */
	var BodyView = PixiView.extend({

		/**
		 *
		 */
		initialize: function(options) {
			var planetSprite = PIXI.Sprite.fromImage('img/phet/earth_satellite.gif');
			planetSprite.anchor.x = 0.5;
			planetSprite.anchor.y = 0.5;
			this.displayObject.addChild(planetSprite);
			this.displayObject.position.x = 400;
			this.displayObject.position.y = 200;
		},

		/**
		 *
		 */
		generateHaloTexture: function() {
			// Draw on a canvas and then use it as a texture for our particles
			var canvas = document.createElement('canvas');
			canvas.width  = radius * 2 || 1;
			canvas.height = radius * 2 || 1;

			var rgba = Utils.toRgba(this.color, true);

			var ctx = canvas.getContext('2d');

			var gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
			gradient.addColorStop(0, 'rgba(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ',1)');
			gradient.addColorStop(1, 'rgba(' + rgba.r + ',' + rgba.g + ',' + rgba.b + ',0)');

			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, radius * 2, radius * 2);

			return new PIXI.Texture.fromCanvas(canvas);
		},

		update: function(time, delta) {
			this.displayObject.rotation += delta * 0.0001;
		}

	});

	return BodyView;
});
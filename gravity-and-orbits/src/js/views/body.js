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

			var planetSprite = Assets.createSprite(Assets.ImageFromModel(this.model));
			planetSprite.anchor.x = 0.5;
			planetSprite.anchor.y = 0.5;
			this.displayObject.addChild(planetSprite);

			this.displayObject.position.x = 480;
			this.displayObject.position.y = 300;
		},

		update: function(time, delta) {
			//this.displayObject.rotation += delta * 0.05;
		}

	});

	return BodyView;
});
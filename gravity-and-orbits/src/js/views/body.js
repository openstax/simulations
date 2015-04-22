define(function(require) {

	'use strict';

	var _    = require('underscore');
	var PIXI = require('pixi');

	var PixiView = require('common/pixi/view');
	var Colors   = require('common/colors/colors');

	var Sun       = require('models/body/sun');
	var Planet    = require('models/body/planet');
	var Moon      = require('models/body/moon');
	var Satellite = require('models/body/satellite');

	var Assets = require('assets');

	/**
	 * A view that represents a heavenly body.
	 */
	var BodyView = PixiView.extend({

		/**
		 *
		 */
		initialize: function(options) {

			this.initGraphics();
			
		},

		initGraphics: function() {
			var planetSprite = Assets.createSprite(Assets.ImageFromModel(this.model));
			planetSprite.anchor.x = 0.5;
			planetSprite.anchor.y = 0.5;
			this.displayObject.addChild(planetSprite);

			this.displayObject.position.x = 480;
			this.displayObject.position.y = 300;
		},

		updatePosition: function(body, position) {

		},

		updateMass: function(body, mass) {
			if (this.model instanceof Planet) {
				// Change graphics depending on whether we're near the
				//   reference mass or not.
				if (mass > 3449)
					console.log('placeholder');
			}
			else if (this.model instanceof Moon) {
				// Change graphics depending on whether we're near the
				//   reference mass or not.
				if (mass > 4392)
					console.log('placeholder');
			}
		},

		updateRadius: function(body, radius) {

		},

		update: function(time, delta) {
			
		}

	});

	return BodyView;
});
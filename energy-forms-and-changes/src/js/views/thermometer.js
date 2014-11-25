define(function(require) {

	'use strict';

	var _    = require('underscore');
	var PIXI = require('pixi');

	var PixiView = require('common/pixi/view');

	var Constants = require('constants');

	/**
	 * A view that represents the air model
	 */
	var ThermometerViewView = PixiView.extend({

		/**
		 *
		 */
		initialize: function(options) {
			this.listenTo(this.model, 'change:position', this.updatePosition);

			this.initGraphics();
		},

		initGraphics: function() {
			var back  = Assets.createSprite(Assets.Images.THERMOMETER_MEDIUM_BACK);
			var front = Assets.createSprite(Assets.Images.THERMOMETER_MEDIUM_FRONT);

			back.anchor.x = front.anchor.x = 0.5;
			back.anchor.y = front.anchor.y = 0.5;

			this.displayObject.addChild(back);
			this.displayObject.addChild(front);

			// TODO: add tick marks and the column of red liquid
		},

		updatePosition: function(model, position) {
			this.displayObject.x = position.x;
			this.displayObject.y = position.y;
		}

	});

	return ThermometerViewView;
});
define(function(require) {

	'use strict';

	var $        = require('jquery');
	var _        = require('underscore');
	var PIXI     = require('pixi');

	var SceneView = require('views/scene');

	var Assets = require('assets');

	/**
	 *
	 */
	var IntroSceneView = SceneView.extend({

		events: {
			
		},

		assets: Assets.Intro,

		initialize: function(options) {
			SceneView.prototype.initialize.apply(this, arguments);
		},

		/**
		 * Renders 
		 */
		renderContent: function() {
			
		},

		initGraphics: function() {
			SceneView.prototype.initGraphics.apply(this, arguments);

			this.initElements();
		},

		initElements: function() {
			var tableTop = new PIXI.Sprite(Assets.Texture(Assets.Images.SHELF_LONG));
			// tableTop.anchor.x = 0.5;
			tableTop.anchor.y = 1;
			tableTop.x = -(tableTop.width - this.width) / 2;
			tableTop.y = this.height;
			this.stage.addChild(tableTop);
		},

		_update: function(time, deltaTime) {
			//if (!this.simulation.get('paused'))
		}

	});

	return IntroSceneView;
});

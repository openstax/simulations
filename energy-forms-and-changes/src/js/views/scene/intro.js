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
			// Create layers
			this.backLayer              = new PIXI.DisplayObjectContainer();
			this.beakerBackLayer        = new PIXI.DisplayObjectContainer();
			this.beakerGrabLayer        = new PIXI.DisplayObjectContainer();
			this.blockLayer             = new PIXI.DisplayObjectContainer();
			this.airLayer               = new PIXI.DisplayObjectContainer();
			this.heaterCoolerFrontLayer = new PIXI.DisplayObjectContainer();
			this.thermometerLayer       = new PIXI.DisplayObjectContainer();
			this.beakerFrontLayer       = new PIXI.DisplayObjectContainer();

			this.stage.addChild(this.backLayer);
			this.stage.addChild(this.beakerBackLayer);
			this.stage.addChild(this.beakerGrabLayer);
			this.stage.addChild(this.blockLayer);
			this.stage.addChild(this.airLayer);
			this.stage.addChild(this.heaterCoolerFrontLayer);
			this.stage.addChild(this.thermometerLayer);
			this.stage.addChild(this.beakerFrontLayer);

			// Lab bench surface
			var labBenchSurface = new PIXI.Sprite(Assets.Texture(Assets.Images.SHELF_LONG));
			labBenchSurface.anchor.y = 1;
			labBenchSurface.x = -(labBenchSurface.width - this.width) / 2;
			labBenchSurface.y = this.height;
			this.backLayer.addChild(labBenchSurface);
		},

		_update: function(time, deltaTime) {
			//if (!this.simulation.get('paused'))
		}

	});

	return IntroSceneView;
});

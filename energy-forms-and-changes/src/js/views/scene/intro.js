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

			this.initLayers();
			this.initElements();
		},

		initLayers: function() {
			// Create layers
			this.backLayer        = new PIXI.DisplayObjectContainer();
			this.beakerBackLayer  = new PIXI.DisplayObjectContainer();
			this.beakerGrabLayer  = new PIXI.DisplayObjectContainer();
			this.blockLayer       = new PIXI.DisplayObjectContainer();
			this.airLayer         = new PIXI.DisplayObjectContainer();
			this.burnerFrontLayer = new PIXI.DisplayObjectContainer();
			this.thermometerLayer = new PIXI.DisplayObjectContainer();
			this.beakerFrontLayer = new PIXI.DisplayObjectContainer();

			this.stage.addChild(this.backLayer);
			this.stage.addChild(this.beakerBackLayer);
			this.stage.addChild(this.beakerGrabLayer);
			this.stage.addChild(this.blockLayer);
			this.stage.addChild(this.airLayer);
			this.stage.addChild(this.burnerFrontLayer);
			this.stage.addChild(this.thermometerLayer);
			this.stage.addChild(this.beakerFrontLayer);
		},

		initElements: function() {
			// Lab bench surface
			var labBenchSurface = new PIXI.Sprite(Assets.Texture(Assets.Images.SHELF_LONG));
			labBenchSurface.anchor.y = 1;
			labBenchSurface.x = -(labBenchSurface.width - this.width) / 2;
			labBenchSurface.y = this.height;
			this.backLayer.addChild(labBenchSurface);

			// Burners

			// var leftBurnerView  = new BurnerView({ model: this.simulation.leftBurner  });
			// var rightBurnerView = new BurnerView({ model: this.simulation.rightBurner });

			// this.backLayer.addChild(leftBurner.holeDisplayObject);
			// TODO: this.backLayer.addChild(new BurnerStandView)
			// this.burnerFrontLayer.addChild(leftBurner.frontDisplayObject);

			// Air
			var air = new AirView({ model: this.simulation.air });
			this.airLayer.addChild(air.displayObject);

			// Movable objects

			// Thermometers

			// Thermometer box
		},

		_update: function(time, deltaTime) {
			//if (!this.simulation.get('paused'))
		}

	});

	return IntroSceneView;
});

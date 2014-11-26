define(function(require) {

	'use strict';

	var $        = require('jquery');
	var _        = require('underscore');
	var PIXI     = require('pixi');
	var Vector2  = require('vector2-node');
	//var Rectangle = require('rectangle-node');

	var ModelViewTransform   = require('common/math/model-view-transform');
	var SceneView            = require('views/scene');
	var AirView              = require('views/air');
	var ThermometerView      = require('views/thermometer');
	var ThermometerClipsView = require('views/thermometer-clips');
	var BlockView            = require('views/element/block');
	var Assets               = require('assets');

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

			this.mvt = ModelViewTransform.createSinglePointScaleInvertedYMapping(
				new Vector2(0, 0),
				new Vector2(Math.round(this.width * 0.5), Math.round(this.height * 0.85)),
				2200 // Scale
			);

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
			var air = new AirView({ model: this.simulation.air, mvt: this.mvt });
			this.airLayer.addChild(air.displayObject);

			// Movable objects
			var brickView = new BlockView({ model: this.simulation.brick, mvt: this.mvt });
			this.blockLayer.addChild(brickView.displayObject);

			// Thermometers
			var thermometerViews = [];
			_.each(this.simulation.thermometers, function(thermometer) {
				thermometerViews.push(new ThermometerView({
					model: thermometer,
					mvt: this.mvt
				}));
			}, this);

			// Thermometer clips
			var thermometerClips = new ThermometerClipsView({
				x: 15,
				y: 15,
				width: 210,
				height: 180,
				numThermometerSpots: thermometerViews.length
			});
			this.backLayer.addChild(thermometerClips.displayObject);

			// Add thermometers to the thermometer clips
			_.each(thermometerViews, function(thermometerView) {
				var point = thermometerClips.addThermometer(thermometerView);
				thermometerView.model.setPosition(point.x, point.y);
				console.log(point.x + ', ' + point.y);
			}, this);

		},

		_update: function(time, deltaTime) {
			//if (!this.simulation.get('paused'))
		}

	});

	return IntroSceneView;
});

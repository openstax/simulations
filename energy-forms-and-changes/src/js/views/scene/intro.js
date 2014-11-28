define(function(require) {

	'use strict';

	//var $        = require('jquery');
	var _        = require('underscore');
	var PIXI     = require('pixi');
	var Vector2  = require('common/math/vector2');
	var Rectangle = require('common/math/rectangle');

	var ModelViewTransform   = require('common/math/model-view-transform');
	var SceneView            = require('views/scene');
	var AirView              = require('views/air');
	var ThermometerView      = require('views/thermometer');
	var ThermometerClipsView = require('views/thermometer-clips');
	var BlockView            = require('views/element/block');
	var BrickView            = require('views/element/brick');
	var Assets               = require('assets');

	// Constants
	var Constants = require('constants');

	/**
	 *
	 */
	var IntroSceneView = SceneView.extend({

		events: {
			
		},

		assets: Assets.Intro,

		initialize: function(options) {
			SceneView.prototype.initialize.apply(this, arguments);

			this.views = [];
		},

		/**
		 * Renders 
		 */
		renderContent: function() {
			
		},

		initGraphics: function() {
			SceneView.prototype.initGraphics.apply(this, arguments);

			var labBenchSurfaceTexture = Assets.Texture(Assets.Images.SHELF_LONG);

			this.viewOriginX = Math.round(this.width / 2);
			this.viewOriginY = Math.round(this.height - labBenchSurfaceTexture.height * 0.64); //Math.round(this.height * 0.85);//my failed attempt at making it less magic and more data-based
			this.mvt = ModelViewTransform.createSinglePointScaleInvertedYMapping(
				new Vector2(0, 0),
				new Vector2(this.viewOriginX, this.viewOriginY),
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
			var labBenchSurfaceTexture = Assets.Texture(Assets.Images.SHELF_LONG);
			var labBenchSurface = new PIXI.Sprite(labBenchSurfaceTexture);
			labBenchSurface.anchor.y = 1;
			labBenchSurface.x = -(labBenchSurface.width - this.width) / 2;
			labBenchSurface.y = this.height;
			// labBenchSurface.x = this.mvt.modelToViewX(0) - labBenchSurfaceTexture.width / 2;
			// labBenchSurface.y = this.mvt.modelToViewY(0) - labBenchSurfaceTexture.height / 2 + 10;
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
			this.views.push(air);

			// Movable Elements
			this.initBlocks();
			this.initBeaker();

			// Thermometers
			this.initThermometers();
		},

		initBlocks: function() {
			var blockWidth = this.mvt.modelToViewDeltaX(Constants.Block.SURFACE_WIDTH) + Constants.BlockView.LINE_WIDTH;
			var blockMovementConstraints = new Rectangle(
				0, 
				0, 
				this.width, 
				this.viewOriginY
			);

			var brickView = new BrickView({ 
				model: this.simulation.brick,
				mvt: this.mvt,
				movementConstraintBounds: blockMovementConstraints,
				lineWidth: Constants.BlockView.LINE_WIDTH,
				textColor: Constants.BrickView.TEXT_COLOR,
				labelText: 'Brick'
			});
			
			var ironBlockView = new BlockView({ 
				model: this.simulation.ironBlock, 
				mvt: this.mvt, 
				movementConstraintBounds: blockMovementConstraints,
				lineWidth: Constants.BlockView.LINE_WIDTH,
				fillColor: Constants.IronBlockView.FILL_COLOR,
				textColor: Constants.IronBlockView.TEXT_COLOR,
				labelText: 'Iron'
			});

			this.blockLayer.addChild(brickView.displayObject);
			this.blockLayer.addChild(ironBlockView.displayObject);

			this.views.push(brickView);
			this.views.push(ironBlockView);

			// Listen to energy chunk show and hide events
			_.each([
				brickView,
				ironBlockView
			], function(elementView) {
				elementView.listenTo(this, 'show-energy-chunks', elementView.showEnergyChunks);
				elementView.listenTo(this, 'hide-energy-chunks', elementView.hideEnergyChunks);
			}, this);
		},

		initBeaker: function() {

		},

		initThermometers: function() {
			var thermometerViews = [];
			_.each(this.simulation.thermometers, function(thermometer) {
				var view = new ThermometerView({
					model: thermometer,
					mvt: this.mvt
				});
				thermometerViews.push(view);
				this.views.push(view);
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
			}, this);
		},

		_update: function(time, deltaTime) {
			//if (!this.simulation.get('paused'))
			for (var i = 0; i < this.views.length; i++)
				this.views[i].update(time, deltaTime);
		},

		showEnergyChunks: function() {
			this.trigger('show-energy-chunks');
		},

		hideEnergyChunks: function() {
			this.trigger('hide-energy-chunks');
		}

	});

	return IntroSceneView;
});

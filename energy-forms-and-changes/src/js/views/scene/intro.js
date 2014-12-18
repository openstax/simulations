define(function(require) {

    'use strict';

    //var $        = require('jquery');
    var _         = require('underscore');
    var PIXI      = require('pixi');
    var Vector2   = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');

    var ModelViewTransform   = require('common/math/model-view-transform');
    var SceneView            = require('views/scene');
    var AirView              = require('views/air');
    var ThermometerView      = require('views/element/thermometer');
    var ThermometerClipsView = require('views/thermometer-clips');
    var BlockView            = require('views/element/block');
    var BrickView            = require('views/element/brick');
    var BeakerView           = require('views/element/beaker');
    var BurnerStandView      = require('views/element/burner-stand');
    var BurnerView           = require('views/element/burner');
    var Assets               = require('assets');

    // Constants
    var Constants = require('constants');
    var IntroSimulationView = Constants.IntroSimulationView;

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
                2000 // Scale
            );

            this.initLayers();
            this.initElements();
        },

        initLayers: function() {
            // Create layers
            this.backLayer        = new PIXI.DisplayObjectContainer();
            this.beakerBackLayer  = new PIXI.DisplayObjectContainer();
            this.blockLayer       = new PIXI.DisplayObjectContainer();
            this.airLayer         = new PIXI.DisplayObjectContainer();
            this.burnerFrontLayer = new PIXI.DisplayObjectContainer();
            this.thermometerLayer = new PIXI.DisplayObjectContainer();
            this.beakerFrontLayer = new PIXI.DisplayObjectContainer();

            this.stage.addChild(this.backLayer);
            this.stage.addChild(this.beakerBackLayer);
            this.stage.addChild(this.blockLayer);
            this.stage.addChild(this.airLayer);
            this.stage.addChild(this.burnerFrontLayer);
            this.stage.addChild(this.thermometerLayer);
            this.stage.addChild(this.beakerFrontLayer);
        },

        initElements: function() {
            // Lab bench surface
            this.initLabBenchSurface();

            // Air
            this.initAir();

            // Movable Elements
            this.initBlocks();
            this.initBeaker();

            // Thermometers
            this.initThermometers();

            // Burners
            this.initBurners();
        },

        initLabBenchSurface: function() {
            var labBenchSurfaceTexture = Assets.Texture(Assets.Images.SHELF_LONG);
            var labBenchSurface = new PIXI.Sprite(labBenchSurfaceTexture);
            labBenchSurface.anchor.y = 1;
            labBenchSurface.x = -(labBenchSurface.width - this.width) / 2;
            labBenchSurface.y = this.height;
            // labBenchSurface.x = this.mvt.modelToViewX(0) - labBenchSurfaceTexture.width / 2;
            // labBenchSurface.y = this.mvt.modelToViewY(0) - labBenchSurfaceTexture.height / 2 + 10;
            this.backLayer.addChild(labBenchSurface);
        },

        initAir: function() {
            var air = new AirView({ 
                model: this.simulation.air, 
                mvt: this.mvt
            });
            this.airLayer.addChild(air.displayObject);
            this.views.push(air);

            air.listenTo(this, 'show-energy-chunks', air.showEnergyChunks);
            air.listenTo(this, 'hide-energy-chunks', air.hideEnergyChunks);
        },

        initBlocks: function() {
            var movementConstraintBounds = new Rectangle(
                0, 
                0, 
                this.width, 
                this.viewOriginY
            );
            var movementConstraint = _.bind(function(model, newPosition) {
                return this.simulation.validatePosition(model, newPosition);
            }, this);

            this.brickView = new BrickView({ 
                model: this.simulation.brick,
                mvt: this.mvt,
                simulation: this.simulation,
                movementConstraintBounds: movementConstraintBounds,
                movementConstraint: movementConstraint,
                lineWidth: Constants.BlockView.LINE_WIDTH,
                textColor: Constants.BrickView.TEXT_COLOR,
                labelText: 'Brick'
            });
            this.brickLayer = new PIXI.DisplayObjectContainer();
            this.brickLayer.addChild(this.brickView.debugLayer);
            this.brickLayer.addChild(this.brickView.energyChunkLayer);
            this.brickLayer.addChild(this.brickView.displayObject);
            this.blockLayer.addChild(this.brickLayer);
            
            this.ironBlockView = new BlockView({ 
                model: this.simulation.ironBlock, 
                mvt: this.mvt,
                simulation: this.simulation,
                movementConstraintBounds: movementConstraintBounds,
                movementConstraint: movementConstraint,
                lineWidth: Constants.BlockView.LINE_WIDTH,
                fillColor: Constants.IronBlockView.FILL_COLOR,
                textColor: Constants.IronBlockView.TEXT_COLOR,
                labelText: 'Iron'
            });
            this.ironBlockLayer = new PIXI.DisplayObjectContainer();
            this.ironBlockLayer.addChild(this.ironBlockView.debugLayer);
            this.ironBlockLayer.addChild(this.ironBlockView.energyChunkLayer);
            this.ironBlockLayer.addChild(this.ironBlockView.displayObject);
            this.blockLayer.addChild(this.ironBlockLayer);

            this.views.push(this.brickView);
            this.views.push(this.ironBlockView);

            this.listenTo(this.simulation.brick,     'change:position', this.blockPositionChanged);
            this.listenTo(this.simulation.ironBlock, 'change:position', this.blockPositionChanged);

            // Listen to energy chunk show and hide events
            _.each([
                this.brickView,
                this.ironBlockView
            ], function(elementView) {
                elementView.listenTo(this, 'show-energy-chunks', elementView.showEnergyChunks);
                elementView.listenTo(this, 'hide-energy-chunks', elementView.hideEnergyChunks);
            }, this);
        },

        initBeaker: function() {
            var movementConstraintBounds = new Rectangle(
                0, 
                0, 
                this.width, 
                this.viewOriginY
            );
            var movementConstraint = _.bind(function(model, newPosition) {
                return this.simulation.validatePosition(model, newPosition);
            }, this);

            this.beakerView = new BeakerView({
                model: this.simulation.beaker,
                mvt: this.mvt,
                simulation: this.simulation,
                movable: true,
                movementConstraint: movementConstraint,
                movementConstraintBounds: movementConstraintBounds
            });
            this.views.push(this.beakerView);

            this.beakerFrontLayer.addChild(this.beakerView.frontLayer);
            this.beakerBackLayer.addChild(this.beakerView.backLayer);
            this.beakerBackLayer.addChild(this.beakerView.energyChunkLayer);
            this.beakerFrontLayer.addChild(this.beakerView.debugLayer);

            //this.beakerView.fluidMask.mask = this.ironBlockView.displayObject;

            this.beakerView.listenTo(this, 'show-energy-chunks', this.beakerView.showEnergyChunks);
            this.beakerView.listenTo(this, 'hide-energy-chunks', this.beakerView.hideEnergyChunks);
        },

        initThermometers: function() {
            var thermometerViews = [];
            _.each(this.simulation.thermometers, function(thermometer) {
                var view = new ThermometerView({
                    model: thermometer,
                    mvt: this.mvt,
                    simulation: this.simulation
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
                thermometerView.setPosition(point.x, point.y);
            }, this);
        },

        initBurners: function() {
            var burnerWidth = this.mvt.modelToViewDeltaX(this.simulation.leftBurner.getOutlineRect().w);
            var burnerProjectionAmount = burnerWidth * Constants.Burner.EDGE_TO_HEIGHT_RATIO;
            burnerWidth *= IntroSimulationView.BURNER_WIDTH_SCALE;
            var burnerHeight = burnerWidth * IntroSimulationView.BURNER_HEIGHT_TO_WIDTH_RATIO;
            var burnerOpeningHeight = burnerHeight * 0.2;

            var leftBurnerStandView = new BurnerStandView({
                model: this.simulation.leftBurner,
                mvt: this.mvt,
                simulation: this.simulation,
                projectedEdgeLength: burnerProjectionAmount
            });

            var rightBurnerStandView = new BurnerStandView({
                model: this.simulation.rightBurner,
                mvt: this.mvt,
                simulation: this.simulation,
                projectedEdgeLength: burnerProjectionAmount
            });

            var leftBurnerView = new BurnerView({
                model: this.simulation.leftBurner,
                mvt: this.mvt,
                simulation: this.simulation,
                width: burnerWidth,
                height: burnerHeight,
                openingHeight: burnerOpeningHeight
            });

            var rightBurnerView = new BurnerView({
                model: this.simulation.rightBurner,
                mvt: this.mvt,
                simulation: this.simulation,
                width: burnerWidth,
                height: burnerHeight,
                openingHeight: burnerOpeningHeight
            });

            this.views.push(leftBurnerStandView);
            this.views.push(rightBurnerStandView);
            this.views.push(leftBurnerView);
            this.views.push(rightBurnerView);

            this.backLayer.addChild(leftBurnerView.backLayer);
            this.backLayer.addChild(leftBurnerView.energyChunkLayer);
            this.burnerFrontLayer.addChild(leftBurnerView.frontLayer);

            this.backLayer.addChild(rightBurnerView.backLayer);
            this.backLayer.addChild(rightBurnerView.energyChunkLayer);
            this.burnerFrontLayer.addChild(rightBurnerView.frontLayer);

            this.backLayer.addChild(leftBurnerStandView.displayObject);
            this.backLayer.addChild(rightBurnerStandView.displayObject);

            _.each([
                leftBurnerView,
                rightBurnerView
            ], function(elementView) {
                elementView.listenTo(this, 'show-energy-chunks', elementView.showEnergyChunks);
                elementView.listenTo(this, 'hide-energy-chunks', elementView.hideEnergyChunks);
            }, this);
        },

        _update: function(time, deltaTime) {
            //if (!this.simulation.get('paused'))
            for (var i = 0; i < this.views.length; i++)
                this.views[i].update(time, deltaTime);
        },

        blockPositionChanged: function() {
            var brick = this.simulation.brick;
            var iron  = this.simulation.ironBlock;

            if (this.blockLayer.getChildIndex(this.brickLayer) !== 0 && (
                    iron.isStackedUpon(brick) || (
                        iron.getRect().left()   >= brick.getRect().right() ||
                        iron.getRect().bottom() >= brick.getRect().top()
                    )
                )
            ) {
                this.blockLayer.swapChildren(this.brickLayer, this.ironBlockLayer);
            }
            else if (this.blockLayer.getChildIndex(this.ironBlockLayer) !== 0 && (
                    brick.isStackedUpon(iron) || (
                        brick.getRect().left()   >= iron.getRect().right() ||
                        brick.getRect().bottom() >= iron.getRect().top()
                    )
                )
            ) {
                this.blockLayer.swapChildren(this.brickLayer, this.ironBlockLayer);
            }
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

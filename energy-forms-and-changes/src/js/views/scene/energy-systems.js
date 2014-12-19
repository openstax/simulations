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
    var EnergySystemsSimulationView = Constants.EnergySystemsSimulationView;

    /**
     *
     */
    var EnergySystemsSceneView = SceneView.extend({

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

            // this.viewOriginX = Math.round(this.width / 2);
            // this.viewOriginY = Math.round(this.height - labBenchSurfaceTexture.height * 0.64); //Math.round(this.height * 0.85);//my failed attempt at making it less magic and more data-based
            this.mvt = ModelViewTransform.createSinglePointScaleInvertedYMapping(
                new Vector2(0, 0),
                new Vector2(0,0),
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
            // Air
            this.initAir();
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
            this.airView = air;
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

    return EnergySystemsSceneView;
});

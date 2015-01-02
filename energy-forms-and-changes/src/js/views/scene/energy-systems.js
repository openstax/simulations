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

    var FaucetView = require('views/energy-source/faucet');
    var SunView    = require('views/energy-source/sun');

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

            this.viewOriginX = Math.round(this.width / 2);
            this.viewOriginY = Math.round(this.height * 0.525); // PhET's is 0.475, but I changed it because we've got a differently shaped view
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
            this.backLayer = new PIXI.DisplayObjectContainer();
            this.airLayer = new PIXI.DisplayObjectContainer();

            this.stage.addChild(this.backLayer);
            this.stage.addChild(this.airLayer);
        },

        initElements: function() {
            // Air
            this.initAir();

            this.initSources();
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

        initSources: function() {
            this.faucet = new FaucetView({
                model: this.simulation.faucet,
                mvt: this.mvt
            });
            this.backLayer.addChild(this.faucet.displayObject);
            //this.backLayer.addChild(this.faucet.waterLayer);

            this.sun = new SunView({
                model: this.simulation.sun,
                mvt: this.mvt
            });
            this.backLayer.addChild(this.sun.displayObject);
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

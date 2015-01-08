define(function(require) {

    'use strict';

    // var $        = require('jquery');
    // var _         = require('underscore');
    var PIXI      = require('pixi');
    var Vector2   = require('common/math/vector2');
    // var Rectangle = require('common/math/rectangle');

    var ModelViewTransform   = require('common/math/model-view-transform');
    var SceneView            = require('views/scene');
    var AirView              = require('views/air');

    var FaucetView = require('views/energy-source/faucet');
    var SunView    = require('views/energy-source/sun');

    var ElectricalGeneratorView = require('views/energy-converter/electrical-generator');
    var SolarPanelView          = require('views/energy-converter/solar-panel');

    var BeakerHeaterView          = require('views/energy-user/beaker-heater');
    var IncandescentLightBulbView = require('views/energy-user/incandescent-light-bulb');
    var FluorescentLightBulbView  = require('views/energy-user/fluorescent-light-bulb');

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
                EnergySystemsSimulationView.ENERGY_SYSTEMS_MVT_SCALE_FACTOR
            );

            this.initLayers();
            this.initElements();
        },

        initLayers: function() {
            // Create layers
            this.backLayer  = new PIXI.DisplayObjectContainer();
            this.airLayer   = new PIXI.DisplayObjectContainer();
            this.frontLayer = new PIXI.DisplayObjectContainer();

            this.stage.addChild(this.backLayer);
            this.stage.addChild(this.airLayer);
            this.stage.addChild(this.frontLayer);
        },

        initElements: function() {
            this.initAir();

            /* If there's to be any overlap between converters and users,
             *   we want the converters on top, so that's why we're going
             *   to add users first and then converters.
            */
            this.initSources();
            this.initUsers();
            this.initConverters();
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
            // Faucet
            this.faucetView = new FaucetView({
                model: this.simulation.faucet,
                mvt: this.mvt
            });
            this.backLayer.addChild(this.faucetView.displayObject);
            this.frontLayer.addChild(this.faucetView.energyChunkLayer);

            // Sun
            this.sunView = new SunView({
                model: this.simulation.sun,
                mvt: this.mvt
            });
            this.backLayer.addChild(this.sunView.skyLayer);
            this.frontLayer.addChild(this.sunView.energyChunkLayer);
            this.frontLayer.addChild(this.sunView.displayObject);
            this.frontLayer.addChild(this.sunView.cloudLayer);

            // Bind visibility
            this.bindEnergyChunkVisibility(this.faucetView);
            this.bindEnergyChunkVisibility(this.sunView);

            // Add to list for updating
            this.views.push(this.faucetView);
            this.views.push(this.sunView);
        },

        initConverters: function() {
            // Electrical generator
            var electricalGeneratorView = new ElectricalGeneratorView({
                model: this.simulation.electricalGenerator,
                mvt: this.mvt
            });
            this.electricalGeneratorView = electricalGeneratorView;

            this.backLayer.addChild(electricalGeneratorView.backLayer);
            this.backLayer.addChild(electricalGeneratorView.electricalEnergyChunkLayer);
            this.frontLayer.addChild(electricalGeneratorView.frontLayer);
            this.frontLayer.addChild(electricalGeneratorView.energyChunkLayer);
            this.frontLayer.addChild(electricalGeneratorView.hiddenEnergyChunkLayer);

            // Solar panel
            var solarPanelView = new SolarPanelView({
                model: this.simulation.solarPanel,
                mvt: this.mvt
            });
            this.solarPanelView = solarPanelView;

            this.backLayer.addChild(solarPanelView.backLayer);
            this.backLayer.addChild(solarPanelView.energyChunkLayer);
            this.frontLayer.addChild(solarPanelView.frontLayer);

            // Bind visibility
            this.views.push(electricalGeneratorView);
            this.views.push(solarPanelView);

            // Add to list for updating
            this.bindEnergyChunkVisibility(electricalGeneratorView);
            this.bindEnergyChunkVisibility(solarPanelView);
        },

        initUsers: function() {
            // Incandescent bulb
            var incandescentLightBulbView = new IncandescentLightBulbView({
                model: this.simulation.incandescentLightBulb,
                mvt: this.mvt
            });
            this.incandescentLightBulbView = incandescentLightBulbView;

            this.backLayer.addChild(incandescentLightBulbView.backLayer);
            this.backLayer.addChild(incandescentLightBulbView.energyChunkLayer);
            this.backLayer.addChild(incandescentLightBulbView.frontLayer);

            // Fluorescent bulb
            var fluorescentLightBulbView = new FluorescentLightBulbView({
                model: this.simulation.fluorescentLightBulb,
                mvt: this.mvt
            });
            this.fluorescentLightBulbView = fluorescentLightBulbView;

            this.backLayer.addChild(fluorescentLightBulbView.backLayer);
            this.backLayer.addChild(fluorescentLightBulbView.energyChunkLayer);
            this.backLayer.addChild(fluorescentLightBulbView.frontLayer);

            // Beaker heater
            var beakerHeaterView = new BeakerHeaterView({
                model: this.simulation.beakerHeater,
                mvt: this.mvt,
                simulation: this.simulation
            });
            this.beakerHeaterView = beakerHeaterView;

            this.backLayer.addChild(beakerHeaterView.backLayer);
            this.backLayer.addChild(beakerHeaterView.energyChunkLayer);
            this.backLayer.addChild(beakerHeaterView.frontLayer);

            this.backLayer.addChild(beakerHeaterView.beakerView.backLayer);
            this.backLayer.addChild(beakerHeaterView.beakerView.energyChunkLayer);
            this.backLayer.addChild(beakerHeaterView.beakerView.frontLayer);

            // Bind visibility
            this.views.push(incandescentLightBulbView);
            this.views.push(fluorescentLightBulbView);
            this.views.push(beakerHeaterView);

            // Add to list for updating
            this.bindEnergyChunkVisibility(incandescentLightBulbView);
            this.bindEnergyChunkVisibility(fluorescentLightBulbView);
            this.bindEnergyChunkVisibility(beakerHeaterView);
        },

        _update: function(time, deltaTime) {
            //if (!this.simulation.get('paused'))
            for (var i = 0; i < this.views.length; i++)
                this.views[i].update(time, deltaTime, this.simulation.get('paused'));
        },

        showEnergyChunks: function() {
            this.trigger('show-energy-chunks');
        },

        hideEnergyChunks: function() {
            this.trigger('hide-energy-chunks');
        },

        bindEnergyChunkVisibility: function(view) {
            view.listenTo(this, 'show-energy-chunks', view.showEnergyChunks);
            view.listenTo(this, 'hide-energy-chunks', view.hideEnergyChunks);
        }

    });

    return EnergySystemsSceneView;
});

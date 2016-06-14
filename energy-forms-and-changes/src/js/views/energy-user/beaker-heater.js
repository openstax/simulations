define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var Vector2 = require('common/math/vector2');

    var EnergyUserView  = require('views/energy-user');
    var BeakerView      = require('views/element/beaker');
    var ThermometerView = require('views/element/thermometer');

    var Assets = require('assets');

    var Constants = require('constants');
    var BeakerHeater = Constants.BeakerHeater;

    var BeakerHeaterView = EnergyUserView.extend({

        initialize: function(options) {
            options = _.extend({
                
            }, options);

            if (!options.simulation)
                throw 'BeakerHeaterView requires the simulation object to be passed in as an option.';
            this.simulation = options.simulation;

            EnergyUserView.prototype.initialize.apply(this, [options]);

            this.listenTo(this.model, 'change:heatProportion', this.updateHeatProportion);
            this.updateHeatProportion(this.model, this.model.get('litProportion'));
        },

        initGraphics: function() {
            EnergyUserView.prototype.initGraphics.apply(this);

            this.backLayer = new PIXI.Container();
            this.frontLayer = new PIXI.Container();

            this.initImages();
            this.initBeakerView();
            this.initThermometerView();

            this.createEnergyChunkCollectionView('radiatedEnergyChunks', this.model.radiatedEnergyChunks);
            this.energyChunkLayer.addChild(this.radiatedEnergyChunks);
        },

        /**
         * This should be overriden by child classes
         */
        initImages: function() {
            var straightWire = this.createSpriteWithOffset(Assets.Images.WIRE_BLACK_62,      new Vector2(-0.036, -0.04));
            var curvedWire   = this.createSpriteWithOffset(Assets.Images.WIRE_BLACK_RIGHT,   new Vector2(-0.009, -0.016));
            var baseBack     = this.createSpriteWithOffset(Assets.Images.ELEMENT_BASE_BACK);
            var baseFront    = this.createSpriteWithOffset(Assets.Images.ELEMENT_BASE_FRONT);
            var coldCoil     = this.createSpriteWithOffset(Assets.Images.HEATER_ELEMENT_DARK, BeakerHeater.HEATER_ELEMENT_OFFSET);
            var energizedCoil = this.createSpriteWithOffset(Assets.Images.HEATER_ELEMENT,     BeakerHeater.HEATER_ELEMENT_OFFSET);
            this.energizedCoil = energizedCoil; // We need to remember this one

            // Fudging
            straightWire.x += 4;

            this.backLayer.addChild(straightWire);
            this.backLayer.addChild(curvedWire);
            this.backLayer.addChild(baseBack);
            this.backLayer.addChild(coldCoil);
            this.backLayer.addChild(energizedCoil);

            // [ energy chunks layer ]

            this.frontLayer.addChild(baseFront);
        },

        initBeakerView: function() {
            var beakerView = new BeakerView({
                model: this.model.beaker,
                mvt: this.mvt,
                simulation: this.simulation
            });
            this.beakerView = beakerView;
        },

        initThermometerView: function() {
            var thermometerView = new ThermometerView({
                model: this.model.thermometer,
                mvt: this.mvt,
                simulation: this.simulation,
                measurableElementViews: [ this.beakerView ]
            });
            this.thermometerView = thermometerView;
        },

        updateHeatProportion: function(model, heatProportion) {
            this.energizedCoil.alpha = heatProportion;
        },

        updatePosition: function(model, position) {
            var viewPoint = this.mvt.modelToView(position);
            this.backLayer.x = this.frontLayer.x = viewPoint.x;
            this.backLayer.y = this.frontLayer.y = viewPoint.y;
        },

        update: function(time, deltaTime, simulationPaused, timeScale) {
            EnergyUserView.prototype.update.apply(this, [time, deltaTime, simulationPaused]);
            this.beakerView.update(time, deltaTime, simulationPaused, timeScale);
        },

        showEnergyChunks: function() {
            EnergyUserView.prototype.showEnergyChunks.apply(this);
            this.beakerView.showEnergyChunks();
        },

        hideEnergyChunks: function() {
            EnergyUserView.prototype.hideEnergyChunks.apply(this);
            this.beakerView.hideEnergyChunks();
        }

    });

    return BeakerHeaterView;
});
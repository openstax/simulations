define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView      = require('common/pixi/view/scene');
    var GridView           = require('common/pixi/view/grid');
    var AppView            = require('common/app/app');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');
    var Rectangle          = require('common/math/rectangle');

    var SensorReservoir         = require('views/sensor-reservoir');
    var NegativeChargeReservoir = require('views/negative-charge-reservoir');
    var PositiveChargeReservoir = require('views/positive-charge-reservoir');
    var PositiveChargeView      = require('views/positive-charge');
    var NegativeChargeView      = require('views/negative-charge');
    var SensorView              = require('views/sensor');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');
    var SceneView = Constants.SceneView;

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var ChargesAndFieldsSceneView = PixiSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.simulation.charges, 'reset',  this.chargesReset);
            this.listenTo(this.simulation.charges, 'add',    this.chargeAdded);
            this.listenTo(this.simulation.charges, 'remove', this.chargeRemoved);

            this.listenTo(this.simulation.sensors, 'reset',  this.sensorsReset);
            this.listenTo(this.simulation.sensors, 'add',    this.sensorAdded);
            this.listenTo(this.simulation.sensors, 'remove', this.sensorRemoved);
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.initMVT();
            this.initGrid();
            this.initCharges();
            this.initSensors();
            this.initReservoirs();
        },

        initMVT: function() {
            var heightInMeters = Constants.SIM_HEIGHT_IN_METERS;
            var widthInMeters;
            var scale;


            if (AppView.windowIsShort()) {
                scale = Math.ceil(this.height / heightInMeters);
                heightInMeters = this.height * scale;
                widthInMeters = this.width * scale;
            }
            else {
                scale = this.height / heightInMeters;
                widthInMeters = Math.ceil(this.width / scale);
            }
            
            this.viewOriginX = Math.round(this.width / 2 - (widthInMeters / 2) * scale);
            this.viewOriginY = 0;

            this.mvt = ModelViewTransform.createSinglePointScaleInvertedYMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                scale
            );
        },

        initGrid: function() {
            this.gridView = new GridView({
                origin: new Vector2(this.viewOriginX, this.viewOriginY),
                bounds: new Rectangle(0, 0, this.width, this.height),

                gridSize:         this.mvt.modelToViewDeltaX(SceneView.GRID_MAJOR_SIZE_IN_METERS),
                smallGridSize:    this.mvt.modelToViewDeltaX(SceneView.GRID_MINOR_SIZE_IN_METERS),
                smallGridEnabled: true,

                lineWidth: 2,
                lineColor: SceneView.GRID_COLOR,
                lineAlpha: 0.4,

                smallLineColor: SceneView.GRID_COLOR,
                smallLineWidth: 1,
                smallLineAlpha: 0.15
            });
            this.gridView.hide();
            this.stage.addChild(this.gridView.displayObject);
        },

        initCharges: function() {
            this.chargeViews = [];

            this.charges = new PIXI.DisplayObjectContainer();
            this.stage.addChild(this.charges);
        },

        initSensors: function() {
            this.sensorViews = [];

            this.sensors = new PIXI.DisplayObjectContainer();
            this.stage.addChild(this.sensors);
        },

        initReservoirs: function() {
            var negativeChargeReservoir = new NegativeChargeReservoir({
                dummyLayer: this.stage,
                simulation: this.simulation,
                mvt: this.mvt
            });

            var $lastChild = $('.sim-controls-wrapper').children().last();
            var childOffset = $lastChild.offset();
            var sceneOffset = this.$el.offset();

            negativeChargeReservoir.displayObject.x = childOffset.left - sceneOffset.left;
            negativeChargeReservoir.displayObject.y = childOffset.top - sceneOffset.top + $lastChild.outerHeight() + 4;

            var positiveChargeReservoir = new PositiveChargeReservoir({
                dummyLayer: this.stage,
                simulation: this.simulation,
                mvt: this.mvt
            });

            positiveChargeReservoir.displayObject.x = negativeChargeReservoir.getBounds().x;
            positiveChargeReservoir.displayObject.y = negativeChargeReservoir.getBounds().y + negativeChargeReservoir.getBounds().h + 4;

            var sensorReservoir = new SensorReservoir({
                dummyLayer: this.stage,
                simulation: this.simulation,
                mvt: this.mvt,
                labelText: 'E-Field Sensors'
            });

            sensorReservoir.displayObject.x = positiveChargeReservoir.getBounds().x;
            sensorReservoir.displayObject.y = positiveChargeReservoir.getBounds().y + positiveChargeReservoir.getBounds().h + 4;

            this.stage.addChild(negativeChargeReservoir.displayObject);
            this.stage.addChild(positiveChargeReservoir.displayObject);
            this.stage.addChild(sensorReservoir.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

        chargesReset: function(charges) {
            // Remove old charge views
            for (var i = this.chargeViews.length - 1; i >= 0; i--) {
                this.chargeViews[i].removeFrom(this.charges);
                this.chargeViews.splice(i, 1);
            }

            // Add new charge views
            charges.each(function(charge) {
                this.createAndAddChargeView(charge);
            }, this);
        },

        chargeAdded: function(charge, charges) {
            this.createAndAddChargeView(charge);
        },

        chargeRemoved: function(charge, charges) {
            for (var i = this.chargeViews.length - 1; i >= 0; i--) {
                if (this.chargeViews[i].model === charge) {
                    this.chargeViews[i].removeFrom(this.charges);
                    this.chargeViews.splice(i, 1);
                    break;
                }
            }
        },

        createAndAddChargeView: function(charge) {
            var options = { 
                model: charge,
                mvt: this.mvt
            };

            var chargeView;
            if (charge.get('sign') > 0)
                chargeView = new PositiveChargeView(options);
            else
                chargeView = new NegativeChargeView(options);

            this.charges.addChild(chargeView.displayObject);
            this.chargeViews.push(chargeView);
        },

        sensorsReset: function(sensors) {
            // Remove old sensor views
            for (var i = this.sensorViews.length - 1; i >= 0; i--) {
                this.sensorViews[i].removeFrom(this.sensors);
                this.sensorViews.splice(i, 1);
            }

            // Add new sensor views
            sensors.each(function(sensor) {
                this.createAndAddSensorView(sensor);
            }, this);
        },

        sensorAdded: function(sensor, sensors) {
            this.createAndAddSensorView(sensor);
        },

        sensorRemoved: function(sensor, sensors) {
            for (var i = this.sensorViews.length - 1; i >= 0; i--) {
                if (this.sensorViews[i].model === sensor) {
                    this.sensorViews[i].removeFrom(this.sensors);
                    this.sensorViews.splice(i, 1);
                    break;
                }
            }
        },

        createAndAddSensorView: function(sensor) {
            var sensorView = new SensorView({ 
                model: sensor,
                mvt: this.mvt
            });
            this.sensors.addChild(sensorView.displayObject);
            this.sensorViews.push(sensorView);
        },

        showGrid: function() {
            this.gridView.show();
        },

        hideGrid: function() {
            this.gridView.hide();
        },

    });

    return ChargesAndFieldsSceneView;
});

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
    var VoltageMosaic           = require('views/voltage-mosaic');
    var VoltageTool             = require('views/voltage-tool');
    var EFieldVaneMatrix        = require('views/efield-vane-matrix');
    var ScaleLegend             = require('views/scale-legend');

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
            this.initVoltageMosaic();
            this.initGrid();
            this.initEFieldVaneMatrix();
            this.initScaleLegend();
            this.initEquipotentialPlots();
            this.initCharges();
            this.initSensors();
            this.initVoltageTool();
            this.initReservoirs();
        },

        initMVT: function() {
            var heightInMeters = Constants.SIM_HEIGHT_IN_METERS;
            var widthInMeters;
            var scale;


            if (AppView.windowIsShort()) {
                scale = Math.ceil(this.height / heightInMeters);
                heightInMeters = this.height / scale;
                widthInMeters = this.width / scale;
            }
            else {
                scale = this.height / heightInMeters;
                widthInMeters = Math.ceil(this.width / scale);
            }

            this.simulation.setBoundsDimensions(widthInMeters, heightInMeters);
            
            this.viewOriginX = Math.round(this.width / 2 - (widthInMeters / 2) * scale);
            this.viewOriginY = 0;

            this.mvt = ModelViewTransform.createSinglePointScaleMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                scale
            );
        },

        initVoltageMosaic: function() {
            this.voltageMosaic = new VoltageMosaic({
                simulation: this.simulation,
                mvt: this.mvt
            });
            this.voltageMosaic.displayObject.x = this.mvt.modelToViewX(0);
            this.voltageMosaic.displayObject.y = this.mvt.modelToViewY(0);
            this.stage.addChild(this.voltageMosaic.displayObject);

            this.hideVoltageMosaic();
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

            this.gridLayer = new PIXI.DisplayObjectContainer();
            this.gridLayer.addChild(this.gridView.displayObject);
            this.gridLayer.visible = false;
            this.stage.addChild(this.gridLayer);
        },

        initEFieldVaneMatrix: function() {
            this.eFieldVaneMatrix = new EFieldVaneMatrix({
                simulation: this.simulation,
                mvt: this.mvt
            });
            this.eFieldVaneMatrix.hide();
            this.stage.addChild(this.eFieldVaneMatrix.displayObject);
        },

        initScaleLegend: function() {
            this.scaleLegend = new ScaleLegend({
                mvt: this.mvt
            });
            this.scaleLegend.setPosition(this.mvt.modelToViewX(6), this.mvt.modelToViewY(5.75));
            this.gridLayer.addChild(this.scaleLegend.displayObject);
        },

        initEquipotentialPlots: function() {
            this.equipotentialPlots = new PIXI.DisplayObjectContainer();
            this.stage.addChild(this.equipotentialPlots);
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

        initVoltageTool: function() {
            this.voltageTool = new VoltageTool({
                simulation: this.simulation,
                mvt: this.mvt,
                equipotentialPlotLayer: this.equipotentialPlots
            });
            
            if (AppView.windowIsShort()) {
                this.voltageTool.displayObject.x = this.width - this.voltageTool.width / 2 - 16;
                this.voltageTool.displayObject.y = this.height - this.voltageTool.height - 30;
            }
            else {
                this.voltageTool.displayObject.x = this.voltageTool.width / 2 + 10;
                this.voltageTool.displayObject.y = this.height - this.voltageTool.height - 10;
            }

            this.stage.addChild(this.voltageTool.displayObject);
        },

        initReservoirs: function() {
            var negativeChargeReservoir = new NegativeChargeReservoir({
                dummyLayer: this.stage,
                simulation: this.simulation,
                mvt: this.mvt
            });

            if (AppView.windowIsShort()) {
                negativeChargeReservoir.displayObject.x = 16;
                negativeChargeReservoir.displayObject.y = 16;
            }
            else {
                var $lastChild = $('.sim-controls-wrapper').children().last();
                var childOffset = $lastChild.offset();
                var sceneOffset = this.$el.offset();

                negativeChargeReservoir.displayObject.x = childOffset.left - sceneOffset.left;
                negativeChargeReservoir.displayObject.y = childOffset.top - sceneOffset.top + $lastChild.outerHeight() + 4;
            }

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

            this.sensorReservoir = sensorReservoir;
            this.negativeChargeReservoir = negativeChargeReservoir;
            this.positiveChargeReservoir = positiveChargeReservoir;
        },

        _update: function(time, deltaTime, paused, timeScale) {
            this.voltageMosaic.update();
            this.eFieldVaneMatrix.update();
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
            var chargeView;
            if (charge.get('sign') > 0) {
                chargeView = new PositiveChargeView({ 
                    model: charge,
                    mvt: this.mvt,
                    reservoir: this.positiveChargeReservoir
                });
            }
            else {
                chargeView = new NegativeChargeView({ 
                    model: charge,
                    mvt: this.mvt,
                    reservoir: this.negativeChargeReservoir
                });
            }

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
                simulation: this.simulation,
                model: sensor,
                mvt: this.mvt,
                reservoir: this.sensorReservoir
            });

            if (this.showingNumbers)
                sensorView.showNumbers();

            this.sensors.addChild(sensorView.displayObject);
            this.sensorViews.push(sensorView);
        },

        showGrid: function() {
            this.gridLayer.visible = true;
        },

        hideGrid: function() {
            this.gridLayer.visible = false;
        },

        showVoltageMosaic: function() {
            this.voltageMosaic.show();
        },

        hideVoltageMosaic: function() {
            this.voltageMosaic.hide();
        },

        showEFieldVaneMatrix: function() {
            this.eFieldVaneMatrix.show();
        },

        hideEFieldVaneMatrix: function() {
            this.eFieldVaneMatrix.hide();
        },

        setEFieldVaneMatrixDirectionOnly: function(directionOnly) {
            this.eFieldVaneMatrix.setDirectionOnly(directionOnly);
        },

        showNumbers: function() {
            this.showingNumbers = true;
            for (var i = 0; i < this.sensorViews.length; i++)
                this.sensorViews[i].showNumbers();
            this.scaleLegend.show();
        },

        hideNumbers: function() {
            this.showingNumbers = false;
            for (var i = 0; i < this.sensorViews.length; i++)
                this.sensorViews[i].hideNumbers();
            this.scaleLegend.hide();
        }

    });

    return ChargesAndFieldsSceneView;
});

define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView      = require('common/v3/pixi/view/scene');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');
    var Rectangle          = require('common/math/rectangle');

    var BFieldOutsideView = require('views/bfield/outside');
    var BFieldInsideView  = require('views/bfield/inside');
    var FieldMeterView    = require('views/field-meter');
    var CompassView       = require('views/compass');
    var BarMagnetView     = require('views/bar-magnet');
    var PickupCoilView    = require('views/pickup-coil');
    var ElectromagnetView = require('views/electromagnet');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var FaradaySceneView = PixiSceneView.extend({

        magnetModel: undefined,

        events: {
            
        },

        initialize: function(options) {
            options = _.extend({
                pickupCoilDraggable: true
            }, options);

            this.pickupCoilDraggable = options.pickupCoilDraggable;

            PixiSceneView.prototype.initialize.apply(this, arguments);
        },

        renderContent: function() {
            
        },

        postRender: function() {
            PixiSceneView.prototype.postRender.apply(this, arguments);

            if (this.magnetModel)
                this.initFieldMeter();
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.bottomLayer = new PIXI.Container();
            this.middleLayer = new PIXI.Container();
            this.topLayer = new PIXI.Container();

            this.stage.addChild(this.bottomLayer);
            this.stage.addChild(this.middleLayer);
            this.stage.addChild(this.topLayer);

            this.initMVT();
            if (this.magnetModel)
                this.initOutsideBField();
        },

        initMVT: function() {
            // Map the simulation bounds...
            var simWidth  = Constants.SCENE_WIDTH;
            var simHeight = Constants.SCENE_HEIGHT;

            // ...to the usable screen space that we have
            var controlsWidth = 220;
            var margin = 20;
            var rightMargin = 0; //0 + controlsWidth + margin;
            var usableWidth = this.width - rightMargin;
            var usableHeight = this.height; // - 62;

            var simRatio = simWidth / simHeight;
            var screenRatio = usableWidth / usableHeight;
            
            var scale = (screenRatio > simRatio) ? usableHeight / simHeight : usableWidth / simWidth;
            
            this.viewOriginX = (usableWidth - simWidth * scale) / 2; // Center it
            this.viewOriginY = 0;

            this.mvt = ModelViewTransform.createSinglePointScaleMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                scale
            );
        },

        initOutsideBField: function() {
            this.bFieldOutsideView = new BFieldOutsideView({
                mvt: this.mvt,
                magnetModel: this.magnetModel,
                xSpacing:    Constants.GRID_SPACING, 
                ySpacing:    Constants.GRID_SPACING,
                needleWidth: Constants.GRID_NEEDLE_WIDTH,
                bounds: new Rectangle(0, 0, this.width, this.height)
            });

            this.middleLayer.addChild(this.bFieldOutsideView.displayObject);
        },

        initCompass: function() {
            this.compassView = new CompassView({
                mvt: this.mvt,
                model: this.simulation.compass,
                simulation: this.simulation
            });

            this.middleLayer.addChild(this.compassView.displayObject);
        },

        initBarMagnet: function() {
            this.barMagnetView = new BarMagnetView({
                mvt: this.mvt,
                model: this.simulation.barMagnet,
                simulation: this.simulation
            });

            this.middleLayer.addChild(this.barMagnetView.displayObject);
        },

        initFieldMeter: function() {
            this.fieldMeterView = new FieldMeterView({
                mvt: this.mvt,
                model: this.simulation.fieldMeter,
                magnetModel: this.magnetModel,
                dragFrame: this.ui
            });

            this.$ui.append(this.fieldMeterView.render().el);
        },

        initPickupCoil: function() {
            this.pickupCoilView = new PickupCoilView({
                mvt: this.mvt,
                model: this.simulation.pickupCoil,
                simulation: this.simulation,
                draggingEnabled: this.pickupCoilDraggable
            });

            this.bottomLayer.addChild(this.pickupCoilView.backgroundLayer);
            this.topLayer.addChild(this.pickupCoilView.foregroundLayer);
        },

        initInsideBField: function() {
            this.bFieldInsideView = new BFieldInsideView({
                mvt: this.mvt,
                magnetModel: this.magnetModel,
                needleWidth: Constants.GRID_NEEDLE_WIDTH
            });

            this.middleLayer.addChild(this.bFieldInsideView.displayObject);

            this.bFieldInsideView.hide();
        },

        initElectromagnet: function() {
            this.electromagnetView = new ElectromagnetView({
                mvt: this.mvt,
                model: this.simulation.electromagnet,
                simulation: this.simulation
            });

            this.bottomLayer.addChild(this.electromagnetView.backgroundLayer);
            this.topLayer.addChild(this.electromagnetView.foregroundLayer);
        },

        setNeedleSpacing: function(spacing) {
            this.bFieldOutsideView.setNeedleSpacing(spacing);
        },

        setNeedleSize: function(width, height) {
            this.bFieldOutsideView.setNeedleWidth(width);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            this.bFieldOutsideView.update();
            this.fieldMeterView.update();
        },

        showOutsideField: function() {
            this.bFieldOutsideView.show();
        },

        hideOutsideField: function() {
            this.bFieldOutsideView.hide();
        },

        showInsideBarMagnet: function() {
            this.bFieldInsideView.show();
        },

        hideInsideBarMagnet: function() {
            this.bFieldInsideView.hide();
        },

        showFieldMeter: function() {
            this.fieldMeterView.show();
        },

        hideFieldMeter: function() {
            this.fieldMeterView.hide();
        },

        showCompass: function() {
            this.compassView.show();
        },

        hideCompass: function() {
            this.compassView.hide();
        },

        showElectromagnetElectrons: function() {
            this.electromagnetView.showElectrons();
        },

        hideElectromagnetElectrons: function() {
            this.electromagnetView.hideElectrons();
        },

        showPickupCoilElectrons: function() {
            this.pickupCoilView.showElectrons();
        },

        hidePickupCoilElectrons: function() {
            this.pickupCoilView.hideElectrons();
        }

    });

    return FaradaySceneView;
});

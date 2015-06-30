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

    var ObjectReservoir = require('views/object-reservoir');

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
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.initMVT();
            this.initGrid();
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

        initReservoirs: function() {
            var minusChargeReservoir = new ObjectReservoir({
                dummyLayer: this.stage,
                simulation: this.simulation,
                mvt: this.mvt,
                labelText: '1 nC'
            });

            var $lastChild = $('.sim-controls-wrapper').children().last();
            var childOffset = $lastChild.offset();
            var sceneOffset = this.$el.offset();

            minusChargeReservoir.displayObject.x = childOffset.left - sceneOffset.left;
            minusChargeReservoir.displayObject.y = childOffset.top - sceneOffset.top + $lastChild.outerHeight() + 4;

            var plusChargeReservoir = new ObjectReservoir({
                dummyLayer: this.stage,
                simulation: this.simulation,
                mvt: this.mvt,
                labelText: '1 nC'
            });

            plusChargeReservoir.displayObject.x = minusChargeReservoir.displayObject.x;
            plusChargeReservoir.displayObject.y = minusChargeReservoir.displayObject.y + minusChargeReservoir.displayObject.height + 4;

            var sensorReservoir = new ObjectReservoir({
                dummyLayer: this.stage,
                simulation: this.simulation,
                mvt: this.mvt,
                labelText: 'E-Field Sensors'
            });

            sensorReservoir.displayObject.x = plusChargeReservoir.displayObject.x;
            sensorReservoir.displayObject.y = plusChargeReservoir.displayObject.y + plusChargeReservoir.displayObject.height + 4;

            this.stage.addChild(minusChargeReservoir.displayObject);
            this.stage.addChild(plusChargeReservoir.displayObject);
            this.stage.addChild(sensorReservoir.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
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

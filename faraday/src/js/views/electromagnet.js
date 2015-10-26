define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');
    var Vector2  = require('common/math/vector2');

    var CoilView          = require('views/coil');
    var BatteryView       = require('views/battery');
    var ACPowerSupplyView = require('views/ac-power-supply');

    var Assets = require('assets');

    var Constants = require('constants');

    /**
     * View that represents the electromagnet model
     */
    var ElectromagnetView = PixiView.extend({

        events: {
            'touchstart      .foregroundLayer': 'dragStart',
            'mousedown       .foregroundLayer': 'dragStart',
            'touchmove       .foregroundLayer': 'drag',
            'mousemove       .foregroundLayer': 'drag',
            'touchend        .foregroundLayer': 'dragEnd',
            'mouseup         .foregroundLayer': 'dragEnd',
            'touchendoutside .foregroundLayer': 'dragEnd',
            'mouseupoutside  .foregroundLayer': 'dragEnd'
        },

        /**
         * Initializes the new ElectromagnetView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;

            this._dragOffset   = new PIXI.Point();
            this._dragLocation = new PIXI.Point();
            this._vec = new Vector2();

            this.initGraphics();

            this.listenTo(this.model, 'change:position', this.updatePosition);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.foregroundLayer = new PIXI.Container();
            this.backgroundLayer = new PIXI.Container();

            this.foregroundLayer.buttonMode = true;

            this.initCoilView();
            this.initBatteryView();
            this.initAcPowerSupplyView();

            this.updateMVT(this.mvt);
        },

        initCoilView: function() {
            this.coilView = new CoilView({
                mvt: this.mvt,
                model: this.model.get('sourceCoilModel'),
                simulation: this.simulation,
                endsConnected: true
            });

            this.backgroundLayer.addChild(this.coilView.backgroundLayer);
            this.foregroundLayer.addChild(this.coilView.foregroundLayer);
        },

        initBatteryView: function() {
            this.batteryView = new BatteryView({
                mvt: this.mvt,
                model: this.simulation.battery,
                simulation: this.simulation
            });

            this.foregroundLayer.addChild(this.batteryView.displayObject);
        },

        initAcPowerSupplyView: function() {
            this.acPowerSupplyView = new ACPowerSupplyView({
                mvt: this.mvt,
                model: this.simulation.acPowerSupply,
                simulation: this.simulation
            });

            this.foregroundLayer.addChild(this.acPowerSupplyView.displayObject);
        },

        update: function(time, deltaTime, paused) {
            this.coilView.update(time, deltaTime, paused);
            this.batteryView.update(time, deltaTime, paused);
            this.acPowerSupplyView.update(time, deltaTime, paused);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.updateComponentPositions();
            this.updatePosition(this.model, this.model.get('position'));
        },

        updatePosition: function(model, position) {
            var viewPosition = this.mvt.modelToView(position);
            this.backgroundLayer.x = viewPosition.x;
            this.backgroundLayer.y = viewPosition.y;
            this.foregroundLayer.x = viewPosition.x;
            this.foregroundLayer.y = viewPosition.y;
        },

        updateComponentPositions: function() {
            var x = 0;
            var y = -this.coilView.getTopOffset();
            this.batteryView.displayObject.x = x;
            this.batteryView.displayObject.y = y;
            this.acPowerSupplyView.displayObject.x = x;
            this.acPowerSupplyView.displayObject.y = y;
        },

        dragStart: function(event) {
            if (this.simulation.get('paused'))
                return;

            this.dragOffset = event.data.getLocalPosition(this.foregroundLayer, this._dragOffset);
            this.dragging = true;
        },

        drag: function(event) {
            if (this.dragging) {
                var local = event.data.getLocalPosition(this.foregroundLayer.parent, this._dragLocation);
                var x = local.x - this.dragOffset.x;
                var y = local.y - this.dragOffset.y;
                
                var mx = this.mvt.viewToModelX(x);
                var my = this.mvt.viewToModelY(y);

                this.model.setPosition(mx, my);
            }
        },

        dragEnd: function(event) {
            this.dragging = false;
        },

        showElectrons: function() {
            this.coilView.enableElectronAnimation();
        },

        hideElectrons: function() {
            this.coilView.disableElectronAnimation();
        }

    });


    return ElectromagnetView;
});
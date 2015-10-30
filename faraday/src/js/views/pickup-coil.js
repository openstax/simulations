define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');
    var Vector2  = require('common/math/vector2');

    var CoilView      = require('views/coil');
    var LightbulbView = require('views/lightbulb');
    var VoltmeterView = require('views/voltmeter');

    var Assets = require('assets');

    var Constants = require('constants');

    /**
     * PickupCoilView is the graphical representation of a pickup coil, with
     *   indicators (lightbulb and voltmeter) for displaying the effect of
     *   electromagnetic induction.
     */
    var PickupCoilView = PixiView.extend({

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
         * Initializes the new PickupCoilView.
         */
        initialize: function(options) {
            options = _.extend({
                draggingEnabled: true
            }, options);

            this.mvt = options.mvt;
            this.simulation = options.simulation;
            this.draggingEnabled = options.draggingEnabled;

            this._dragOffset   = new PIXI.Point();
            this._dragLocation = new PIXI.Point();
            this._vec = new Vector2();

            this.initGraphics();

            this.listenTo(this.model, 'change:position', this.updatePosition);
            this.listenTo(this.model, 'change:radius',   this.updateComponentPositions);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.foregroundLayer = new PIXI.Container();
            this.backgroundLayer = new PIXI.Container();

            if (this.draggingEnabled)
                this.foregroundLayer.buttonMode = true;

            this.initCoilView();
            this.initLightbulb();
            this.initVoltmeter();

            this.updateMVT(this.mvt);
        },

        initCoilView: function() {
            this.coilView = new CoilView({
                mvt: this.mvt,
                model: this.model,
                simulation: this.simulation,
                endsConnected: true
            });

            this.backgroundLayer.addChild(this.coilView.backgroundLayer);
            this.foregroundLayer.addChild(this.coilView.foregroundLayer);
        },

        initLightbulb: function() {
            this.lightbulbView = new LightbulbView({
                mvt: this.mvt,
                model: this.simulation.lightbulb,
                simulation: this.simulation
            });

            this.foregroundLayer.addChild(this.lightbulbView.displayObject);
        },

        initVoltmeter: function() {
            this.voltmeterView = new VoltmeterView({
                mvt: this.mvt,
                model: this.simulation.voltmeter,
                simulation: this.simulation
            });

            this.foregroundLayer.addChild(this.voltmeterView.displayObject);
        },

        update: function(time, deltaTime, paused) {
            this.coilView.update(time, deltaTime, paused);
            this.lightbulbView.update(time, deltaTime, paused);
            this.voltmeterView.update(time, deltaTime, paused);
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
            var x = -10;
            var y = -this.coilView.getTopOffset();
            this.lightbulbView.displayObject.x = x;
            this.lightbulbView.displayObject.y = y + 25;
            this.voltmeterView.displayObject.x = x + 5;
            this.voltmeterView.displayObject.y = y + 15;
        },

        dragStart: function(event) {
            if (this.simulation.get('paused') || !this.draggingEnabled)
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


    return PickupCoilView;
});
define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var PixiView       = require('common/v3/pixi/view');
    var Colors         = require('common/colors/colors');

    var Constants = require('constants');

    var Assets = require('assets');

    /**
     * A view that represents an atom
     */
    var IntensityMeterView = PixiView.extend({

        events: {
            'touchstart      .body': 'dragStart',
            'mousedown       .body': 'dragStart',
            'touchmove       .body': 'drag',
            'mousemove       .body': 'drag',
            'touchend        .body': 'dragEnd',
            'mouseup         .body': 'dragEnd',
            'touchendoutside .body': 'dragEnd',
            'mouseupoutside  .body': 'dragEnd',

            'touchstart      .sensor': 'dragSensorStart',
            'mousedown       .sensor': 'dragSensorStart',
            'touchmove       .sensor': 'dragSensor',
            'mousemove       .sensor': 'dragSensor',
            'touchend        .sensor': 'dragSensorEnd',
            'mouseup         .sensor': 'dragSensorEnd',
            'touchendoutside .sensor': 'dragSensorEnd',
            'mouseupoutside  .sensor': 'dragSensorEnd',
        },

        /**
         * Initializes the new IntensityMeterView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;

            this.wireColor = Colors.parseHex('#333');
            this.wireThickness = 6;

            // Cached objects
            this._dragOffset = new PIXI.Point();

            this.initGraphics();

            this.listenTo(this.model, 'change:bodyPosition',   this.updateBodyPosition);
            this.listenTo(this.model, 'change:sensorPosition', this.updateSensorPosition);
            this.listenTo(this.model, 'change:reading',        this.updateReadout);
            this.listenTo(this.model, 'change:enabled',        this.enabledChanged);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.initPanel();
            this.initSensor();
            this.initReadoutText();
            this.initWire();

            this.updateMVT(this.mvt);
        },

        initPanel: function() {
            this.body = Assets.createSprite(Assets.Images.INTENSITY_METER_BODY);
            this.body.anchor.x = (6 / 166);
            this.body.anchor.y = (6 / 102);
            this.body.buttonMode = true;

            this.displayObject.addChild(this.body);
        },

        initSensor: function() {
            this.sensor = Assets.createSprite(Assets.Images.INTENSITY_METER_SENSOR);
            this.sensor.anchor.x = 0.5;
            this.sensor.anchor.y = (50 / 158);
            this.sensor.buttonMode = true;

            this.displayObject.addChild(this.sensor);
        },

        initReadoutText: function() {

            var readoutTextSettings = {
                font: '18px Helvetica Neue',
                fill: '#000'
            };

            var readout = new PIXI.Text('100 %', readoutTextSettings);
            readout.x = Math.floor(this.body.width * (140 / 166));
            readout.y = Math.floor(this.body.height * (63 / 102) - readout.height * 0.4);
            readout.anchor.x = 1;

            this.body.addChild(readout);

            this.readout = readout;
        },

        initWire: function() {
            this.wireGraphics = new PIXI.Graphics();
            this.displayObject.addChildAt(this.wireGraphics, 0);
        },

        drawWire: function() {
            var graphics = this.wireGraphics;

            var sensor = this.sensor;
            var x0 = sensor.x;
            var y0 = sensor.y + sensor.height * (102 / 158) - this.wireThickness;

            var x1 = this.body.x + this.wireThickness;
            var y1 = this.body.y + this.body.height * (45 / 102);

            var c1x = x0;
            var c1y = y0 + sensor.height * 0.25;

            var c2x = x1 - sensor.height * 0.25;
            var c2y = y1;

            graphics.clear();
            graphics.lineStyle(this.wireThickness, this.wireColor, 1);
            graphics.moveTo(x0, y0);
            graphics.bezierCurveTo(c1x, c1y, c2x, c2y, x1, y1);
        },

        updateReadout: function(model, intensity) {
            if (intensity === null)
                this.readout.setText('—');
            else
                this.readout.setText((intensity * 100).toFixed(2) + '%');
        },

        updateBodyPosition: function(model, position) {
            var viewPosition = this.mvt.modelToView(position);
            this.body.x = viewPosition.x;
            this.body.y = viewPosition.y;
            this.drawWire();
        },

        updateSensorPosition: function(model, position) {
            var viewPosition = this.mvt.modelToView(position);
            this.sensor.x = viewPosition.x;
            this.sensor.y = viewPosition.y;
            this.drawWire();
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.updateBodyPosition(this.model, this.model.get('bodyPosition'));
            this.updateSensorPosition(this.model, this.model.get('sensorPosition'));
            this.updateReadout(this.model, this.model.get('reading'));
        },

        dragStart: function(event) {
            this.dragOffset = event.data.getLocalPosition(this.body, this._dragOffset);
            this.dragging = true;
        },

        drag: function(event) {
            if (this.dragging) {
                var dx = event.data.global.x - this.body.x - this.dragOffset.x;
                var dy = event.data.global.y - this.body.y - this.dragOffset.y;
                
                var mdx = this.mvt.viewToModelDeltaX(dx);
                var mdy = this.mvt.viewToModelDeltaY(dy);

                this.model.translateBody(mdx, mdy);
            }
        },

        dragEnd: function(event) {
            this.dragging = false;
        },

        dragSensorStart: function(event) {
            this.dragOffset = event.data.getLocalPosition(this.sensor, this._dragOffset);
            this.draggingSensor = true;
        },

        dragSensor: function(event) {
            if (this.draggingSensor) {
                var dx = event.data.global.x - this.sensor.x - this.dragOffset.x;
                var dy = event.data.global.y - this.sensor.y - this.dragOffset.y;
                
                var mdx = this.mvt.viewToModelDeltaX(dx);
                var mdy = this.mvt.viewToModelDeltaY(dy);

                this.model.translateSensor(mdx, mdy);
            }
        },

        dragSensorEnd: function(event) {
            this.draggingSensor = false;
        },

        show: function() {
            this.displayObject.visible = true;
        },

        hide: function() {
            this.displayObject.visible = false;
        },

        enabledChanged: function(model, enabled) {
            if (enabled)
                this.show();
            else
                this.hide();
        }

    });


    return IntensityMeterView;
});
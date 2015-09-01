define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var PixiView       = require('common/pixi/view');
    var Colors         = require('common/colors/colors');

    var Constants = require('constants');

    var Assets = require('assets');

    /**
     * A view that represents an atom
     */
    var IntensityMeterView = PixiView.extend({

        events: {
            'touchstart      .bodyPanel': 'dragStart',
            'mousedown       .bodyPanel': 'dragStart',
            'touchmove       .bodyPanel': 'drag',
            'mousemove       .bodyPanel': 'drag',
            'touchend        .bodyPanel': 'dragEnd',
            'mouseup         .bodyPanel': 'dragEnd',
            'touchendoutside .bodyPanel': 'dragEnd',
            'mouseupoutside  .bodyPanel': 'dragEnd',

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

            // Cached objects
            this._dragOffset = new PIXI.Point();

            this.initGraphics();

            this.listenTo(this.model, 'change:bodyPosition',   this.updateBodyPosition);
            this.listenTo(this.model, 'change:sensorPosition', this.updateSensorPosition);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.initPanel();
            this.initSensor();
            this.initReadoutText();

            

            this.updateMVT(this.mvt);
        },

        initPanel: function() {
            this.bodyPanel = Assets.createSprite(Assets.Images.INTENSITY_METER_BODY);
            this.bodyPanel.buttonMode = true;

            this.displayObject.addChild(this.bodyPanel);
        },

        initSensor: function() {
            this.sensor = Assets.createSprite(Assets.Images.INTENSITY_METER_SENSOR);
            this.sensor.buttonMode = true;

            this.displayObject.addChild(this.sensor);
        },

        initReadoutText: function() {
            var w = this.width;
            var m = this.margin;

            var readoutTextSettings = {
                font: '16px Helvetica Neue',
                fill: '#555'
            };

            var intensity = new PIXI.Text('Intensity', readoutTextSettings);
            intensity.x = -Math.round(intensity.width / 2);
            intensity.y = m;

            var readout = new PIXI.Text('40.9 V', readoutTextSettings);
            readout.x = w / 2 - m;
            readout.y = m;
            readout.anchor.x = 1;

            this.bodyPanel.addChild(intensity);
            this.bodyPanel.addChild(readout);

            this.readout = readout;
        },

        updateReadout: function(intensity) {
            this.readout.setText((intensity * 100).toFixed(2) + '%');
        },

        updateBodyPosition: function(model, position) {
            var viewPosition = this.mvt.modelToView(position);
            this.bodyPanel.x = viewPosition.x;
            this.bodyPanel.y = viewPosition.y;
        },

        updateSensorPosition: function(model, position) {
            var viewPosition = this.mvt.modelToView(position);
            this.sensor.x = viewPosition.x;
            this.sensor.y = viewPosition.y;
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.updateBodyPosition(this.model, this.model.get('bodyPosition'));
            this.updateSensorPosition(this.model, this.model.get('sensorPosition'));
        },

        dragStart: function(data) {
            this.dragOffset = data.getLocalPosition(this.bodyPanel, this._dragOffset);
            this.dragging = true;
        },

        drag: function(data) {
            if (this.dragging) {
                var dx = data.global.x - this.bodyPanel.x - this.dragOffset.x;
                var dy = data.global.y - this.bodyPanel.y - this.dragOffset.y;
                
                var mdx = this.mvt.viewToModelDeltaX(dx);
                var mdy = this.mvt.viewToModelDeltaY(dy);

                this.model.translateBody(mdx, mdy);
            }
        },

        dragEnd: function(data) {
            this.dragging = false;
        },

        dragSensorStart: function(data) {
            this.dragOffset = data.getLocalPosition(this.sensor, this._dragOffset);
            this.draggingSensor = true;
        },

        dragSensor: function(data) {
            if (this.draggingSensor) {
                var dx = data.global.x - this.sensor.x - this.dragOffset.x;
                var dy = data.global.y - this.sensor.y - this.dragOffset.y;
                
                var mdx = this.mvt.viewToModelDeltaX(dx);
                var mdy = this.mvt.viewToModelDeltaY(dy);

                this.model.translateSensor(mdx, mdy);
            }
        },

        dragSensorEnd: function(data) {
            this.draggingSensor = false;
        },

        show: function() {
            this.displayObject.visible = true;
        },

        hide: function() {
            this.displayObject.visible = false;
        }

    });


    return IntensityMeterView;
});
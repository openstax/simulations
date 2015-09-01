define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
               require('common/pixi/extensions');
    
    var PixiView       = require('common/pixi/view');
    var Colors         = require('common/colors/colors');
    var PiecewiseCurve = require('common/math/piecewise-curve');

    var Constants = require('constants');

    var Assets = require('assets');

    /**
     * A view that represents an atom
     */
    var IntensityMeterView = PixiView.extend({

        width: 200,
        height: 116,
        margin: 15,
        sensorConnectionRadius: 20,
        sensorRadius: 40,

        events: {
            'touchstart      .displayObject': 'dragStart',
            'mousedown       .displayObject': 'dragStart',
            'touchmove       .displayObject': 'drag',
            'mousemove       .displayObject': 'drag',
            'touchend        .displayObject': 'dragEnd',
            'mouseup         .displayObject': 'dragEnd',
            'touchendoutside .displayObject': 'dragEnd',
            'mouseupoutside  .displayObject': 'dragEnd',

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

            this.panelColor = Colors.parseHex('#ededed');
            this.plotBtnColor = Colors.parseHex('#21366b');
            this.clearBtnColor = Colors.parseHex('#bbb');

            this.plotViews = [];

            // Cached objects
            this._dragOffset = new PIXI.Point();

            this.initGraphics();

            this.listenTo(this.model, 'change:bodyPosition', this.updateBodyPosition);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.initPanel();
            this.initSensor();
            this.initReadoutText();

            this.displayObject.buttonMode = true;

            this.updateMVT(this.mvt);
        },

        initPanel: function() {
            this.bodyPanel = new PIXI.DisplayObjectContainer();

            var halfWidth = this.width / 2;

            // Draw the shadow
            var outline = new PiecewiseCurve();
            var kappa = 4 * ((Math.sqrt(2) - 1) / 3);
            var radius = this.sensorConnectionRadius;

            outline
                .moveTo(-halfWidth, 0)
                .lineTo(-radius, 0)
                .curveTo(
                    -radius, 0 -radius * kappa, 
                    -radius*kappa, -radius,
                    0, -radius
                )
                .curveTo(
                    radius * kappa, -radius,
                    radius, -radius * kappa,
                    radius, 0
                )
                .lineTo(halfWidth, 0)
                .lineTo(halfWidth, this.height)
                .lineTo(-halfWidth, this.height)
                .close();

            var drawStyle = {
                lineWidth: 11,
                strokeStyle: 'rgba(0,0,0,0)',
                shadowBlur: 11,
                fillStyle: 'rgba(0,0,0,1)'
            };

            var shadow = PIXI.Sprite.fromPiecewiseCurve(outline, drawStyle);
            shadow.alpha = 0.3;
            this.bodyPanel.addChild(shadow);

            // Draw the panel
            var graphics = new PIXI.Graphics();
            graphics.beginFill(this.panelColor, 1);
            graphics.drawRect(-halfWidth, 0, this.width, this.height);
            graphics.drawCircle(0, 0, this.sensorConnectionRadius);
            graphics.endFill();

            this.bodyPanel.addChild(graphics);
            this.displayObject.addChild(this.bodyPanel);
        },

        initSensor: function() {
            
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

        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.updateBodyPosition(this.model, this.model.get('bodyPosition'));
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

        show: function() {
            this.displayObject.visible = true;
        },

        hide: function() {
            this.displayObject.visible = false;
        }

    });


    return IntensityMeterView;
});
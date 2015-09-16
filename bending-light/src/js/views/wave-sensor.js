define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var ModelViewTransform = require('common/math/model-view-transform');
    var Rectangle          = require('common/math/rectangle');
    var Vector2            = require('common/math/vector2');
    var PixiView           = require('common/v3/pixi/view');
    var Colors             = require('common/colors/colors');

    var Constants = require('constants');

    var Assets = require('assets');

    /**
     * A view that represents an atom
     */
    var WaveSensorView = PixiView.extend({

        events: {
            'touchstart      .body': 'dragStart',
            'mousedown       .body': 'dragStart',
            'touchmove       .body': 'drag',
            'mousemove       .body': 'drag',
            'touchend        .body': 'dragEnd',
            'mouseup         .body': 'dragEnd',
            'touchendoutside .body': 'dragEnd',
            'mouseupoutside  .body': 'dragEnd',

            'touchstart      .probe1': 'dragProbe1Start',
            'mousedown       .probe1': 'dragProbe1Start',
            'touchmove       .probe1': 'dragProbe1',
            'mousemove       .probe1': 'dragProbe1',
            'touchend        .probe1': 'dragProbe1End',
            'mouseup         .probe1': 'dragProbe1End',
            'touchendoutside .probe1': 'dragProbe1End',
            'mouseupoutside  .probe1': 'dragProbe1End',

            'touchstart      .probe2': 'dragProbe2Start',
            'mousedown       .probe2': 'dragProbe2Start',
            'touchmove       .probe2': 'dragProbe2',
            'mousemove       .probe2': 'dragProbe2',
            'touchend        .probe2': 'dragProbe2End',
            'mouseup         .probe2': 'dragProbe2End',
            'touchendoutside .probe2': 'dragProbe2End',
            'mouseupoutside  .probe2': 'dragProbe2End'
        },

        /**
         * Initializes the new WaveSensorView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;

            var probe1Color = '#0093ff';
            var probe2Color = '#ff2600';
            this.probe1Color = Colors.parseHex(probe1Color);
            this.probe2Color = Colors.parseHex(probe2Color);
            this.probeThickness = 8;
            this.probeRadius = 8;

            this.wire1Color = Colors.parseHex(Colors.darkenHex(probe1Color, 0.3));
            this.wire2Color = Colors.parseHex(Colors.darkenHex(probe2Color, 0.3));
            this.wireThickness = 3;

            this.gridColor  = Colors.parseHex('#ccc');
            this.lineWidth  = 2;
            this.gridLineWidth = 1;

            // Cached objects
            this._dragOffset = new PIXI.Point();
            this._modelPoint = new Vector2();

            this.initGraphics();

            this.listenTo(this.model, 'change:bodyPosition',   this.updateBodyPosition);
            this.listenTo(this.model, 'change:probe1Position', this.updateProbe1Position);
            this.listenTo(this.model, 'change:probe2Position', this.updateProbe2Position);
            this.listenTo(this.model, 'change:enabled',        this.enabledChanged);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.initPanel();
            this.initProbes();
            this.initWires();
            this.initGraphs();

            this.updateMVT(this.mvt);
        },

        initPanel: function() {
            this.body = Assets.createSprite(Assets.Images.WAVE_SENSOR_BODY);
            this.body.anchor.x = (6 / 200);
            this.body.anchor.y = (6 / 140);
            this.body.buttonMode = true;

            this.displayObject.addChild(this.body);
        },

        initProbes: function() {
            this.probe1 = this.createProbe(this.probe1Color, this.wire1Color);
            this.probe2 = this.createProbe(this.probe2Color, this.wire2Color);

            this.displayObject.addChildAt(this.probe1, 0);
            this.displayObject.addChildAt(this.probe2, 0);
        },

        createProbe: function(color, wireColor) {
            var probe = new PIXI.Graphics();
            probe.buttonMode = true;
            probe.hitArea = new PIXI.Circle(0, 0, this.probeRadius + (this.probeThickness / 2));

            probe.lineStyle(this.probeThickness, color, 1);
            probe.arc(0, 0, this.probeRadius, 0, Math.PI * 2);

            var offset = this.probeRadius - (this.probeThickness / 2);
            var lineLength = Math.floor(this.probeThickness * 0.7);
            probe.lineStyle(2, wireColor, 1);
            probe.moveTo(0, -offset);
            probe.lineTo(0, -offset - lineLength);
            probe.moveTo(0,  offset);
            probe.lineTo(0,  offset + lineLength);
            probe.moveTo(-offset,              0);
            probe.lineTo(-offset - lineLength, 0);
            probe.moveTo( offset,              0);
            probe.lineTo( offset + lineLength, 0);

            return probe;
        },

        initWires: function() {
            this.wire1Graphics = new PIXI.Graphics();
            this.wire2Graphics = new PIXI.Graphics();

            this.displayObject.addChildAt(this.wire1Graphics, 0);
            this.displayObject.addChildAt(this.wire2Graphics, 0);
        },

        initGraphs: function() {
            var plotX = this.body.width  *  (9 / 200);
            var plotY = this.body.height * (10 / 140);
            var plotWidth  = this.body.width  * (170 / 200);
            var plotHeight = this.body.height *  (97 / 140);

            this.plotMask = new PIXI.Graphics();
            this.plotMask.x = plotX;
            this.plotMask.y = plotY;
            this.plotMask.beginFill();
            this.plotMask.drawRect(0, 0, plotWidth, plotHeight);
            this.plotMask.endFill();

            this.graph1 = new PIXI.Graphics();
            this.graph1.x = plotX;
            this.graph1.y = plotY;
            this.graph1.mask = this.plotMask;

            this.graph2 = new PIXI.Graphics();
            this.graph2.x = plotX;
            this.graph2.y = plotY;
            this.graph2.mask = this.plotMask;

            this.body.addChild(this.plotMask);
            this.body.addChild(this.graph1);
            this.body.addChild(this.graph2);

            this.plotX = plotX;
            this.plotY = plotY;
            this.plotWidth = plotWidth;
            this.plotHeight = plotHeight;

            this.plotDataLength = plotWidth;

            // Amount of time to show on the horizontal axis of the chart
            var timeWidth = 100 * Constants.MAX_DT / Constants.TIME_SPEEDUP_SCALE;
            this.timeWidth = timeWidth;
            var modelBounds = new Rectangle(0, -1, timeWidth, 2);
            var viewBounds = new Rectangle(0, 0, this.plotWidth, this.plotHeight);
            this.plotMvt = ModelViewTransform.createRectangleMapping(modelBounds, viewBounds);

            this.tickX = 0;
            this.tickSpace = 40;

            this.yScale = plotHeight / 2;
            this.yOffset = Math.floor(-1 * this.yScale);
        },

        drawWire: function(graphics, wireColor, probe, connectionPointX, connectionPointY) {
            var x0 = probe.x;
            var y0 = probe.y + this.probeRadius;

            var x1 = connectionPointX;
            var y1 = connectionPointY;

            var c1x = x0;
            var c1y = y0 + probe.height * 0.25;

            var c2x = x1;
            var c2y = y1 - probe.height * 0.25;

            graphics.clear();
            graphics.lineStyle(this.wireThickness, wireColor, 1);
            graphics.moveTo(x0, y0);
            graphics.bezierCurveTo(c1x, c1y, c2x, c2y, x1, y1);

            // This is a little workaround for a current Pixi 3 bug:
            if (graphics.currentPath && graphics.currentPath.shape)
                graphics.currentPath.shape.closed = false;
        },

        drawWire1: function() {
            var x = this.body.x + this.body.width * (20 / 200);
            var y = this.body.y;
            this.drawWire(this.wire1Graphics, this.wire1Color, this.probe1, x, y);
        },

        drawWire2: function() {
            var x = this.body.x + this.body.width * (40 / 200);
            var y = this.body.y;
            this.drawWire(this.wire2Graphics, this.wire2Color, this.probe2, x, y);
        },

        drawWires: function() {
            this.drawWire1();
            this.drawWire2();
        },

        drawGraph: function(graphics, color, data) {
            var plotWidth  = this.plotWidth;
            var plotHeight = this.plotHeight;
            var yScale     = this.yScale;
            var yOffset    = this.yOffset;
            var tickX      = this.tickX;
            var tickSpace  = this.tickSpace;
            
            var values = data.values;
            var times  = data.times;

            graphics.clear();

            // Draw horizontal lines
            graphics.lineStyle(this.gridLineWidth, this.gridColor, 1);
            graphics.moveTo(0,         plotHeight / 2);
            graphics.lineTo(plotWidth, plotHeight / 2);

            // Draw vertical lines
            for (var x = 0; x < plotWidth; x++) {
                if ((x % tickSpace) === tickX) {
                    graphics.moveTo(x, 0);
                    graphics.lineTo(x, plotHeight);
                }
            }

            // Draw data points
            if (values.length) {
                graphics.lineStyle(this.lineWidth, color, 1);

                var minTime = this.simulation.simTime - this.timeWidth;

                var modelPoint = this._modelPoint;
                var viewPoint;
                if (_.isNumber(values[0])) {
                    modelPoint.set(times[0] - minTime, values[0]);
                    viewPoint = this.plotMvt.modelToView(modelPoint);
                    graphics.moveTo(viewPoint.x, viewPoint.y);
                }
                    
                for (var i = 1; i < values.length; i++) {
                    if (values[i] !== null) {
                        modelPoint.set(times[i] - minTime, values[i]);
                        viewPoint = this.plotMvt.modelToView(modelPoint);
                        graphics.lineTo(viewPoint.x, viewPoint.y);
                    }
                }

                if (graphics.currentPath && graphics.currentPath.shape)
                    graphics.currentPath.shape.closed = false;
            }
            
        },

        drawGraphs: function() {
            this.drawGraph(this.graph1, this.probe1Color, this.model.getProbe1Series());
            this.drawGraph(this.graph2, this.probe2Color, this.model.getProbe2Series());
        },

        updateBodyPosition: function(model, position) {
            var viewPosition = this.mvt.modelToView(position);
            this.body.x = viewPosition.x;
            this.body.y = viewPosition.y;
            this.drawWires();
        },

        updateProbe1Position: function(model, position) {
            var viewPosition = this.mvt.modelToView(position);
            this.probe1.x = viewPosition.x;
            this.probe1.y = viewPosition.y;
            this.drawWire1();
        },

        updateProbe2Position: function(model, position) {
            var viewPosition = this.mvt.modelToView(position);
            this.probe2.x = viewPosition.x;
            this.probe2.y = viewPosition.y;
            this.drawWire2();
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.updateBodyPosition(this.model, this.model.get('bodyPosition'));
            this.updateProbe1Position(this.model, this.model.get('probe1Position'));
            this.updateProbe2Position(this.model, this.model.get('probe2Position'));
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

        dragProbe1Start: function(event) {
            this.dragOffset = event.data.getLocalPosition(this.probe1, this._dragOffset);
            this.draggingProbe1 = true;
        },

        dragProbe1: function(event) {
            if (this.draggingProbe1) {
                var dx = event.data.global.x - this.probe1.x - this.dragOffset.x;
                var dy = event.data.global.y - this.probe1.y - this.dragOffset.y;
                
                var mdx = this.mvt.viewToModelDeltaX(dx);
                var mdy = this.mvt.viewToModelDeltaY(dy);

                this.model.translateProbe1(mdx, mdy);
            }
        },

        dragProbe1End: function(event) {
            this.draggingProbe1 = false;
        },

        dragProbe2Start: function(event) {
            this.dragOffset = event.data.getLocalPosition(this.probe2, this._dragOffset);
            this.draggingProbe2 = true;
        },

        dragProbe2: function(event) {
            if (this.draggingProbe2) {
                var dx = event.data.global.x - this.probe2.x - this.dragOffset.x;
                var dy = event.data.global.y - this.probe2.y - this.dragOffset.y;
                
                var mdx = this.mvt.viewToModelDeltaX(dx);
                var mdy = this.mvt.viewToModelDeltaY(dy);

                this.model.translateProbe2(mdx, mdy);
            }
        },

        dragProbe2End: function(event) {
            this.draggingProbe2 = false;
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


    return WaveSensorView;
});
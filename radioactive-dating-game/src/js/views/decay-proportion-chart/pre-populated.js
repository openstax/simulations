define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var DatableItemDecayProportionChartView = require('radioactive-dating-game/views/decay-proportion-chart/datable-item');

    var Constants = require('constants');
    var NUM_SAMPLES_ON_DECAY_CHART = 500;

    /**
     * A panel that contains a chart showing the timeline for decay of nuclei over time.
     */
    var PrePopulatedDatableItemDecayProportionChartView = DatableItemDecayProportionChartView.extend({

        events: _.extend({}, DatableItemDecayProportionChartView.prototype.events, {
            'touchstart      .handle': 'dragStart',
            'mousedown       .handle': 'dragStart',
            'touchmove       .handle': 'drag',
            'mousemove       .handle': 'drag',
            'touchend        .handle': 'dragEnd',
            'mouseup         .handle': 'dragEnd',
            'touchendoutside .handle': 'dragEnd',
            'mouseupoutside  .handle': 'dragEnd'
        }),

        /**
         * Initializes the new PrePopulatedDatableItemDecayProportionChartView.
         */
        initialize: function(options) {
            options = _.extend({
                
            }, options);

            DatableItemDecayProportionChartView.prototype.initialize.apply(this, [options]);       
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            DatableItemDecayProportionChartView.prototype.initGraphics.apply(this, arguments);

            this.initHandle();
        },

        initHandle: function() {
            this.handleLabel = new PIXI.Container();
            this.handleGraphics = new PIXI.Graphics();
            this.handleDraggingGraphics = new PIXI.Graphics();
            this.handleDraggingGraphics.visible = false;
            this.handleHandle = new PIXI.Container();

            this.handle = new PIXI.Container();
            this.handle.buttonMode = true;
            this.handle.defaultCursor = 'ew-resize';
            this.handle.addChild(this.handleLabel);
            this.handle.addChild(this.handleGraphics);
            this.handle.addChild(this.handleDraggingGraphics);
            this.handle.addChild(this.handleHandle);

            this.displayObject.addChild(this.handle);
        },

        drawHandle: function() {
            var graphics = this.handleGraphics;
            var boxMargin = 6;
            var boxWidth = 110;
            var boxHeight = 32;
            var boxBottomY = -this.graphHeight - boxMargin;
            var color = 0x21366b;
            var circleY = boxMargin * 2;

            graphics.clear();

            graphics.lineStyle(2, color, 1);
            graphics.moveTo(0, boxMargin);
            graphics.lineTo(0, boxBottomY);
            graphics.beginFill(0xFFFFFF, 0.8);
            graphics.drawRoundedRect(-boxWidth / 2, boxBottomY - boxHeight, boxWidth, boxHeight, 4);
            graphics.endFill();
            
            graphics.lineStyle(0, 0, 0);
            graphics.beginFill(color, 1);
            graphics.drawCircle(0, circleY, boxMargin);
            graphics.endFill();
            graphics.beginFill(color, 1);
            graphics.moveTo(0, 0);
            graphics.lineTo( boxMargin, circleY);
            graphics.lineTo(-boxMargin, circleY);
            graphics.endFill();

            var radius = 8;
            var draggingGraphics = this.handleDraggingGraphics;
            draggingGraphics.clear();
            draggingGraphics.beginFill(color, 1);
            draggingGraphics.drawCircle(0, circleY, radius);
            draggingGraphics.endFill();
            draggingGraphics.beginFill(color, 1);
            draggingGraphics.moveTo(0, 0);
            draggingGraphics.lineTo( radius, circleY);
            draggingGraphics.lineTo(-radius, circleY);
            draggingGraphics.endFill();

            var thickness = 12;
            this.handleHandle.hitArea = new PIXI.Rectangle(-thickness / 2, boxBottomY, thickness, boxMargin - boxBottomY);
        },

        generateData: function() {
            var timeIncrement = this.timeSpan / NUM_SAMPLES_ON_DECAY_CHART;
            var lambda = Math.log(2) / this.halfLife;
            for (var time = 0; time < this.timeSpan; time += timeIncrement) {
                // Calculate the proportion of the element that should be decayed at this point in time.
                var percentDecayed = Math.exp(-time * lambda);
                this.recordDataPoint(time, percentDecayed);
            }
        },

        dragStart: function(event) {
            this.handleDraggingGraphics.visible = true;

            this.dragging = true;
        },

        drag: function(event) {
            if (this.dragging) {
                this.handle.x = event.data.global.x - this.displayObject.x;

                if (this.handle.x < this.graphOriginX)
                    this.handle.x = this.graphOriginX;
                if (this.handle.x > this.graphOriginX + this.graphWidth)
                    this.handle.x = this.graphOriginX + this.graphWidth;
            }
        },

        dragEnd: function(event) {
            this.dragging = false;

            this.handleDraggingGraphics.visible = false;
        },

        update: function(time, deltaTime, paused) {
            
        },

        updateLayout: function() {
            DatableItemDecayProportionChartView.prototype.updateLayout.apply(this, arguments);

            this.drawHandle();
            this.updateHandlePosition();
        },

        updateHandlePosition: function() {
            this.handle.y = this.graphOriginY;
            this.handle.x = this.graphOriginX + 200; // temporary for testing
        },

        nucleusTypeChanged: function() {
            DatableItemDecayProportionChartView.prototype.nucleusTypeChanged.apply(this, arguments);

            this.generateData();
            this.drawGraphData();
        },

        halfLifeChanged: function() {
            DatableItemDecayProportionChartView.prototype.halfLifeChanged.apply(this, arguments);

            this.generateData();
            this.drawGraphData();
        }

    });


    return PrePopulatedDatableItemDecayProportionChartView;
});
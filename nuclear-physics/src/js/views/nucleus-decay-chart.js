define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

                         require('common/v3/pixi/extensions');
                         require('common/v3/pixi/draw-stick-arrow');
    var AppView        = require('common/v3/app/app');
    var PixiView       = require('common/v3/pixi/view');
    var Colors         = require('common/colors/colors');
    var PiecewiseCurve = require('common/math/piecewise-curve');

    var HalfLifeInfo = require('models/half-life-info');

    var Constants = require('constants');

    /**
     * A panel that contains a chart showing the timeline for decay of nuclei over time.
     */
    var NucleusDecayChart = PixiView.extend({

        events: {
            
        },

        /**
         * Initializes the new NucleusDecayChart.
         */
        initialize: function(options) {
            options = _.extend({
                height: 130,
                paddingLeft: 220, // Number of pixels on the left before the chart starts
                paddingBottom: 46,
                paddingRight: 15,
                bgColor: '#FF9797',
                bgAlpha: 1,

                xAxisLabelText: 'Time (yrs)',
                yAxisLabelText: 'Isotope',

                timeSpan: NucleusDecayChart.DEFAULT_TIME_SPAN
            }, options);

            // Required options
            this.simulation = options.simulation;
            this.width = options.width;

            // Optional options
            this.height         = options.height;
            this.paddingLeft    = options.paddingLeft;
            this.paddingBottom  = options.paddingBottom;
            this.paddingRight   = options.paddingRight;
            this.bgColor        = Colors.parseHex(options.bgColor);
            this.bgAlpha        = options.bgAlpha;
            this.xAxisLabelText = options.xAxisLabelText;
            this.yAxisLabelText = options.yAxisLabelText;
            this.setTimeSpan(options.timeSpan);

            this.axisLineColor = Colors.parseHex(NucleusDecayChart.AXIS_LINE_COLOR);
            this.tickColor     = Colors.parseHex(NucleusDecayChart.TICK_MARK_COLOR);

            // Initialize the graphics
            this.initGraphics();
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            if (AppView.windowIsShort()) {
                this.displayObject.x = 12;
                this.displayObject.y = 12;
            }
            else {
                this.displayObject.x = 20;
                this.displayObject.y = 20;
            }

            this.initMVT();
            this.initPanel();
            this.initXAxis();
            this.initYAxis();
            this.initHalfLifeBar();
        },

        initMVT: function() {
            // Creates an MVT that will scale the nucleus graphics
        },

        initPanel: function() {
            // Draw the shadow
            var outline = new PiecewiseCurve()
                .moveTo(0, 0)
                .lineTo(this.width, 0)
                .lineTo(this.width, this.height)
                .lineTo(0, this.height)
                .close();

            var drawStyle = {
                lineWidth: 11,
                strokeStyle: 'rgba(0,0,0,0)',
                shadowBlur: 11,
                fillStyle: 'rgba(0,0,0,1)'
            };

            var shadow = PIXI.Sprite.fromPiecewiseCurve(outline, drawStyle);
            shadow.alpha = 0.25;
            this.displayObject.addChild(shadow);

            // Draw the panel
            var graphics = new PIXI.Graphics();
            graphics.beginFill(this.bgColor, this.bgAlpha);
            graphics.drawRect(0, 0, this.width, this.height);
            graphics.endFill();

            this.displayObject.addChild(graphics);
        },

        initXAxis: function() {
            // Draw axis line
            var axisLine = new PIXI.Graphics();
            axisLine.lineStyle(NucleusDecayChart.AXIS_LINE_WIDTH, this.axisLineColor, 1);
            axisLine.drawStickArrow(
                this.paddingLeft,               this.height - this.paddingBottom,
                this.width - this.paddingRight, this.height - this.paddingBottom,
                8, 6
            );

            // Create axis label
            var label = new PIXI.Text(this.xAxisLabelText, {
                font: Constants.NucleusDecayChart.AXIS_LABEL_FONT,
                fill: Constants.NucleusDecayChart.AXIS_LABEL_COLOR
            });
            label.resolution = this.getResolution();
            label.x = this.paddingLeft;
            label.y = this.height - this.paddingBottom + 10;
            this.xAxisLabel = label;

            // Create ticks
            this.xAxisTicks = new PIXI.Graphics();
            this.xAxisTickLabels = new PIXI.Container();
            this.drawXAxisTicks();

            // Add everything
            this.displayObject.addChild(axisLine);
            this.displayObject.addChild(this.xAxisTicks);
            this.displayObject.addChild(this.xAxisTickLabels);
            this.displayObject.addChild(label);
        },

        initYAxis: function() {

        },

        initHalfLifeBar: function() {

        },

        drawXAxisTicks: function() {
            this.xAxisTicks.clear();
            this.xAxisTicks.lineStyle(NucleusDecayChart.TICK_MARK_WIDTH, this.tickColor, 1);
            this.xAxisTickLabels.removeChildren();

            var numTickMarks;
            var i;

            if (this.timeSpan < 10000) {
                // Tick marks are 1 second apart.
                numTickMarks = Math.floor(this.timeSpan / 1000 + 1);

                for (i = 0; i < numTickMarks; i++)
                    this.drawXAxisTick(i * 1000, '' + i);
            }
            else if (this.timeSpan < HalfLifeInfo.convertYearsToMs(100)) {
                // Tick marks are 10 yrs apart.
                numTickMarks = Math.floor(this.timeSpan / HalfLifeInfo.convertYearsToMs(10) + 1);

                for (i = 0; i < numTickMarks; i++)
                    this.drawXAxisTick(i * HalfLifeInfo.convertYearsToMs(10), '' + i * 10);
            }
            else if (this.timeSpan < HalfLifeInfo.convertYearsToMs(1E9)) {
                // Tick marks are 5000 yrs apart.  This is generally used for
                //   the Carbon 14 range.
                numTickMarks = Math.floor(this.timeSpan / HalfLifeInfo.convertYearsToMs(5000) + 1);

                for (i = 0; i < numTickMarks; i++)
                    this.drawXAxisTick(i * HalfLifeInfo.convertYearsToMs(5000), '' + i * 5000);
            }
            else {
                // Space the tick marks four billion years apart.
                numTickMarks = Math.floor(this.timeSpan / HalfLifeInfo.convertYearsToMs(4E9) + 1);

                for (i = 0; i < numTickMarks; i++)
                    this.drawXAxisTick(i * HalfLifeInfo.convertYearsToMs(4E9), (i * 4).toFixed(1));
            }
        },

        drawXAxisTick: function(time, labelText) {
            var timeZeroPosX = this.paddingLeft + (NucleusDecayChart.TIME_ZERO_OFFSET_PROPORTION * this.timeSpan * this.msToPixelsFactor);
            var y = this.height - this.paddingBottom;
            var x = timeZeroPosX + (time * this.msToPixelsFactor);
            var length = NucleusDecayChart.TICK_MARK_LENGTH
            
            this.xAxisTicks.moveTo(x, y);
            this.xAxisTicks.lineTo(x, y - length);

            var label = new PIXI.Text(labelText, {
                font: NucleusDecayChart.SMALL_LABEL_FONT,
                fill: this.tickColor
            });

            label.x = x;
            label.y = y - length;
            label.anchor.x = 0.5;
            label.anchor.y = 1;
            label.resolution = this.getResolution();

            this.xAxisTickLabels.addChild(label);
        },

        update: function() {

        },

        setTimeSpan: function(timeSpan) {
            this.timeSpan = timeSpan;
            this.msToPixelsFactor = ((this.width - this.paddingLeft - this.paddingRight) * 0.98) / this.timeSpan;
            this.update();
        }

    }, Constants.NucleusDecayChart);


    return NucleusDecayChart;
});
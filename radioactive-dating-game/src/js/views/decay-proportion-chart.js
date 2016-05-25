define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

                         require('common/v3/pixi/create-drop-shadow');
                         require('common/v3/pixi/dash-to');
    var AppView        = require('common/v3/app/app');
    var PixiView       = require('common/v3/pixi/view');
    var Colors         = require('common/colors/colors');
    var Rectangle      = require('common/math/rectangle');

    var HalfLifeInfo  = require('models/half-life-info');
    var AtomicNucleus = require('models/atomic-nucleus');

    var IsotopeSymbolGenerator = require('views/isotope-symbol-generator');

    var Constants = require('constants');

    var HALF_LIFE_LINE_COLOR  = Colors.parseHex(Constants.DecayProportionChartView.HALF_LIFE_LINE_COLOR);
    var HALF_LIFE_LINE_WIDTH  = Constants.DecayProportionChartView.HALF_LIFE_LINE_WIDTH;
    var HALF_LIFE_LINE_ALPHA  = Constants.DecayProportionChartView.HALF_LIFE_LINE_ALPHA;

    /**
     * A panel that contains a chart showing the timeline for decay of nuclei over time.
     */
    var DecayProportionChartView = PixiView.extend({

        /**
         * Initializes the new DecayProportionChartView.
         */
        initialize: function(options) {
            options = _.extend({
                height: 210,
                paddingLeft: 90, // Number of pixels on the left before the chart starts
                paddingBottom: 45,
                paddingRight: 15,
                paddingTop: 45,
                padding: 15,
                bgColor: '#fff',
                bgAlpha: 0.2,

                yAxisLabelText: 'Percent of\nElement Remaining',

                timeSpan: DecayProportionChartView.DEFAULT_TIME_SPAN,
                pointRadius: DecayProportionChartView.POINT_RADIUS,
                lineMode: false
            }, options);

            // Required options
            this.simulation = options.simulation;
            this.width = options.width;

            // Optional options
            this.height         = options.height;
            this.paddingLeft    = options.paddingLeft;
            this.paddingBottom  = options.paddingBottom;
            this.paddingRight   = options.paddingRight;
            this.paddingTop     = options.paddingTop;
            this.padding        = options.padding;
            this.bgColor        = Colors.parseHex(options.bgColor);
            this.bgAlpha        = options.bgAlpha;
            this.yAxisLabelText = options.yAxisLabelText;
            this.pointRadius    = options.pointRadius;
            this.lineMode       = options.lineMode;

            this.axisLineColor = Colors.parseHex(DecayProportionChartView.AXIS_LINE_COLOR);
            this.tickColor     = Colors.parseHex(DecayProportionChartView.TICK_MARK_COLOR);
            this.tickLabelsWidth = 46;

            this.dataTimes = [];
            this.dataPercents = [];

            this.calculateGraphDimensions();

            // Initialize the graphics
            this.initGraphics();
        },

        calculateGraphDimensions: function() {
            this.graphWidth     = this.width - this.paddingLeft - this.paddingRight;
            this.graphHeight    = this.height - this.paddingTop - this.paddingBottom;
            this.graphOriginX   = this.paddingLeft;
            this.graphOriginY   = this.height - this.paddingBottom;
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.initPanel();
            this.initXAxis();
            this.initYAxis();
            this.initHalfLifeMarkers();
            this.initData();
        },

        initPanel: function() {
            // Draw the shadow
            var rectangle = new Rectangle(0, 0, this.width, this.height);
            var shadow = PIXI.createDropShadow(rectangle);
            this.displayObject.addChild(shadow);

            // Draw the panel
            var graphics = new PIXI.Graphics();
            graphics.beginFill(this.bgColor, this.bgAlpha);
            graphics.drawRect(0, 0, this.width, this.height);
            graphics.endFill();

            this.displayObject.addChild(graphics);
        },

        initXAxis: function() {
            this.xAxisContainer = new PIXI.Container();
            this.displayObject.addChild(this.xAxisContainer);

            this.drawXAxis();
        },

        initYAxis: function() {
            this.yAxisContainer = new PIXI.Container();
            this.displayObject.addChild(this.yAxisContainer);

            this.drawYAxis();
        },

        initHalfLifeMarkers: function() {
            this.halfLifeLineGraphics = new PIXI.Graphics();
            this.halfLifeLabels = new PIXI.Container();

            this.displayObject.addChild(this.halfLifeLineGraphics);
            this.displayObject.addChild(this.halfLifeLabels);
        },

        initData: function() {
            if (this.lineMode) {
                this._lastX = 0;
                this._lastActivePercent = 1;
            }

            this.dataGraphics = new PIXI.Graphics();

            var mask = new PIXI.Graphics();

            this.dataGraphics.mask = mask;

            this.displayObject.addChild(this.dataGraphics);
            this.displayObject.addChild(mask);
        },

        drawXAxis: function() {
            this.xAxisContainer.removeChildren();

            // Draw axis line
            var axisLine = new PIXI.Graphics();
            axisLine.lineStyle(DecayProportionChartView.AXIS_LINE_WIDTH, this.axisLineColor, 1);
            axisLine.moveTo(this.graphOriginX,                   this.graphOriginY);
            axisLine.lineTo(this.graphOriginX + this.graphWidth, this.graphOriginY);

            // Create bottom axis label (time)
            var yOffset = 16;
            var bottomAxisLabel = new PIXI.Text('Years', {
                font: Constants.DecayProportionChartView.AXIS_LABEL_FONT,
                fill: Constants.DecayProportionChartView.AXIS_LABEL_COLOR
            });
            bottomAxisLabel.resolution = this.getResolution();
            bottomAxisLabel.x = this.graphOriginX + this.graphWidth / 2;
            bottomAxisLabel.y = this.graphOriginY + yOffset;
            bottomAxisLabel.anchor.x = 0.5;
            this.timeAxisLabel = bottomAxisLabel;

            // Create ticks
            this.xAxisTicks = new PIXI.Graphics();
            this.xAxisTickLabels = new PIXI.Container();

            // Create top axis label (half lives)
            var topAxisLabel = new PIXI.Text('Half-Lives', {
                font: Constants.DecayProportionChartView.AXIS_LABEL_FONT,
                fill: Constants.DecayProportionChartView.AXIS_LABEL_COLOR
            });
            topAxisLabel.resolution = this.getResolution();
            topAxisLabel.x = this.graphOriginX + this.graphWidth / 2;
            topAxisLabel.y = this.graphOriginY - this.graphHeight - yOffset;
            topAxisLabel.anchor.x = 0.5;
            topAxisLabel.anchor.y = 1;

            // Add everything
            this.xAxisContainer.addChild(axisLine);
            this.xAxisContainer.addChild(this.xAxisTicks);
            this.xAxisContainer.addChild(this.xAxisTickLabels);
            this.xAxisContainer.addChild(bottomAxisLabel);
            this.xAxisContainer.addChild(topAxisLabel);
        },

        drawXAxisTicks: function() {
            // Remove the existing tick marks and labels.
            this.xAxisTicks.clear();
            this.xAxisTicks.lineStyle(DecayProportionChartView.TICK_MARK_WIDTH, this.tickColor, 1);
            this.xAxisTickLabels.removeChildren();

            var numTickMarks;
            var i;

            // Draw the new ones
            if (this.timeSpan < HalfLifeInfo.convertYearsToMs(100000)) {
                // Tick marks are 5000 yrs apart.  This is generally used for
                // the Carbon 14 range.
                numTickMarks = Math.floor(this.timeSpan / HalfLifeInfo.convertYearsToMs(5000)) + 1;

                for (i = 0; i < numTickMarks; i++)
                    this.drawXAxisTick(i * HalfLifeInfo.convertYearsToMs(5000), (i * 5000).toFixed(0));
            }
            else if (this.timeSpan < HalfLifeInfo.convertYearsToMs(1E6)) {
                // Tick marks are 100000 yrs apart.
                numTickMarks = Math.floor(this.timeSpan / HalfLifeInfo.convertYearsToMs(100000)) + 1;

                for (i = 0; i < numTickMarks; i++)
                    this.drawXAxisTick(i * HalfLifeInfo.convertYearsToMs(100000), (i * 100000).toFixed(0));
            }
            else if (this.timeSpan < HalfLifeInfo.convertYearsToMs(10E6)) {
                // Tick marks are 1 million years apart.
                numTickMarks = Math.floor(this.timeSpan / HalfLifeInfo.convertYearsToMs(1E6)) + 1;

                for (i = 0; i < numTickMarks; i++)
                    this.drawXAxisTick(i * HalfLifeInfo.convertYearsToMs(1E6), i.toFixed(1));
            }
            else if (this.timeSpan < HalfLifeInfo.convertYearsToMs(100E6)) {
                // Tick marks are 10 million years apart.
                numTickMarks = Math.floor(this.timeSpan / HalfLifeInfo.convertYearsToMs(10E6)) + 1;

                for (i = 0; i < numTickMarks; i++)
                    this.drawXAxisTick(i * HalfLifeInfo.convertYearsToMs(10E6), (i * 10).toFixed(1));
            }
            else if (this.timeSpan < HalfLifeInfo.convertYearsToMs(1E9)) {
                // Tick marks are 100 million years apart.
                numTickMarks = Math.floor(this.timeSpan / HalfLifeInfo.convertYearsToMs(100E6)) + 1;

                for (i = 0; i < numTickMarks; i++)
                    this.drawXAxisTick(i * HalfLifeInfo.convertYearsToMs(100E6), (i * 100).toFixed(0));
            }
            else {
                // Space the tick marks four billion years apart.
                numTickMarks = Math.floor(this.timeSpan / HalfLifeInfo.convertYearsToMs(4E9)) + 1;

                for (i = 0; i < numTickMarks; i++)
                    this.drawXAxisTick(i * HalfLifeInfo.convertYearsToMs(4E9), (i * 4).toFixed(1));
            }

            // Update the label for the lower X axis.
            this.timeAxisLabel.text = this.getXAxisUnitsText();
        },

        drawXAxisTick: function(time, labelText) {
            var y = this.graphOriginY;
            var x = this.graphOriginX + time * this.msToPixelsFactor;
            var length = DecayProportionChartView.TICK_MARK_LENGTH;
            
            if (time > 0) {
                this.xAxisTicks.moveTo(x, y);
                this.xAxisTicks.lineTo(x, y - length);   
            }

            var label = new PIXI.Text(labelText, {
                font: DecayProportionChartView.SMALL_LABEL_FONT,
                fill: this.tickColor
            });

            label.x = x;
            label.y = y;
            label.anchor.x = 0.5;
            label.anchor.y = 0;
            label.resolution = this.getResolution();

            this.xAxisTickLabels.addChild(label);
        },

        drawYAxis: function() {
            this.yAxisContainer.removeChildren();

            var label = new PIXI.Text(this.yAxisLabelText, {
                font: Constants.DecayProportionChartView.AXIS_LABEL_FONT,
                fill: Constants.DecayProportionChartView.AXIS_LABEL_COLOR,
                align: 'center'
            });
            label.resolution = this.getResolution();
            label.x = this.graphOriginX - this.tickLabelsWidth;
            label.y = this.graphOriginY - this.graphHeight / 2;
            label.anchor.x = 0.5;
            label.anchor.y = 1;
            label.rotation = -Math.PI / 2;

            // Draw axis line, border, and y-tick lines
            var graphics = new PIXI.Graphics();
            graphics.lineStyle(DecayProportionChartView.BORDER_WIDTH, Colors.parseHex(DecayProportionChartView.BORDER_COLOR), DecayProportionChartView.BORDER_ALPHA);
            graphics.drawRect(this.graphOriginX, this.graphOriginY - this.graphHeight, this.graphWidth, this.graphHeight);

            graphics.lineStyle(DecayProportionChartView.Y_VALUE_LINE_WIDTH, Colors.parseHex(DecayProportionChartView.Y_VALUE_LINE_COLOR), DecayProportionChartView.Y_VALUE_LINE_ALPHA);
            for (var p = 0.25; p <= 0.75; p += 0.25) {
                var y = this.graphOriginY - p * this.graphHeight;

                graphics.moveTo(this.graphOriginX, y);
                graphics.lineTo(this.graphOriginX + this.graphWidth, y);    
            }

            this.yAxisLabels = new PIXI.Container();

            this.yAxisContainer.addChild(graphics);
            this.yAxisContainer.addChild(label);
            this.yAxisContainer.addChild(this.yAxisLabels);
        },

        drawYAxisLabels: function() {
            this.yAxisLabels.removeChildren();

            for (var p = 0.25; p <= 1; p += 0.25) {
                var y = this.graphOriginY - p * this.graphHeight;
                var text = Math.round(p * 100) + '%';
                var tickLabel = new PIXI.Text(text, {
                    font: DecayProportionChartView.SMALL_LABEL_FONT,
                    fill: this.tickColor
                });
                tickLabel.x = this.graphOriginX - 4;
                tickLabel.y = y;
                tickLabel.anchor.x = 1;
                tickLabel.anchor.y = 0.5;
                tickLabel.resolution = this.getResolution();

                this.yAxisLabels.addChild(tickLabel);
            }
        },

        /**
         * Add the vertical lines and the labels that depict the half life
         *   intervals to the chart.  This does some sanity testing to make
         *   sure that there isn't a ridiculous number of half life lines
         *   on the graph.
         */
        drawHalfLifeLines: function() {
            this.halfLifeLabels.removeChildren();

            var graphics = this.halfLifeLineGraphics;
            graphics.clear();
            graphics.lineStyle(HALF_LIFE_LINE_WIDTH, HALF_LIFE_LINE_COLOR, HALF_LIFE_LINE_ALPHA);

            var numHalfLifeLines = Math.floor(this.timeSpan / this.halfLife);
            if (numHalfLifeLines > 10) {
                // Too many line.  Ignore this.
                console.warn('Warning: Too many half life lines, ignoring request to draw them.');
                return;
            }

            var labelSettings = {
                font: DecayProportionChartView.SMALL_LABEL_FONT,
                fill: this.tickColor
            };

            // Set the size and location for each of the lines and labels.
            for (var i = 0; i < numHalfLifeLines; i++) {
                var x = this.graphOriginX + (i + 1) * this.halfLife * this.msToPixelsFactor;
                var y = this.graphOriginY - this.graphHeight;

                var label = new PIXI.Text('' + (i + 1), {
                    font: DecayProportionChartView.SMALL_LABEL_FONT,
                    fill: this.tickColor
                });

                label.x = x;
                label.y = y;
                label.anchor.x = 0.5;
                label.anchor.y = 1;
                label.resolution = this.getResolution();
                
                this.halfLifeLabels.addChild(label);

                graphics.moveTo(x, y);
                graphics.dashTo(x, this.graphOriginY, DecayProportionChartView.HALF_LIFE_LINE_DASHES);
            }
        },

        drawDataMask: function() {
            var mask = this.dataGraphics.mask;
            
            mask.beginFill();
            mask.drawRect(this.graphOriginX, this.graphOriginY - this.graphHeight, this.graphWidth, this.graphHeight);
            mask.endFill();
        },

        drawDataPoint: function(time, percent, color) {
            var x = this.graphOriginX + time * this.msToPixelsFactor;
            if (x <= this.graphOriginX + this.graphWidth) {
                var graphics = this.dataGraphics;

                if (this.lineMode) {

                }
                else {
                    var radius = this.pointRadius;
                    
                    graphics.beginFill(color, 1);
                    graphics.drawCircle(x, this.graphOriginY - percent * this.graphHeight, radius);
                    graphics.endFill();
                }
            }
        },

        recordDataPoint: function(time, percent) {
            var x = this.graphOriginX + time * this.msToPixelsFactor;
            if (x <= this.graphOriginX + this.graphWidth) {
                this.dataTimes.push(time);
                this.dataPercents.push(percent);
            }
        },

        clearData: function() {
            this.dataGraphics.clear();
            this.dataTimes = [];
            this.dataPercents = [];
        },

        update: function(time, deltaTime, paused) {},

        updateTimeSpan: function() {
            // Set the time span of the chart based on the nucleus type.
            var nucleusType = this.simulation.get('nucleusType');
            var halfLife = HalfLifeInfo.getHalfLifeForNucleusType(nucleusType);
            this.setTimeParameters(halfLife * 3.2, halfLife);
        },

        /**
         * Redraw the chart based on the current state.  This is basically the
         *   place where the chart gets laid out.
         */
        updateLayout: function() {
            this.drawXAxisTicks();
            this.drawYAxisLabels();
            this.drawHalfLifeLines();
            this.drawDataMask();
        },

        /**
         * Set the time parameters for the graph.  These are set at the same time
         *   to avoid problems that can emerge if the two values are at very
         *   different scales the methods for layout out the chart are called.
         *
         * @param totalTimeSpan - Total time period covered by chart.
         * @param halfLife      - Half life of the element being represented.
         */
        setTimeParameters: function(totalTimeSpan, halfLife) {
            this.timeSpan = totalTimeSpan;
            this.halfLife = halfLife;
            this.msToPixelsFactor = this.graphWidth / this.timeSpan;
            this.updateLayout();
        },

        /**
         * Get the units string for the x axis label.  Note that this does not
         * handle all ranges of time.  Feel free to add new ranges as needed.
         */
        getXAxisUnitsText: function() {
            var unitsText;

            if (this.timeSpan > HalfLifeInfo.convertYearsToMs(1E9))
                unitsText = 'Billion Years';
            else if (this.timeSpan > HalfLifeInfo.convertYearsToMs(1E6))
                unitsText = 'Million Years';
            else
                unitsText = 'Years';

            return unitsText;
        }

    }, Constants.DecayProportionChartView);


    return DecayProportionChartView;
});
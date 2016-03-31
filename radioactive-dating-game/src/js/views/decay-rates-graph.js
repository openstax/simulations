define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

                         require('common/v3/pixi/extensions');
                         require('common/v3/pixi/dash-to');
    var AppView        = require('common/v3/app/app');
    var PixiView       = require('common/v3/pixi/view');
    var Colors         = require('common/colors/colors');
    var PiecewiseCurve = require('common/math/piecewise-curve');
    var Rectangle      = require('common/math/rectangle');

    var HalfLifeInfo  = require('models/half-life-info');
    var NucleusType   = require('models/nucleus-type');
    var AtomicNucleus = require('models/atomic-nucleus');

    var IsotopeSymbolGenerator = require('views/isotope-symbol-generator');

    var Constants = require('constants');

    var HALF_LIFE_LINE_COLOR  = Colors.parseHex(Constants.DecayRatesGraphView.HALF_LIFE_LINE_COLOR);
    var HALF_LIFE_LINE_WIDTH  = Constants.DecayRatesGraphView.HALF_LIFE_LINE_WIDTH;
    var HALF_LIFE_LINE_ALPHA  = Constants.DecayRatesGraphView.HALF_LIFE_LINE_ALPHA;

    /**
     * A panel that contains a chart showing the timeline for decay of nuclei over time.
     */
    var DecayRatesGraphView = PixiView.extend({

        /**
         * Initializes the new DecayRatesGraphView.
         */
        initialize: function(options) {
            options = _.extend({
                height: 210,
                paddingLeft: 180, // Number of pixels on the left before the chart starts
                paddingBottom: 45,
                paddingRight: 15,
                paddingTop: 45,
                padding: 15,
                bgColor: '#B1DDFF',
                bgAlpha: 1,

                yAxisLabelText: 'Percent of\nElement Remaining',

                timeSpan: DecayRatesGraphView.DEFAULT_TIME_SPAN,
                pieChartRadius: 25,
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
            this.graphWidth     = this.width - this.paddingLeft - this.paddingRight;
            this.graphHeight    = this.height - this.paddingTop - this.paddingBottom;
            this.graphOriginX   = this.paddingLeft;
            this.graphOriginY   = this.height - this.paddingBottom;
            this.bgColor        = Colors.parseHex(options.bgColor);
            this.bgAlpha        = options.bgAlpha;
            this.yAxisLabelText = options.yAxisLabelText;
            this.pieChartRadius = options.pieChartRadius;
            this.lineMode       = options.lineMode;

            this.axisLineColor = Colors.parseHex(DecayRatesGraphView.AXIS_LINE_COLOR);
            this.tickColor     = Colors.parseHex(DecayRatesGraphView.TICK_MARK_COLOR);

            // Initialize the graphics
            this.initGraphics();

            this.listenTo(this.simulation, 'change:active',      this.activeChanged);
            this.listenTo(this.simulation, 'change:nucleusType', this.nucleusTypeChanged);
            this.nucleusTypeChanged(this.simulation, this.simulation.get('nucleusType'));
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.initPanel();
            this.initXAxis();
            this.initYAxis();
            this.initHalfLifeMarkers();
            this.initPieChart();
            this.initData();
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
            axisLine.lineStyle(DecayRatesGraphView.AXIS_LINE_WIDTH, this.axisLineColor, 1);
            axisLine.moveTo(this.graphOriginX,                   this.graphOriginY);
            axisLine.lineTo(this.graphOriginX + this.graphWidth, this.graphOriginY);

            // Create bottom axis label (time)
            var yOffset = 16;
            var bottomAxisLabel = new PIXI.Text('Years', {
                font: Constants.DecayRatesGraphView.AXIS_LABEL_FONT,
                fill: Constants.DecayRatesGraphView.AXIS_LABEL_COLOR
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
                font: Constants.DecayRatesGraphView.AXIS_LABEL_FONT,
                fill: Constants.DecayRatesGraphView.AXIS_LABEL_COLOR
            });
            topAxisLabel.resolution = this.getResolution();
            topAxisLabel.x = this.graphOriginX + this.graphWidth / 2;
            topAxisLabel.y = this.graphOriginY - this.graphHeight - yOffset;
            topAxisLabel.anchor.x = 0.5;
            topAxisLabel.anchor.y = 1;

            // Add everything
            this.displayObject.addChild(axisLine);
            this.displayObject.addChild(this.xAxisTicks);
            this.displayObject.addChild(this.xAxisTickLabels);
            this.displayObject.addChild(bottomAxisLabel);
            this.displayObject.addChild(topAxisLabel);
        },

        initYAxis: function() {
            var tickLabelThickness = 46;

            var label = new PIXI.Text(this.yAxisLabelText, {
                font: Constants.DecayRatesGraphView.AXIS_LABEL_FONT,
                fill: Constants.DecayRatesGraphView.AXIS_LABEL_COLOR,
                align: 'center'
            });
            label.resolution = this.getResolution();
            label.x = this.graphOriginX - tickLabelThickness;
            label.y = this.graphOriginY - this.graphHeight / 2;
            label.anchor.x = 0.5;
            label.anchor.y = 1;
            label.rotation = -Math.PI / 2;

            // Draw axis line, border, and y-tick lines
            var graphics = new PIXI.Graphics();
            graphics.lineStyle(DecayRatesGraphView.BORDER_WIDTH, Colors.parseHex(DecayRatesGraphView.BORDER_COLOR), DecayRatesGraphView.BORDER_ALPHA);
            graphics.drawRect(this.graphOriginX, this.graphOriginY - this.graphHeight, this.graphWidth, this.graphHeight);

            graphics.lineStyle(DecayRatesGraphView.Y_VALUE_LINE_WIDTH, Colors.parseHex(DecayRatesGraphView.Y_VALUE_LINE_COLOR), DecayRatesGraphView.Y_VALUE_LINE_ALPHA);
            for (var p = 0.25; p <= 0.75; p += 0.25) {
                var y = this.graphOriginY - p * this.graphHeight;

                graphics.moveTo(this.graphOriginX, y);
                graphics.lineTo(this.graphOriginX + this.graphWidth, y);    
            }

            this.yAxisLabels = new PIXI.Container();

            this.displayObject.addChild(graphics);
            this.displayObject.addChild(label);
            this.displayObject.addChild(this.yAxisLabels);
        },

        initHalfLifeMarkers: function() {
            this.halfLifeLineGraphics = new PIXI.Graphics();
            this.halfLifeLabels = new PIXI.Container();

            this.displayObject.addChild(this.halfLifeLineGraphics);
            this.displayObject.addChild(this.halfLifeLabels);
        },

        initPieChart: function() {
            var radius = this.pieChartRadius;

            this.pieChartGraphics = new PIXI.Graphics();
            this.pieChartGraphics.x = 58;
            this.pieChartGraphics.y = this.graphOriginY - this.graphHeight / 2;

            this.isotope1Container = new PIXI.Container();
            this.isotope2Container = new PIXI.Container();
            this.isotope1Container.x = this.isotope2Container.x = this.pieChartGraphics.x;
            this.isotope1Container.y = this.pieChartGraphics.y - radius - 16;
            this.isotope2Container.y = this.pieChartGraphics.y + radius + 16;
            
            var settings = {
                fill: DecayRatesGraphView.DECAY_LABEL_COLOR,
                font: DecayRatesGraphView.DECAY_LABEL_FONT
            };
            var x = this.pieChartGraphics.x + 6;

            this.isotope1Counter = new PIXI.Text('', settings);
            this.isotope1Counter.resolution = this.getResolution();
            this.isotope1Counter.x = x;
            this.isotope1Counter.y = this.isotope1Container.y;
            this.isotope1Counter.anchor.x = 0;
            this.isotope1Counter.anchor.y = 0.35;

            this.isotope2Counter = new PIXI.Text('', settings);
            this.isotope2Counter.resolution = this.getResolution();
            this.isotope2Counter.x = x;
            this.isotope2Counter.y = this.isotope2Container.y;
            this.isotope2Counter.anchor.x = 0;
            this.isotope2Counter.anchor.y = 0.35;

            this.displayObject.addChild(this.pieChartGraphics);
            this.displayObject.addChild(this.isotope1Container);
            this.displayObject.addChild(this.isotope2Container);
            this.displayObject.addChild(this.isotope1Counter);
            this.displayObject.addChild(this.isotope2Counter);
        },

        initData: function() {
            if (this.lineMode) {
                this._lastX = 0;
                this._lastActivePercent = 1;
            }

            this.dataGraphics = new PIXI.Graphics();

            var mask = new PIXI.Graphics();
            mask.beginFill();
            mask.drawRect(this.graphOriginX, this.graphOriginY - this.graphHeight, this.graphWidth, this.graphHeight);
            mask.endFill();

            this.dataGraphics.mask = mask;

            this.displayObject.addChild(this.dataGraphics);
            this.displayObject.addChild(mask);
        },

        drawXAxisTicks: function() {
            // Remove the existing tick marks and labels.
            this.xAxisTicks.clear();
            this.xAxisTicks.lineStyle(DecayRatesGraphView.TICK_MARK_WIDTH, this.tickColor, 1);
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
            var length = DecayRatesGraphView.TICK_MARK_LENGTH;
            
            if (time > 0) {
                this.xAxisTicks.moveTo(x, y);
                this.xAxisTicks.lineTo(x, y - length);   
            }

            var label = new PIXI.Text(labelText, {
                font: DecayRatesGraphView.SMALL_LABEL_FONT,
                fill: this.tickColor
            });

            label.x = x;
            label.y = y;
            label.anchor.x = 0.5;
            label.anchor.y = 0;
            label.resolution = this.getResolution();

            this.xAxisTickLabels.addChild(label);
        },

        drawYAxisLabels: function() {
            this.yAxisLabels.removeChildren();

            for (var p = 0.25; p <= 1; p += 0.25) {
                var y = this.graphOriginY - p * this.graphHeight;
                var text = Math.round(p * 100) + '%';
                var tickLabel = new PIXI.Text(text, {
                    font: DecayRatesGraphView.SMALL_LABEL_FONT,
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
                font: DecayRatesGraphView.SMALL_LABEL_FONT,
                fill: this.tickColor
            };

            // Set the size and location for each of the lines and labels.
            for (var i = 0; i < numHalfLifeLines; i++) {
                var x = this.graphOriginX + (i + 1) * this.halfLife * this.msToPixelsFactor;
                var y = this.graphOriginY - this.graphHeight;

                var label = new PIXI.Text('' + (i + 1), {
                    font: DecayRatesGraphView.SMALL_LABEL_FONT,
                    fill: this.tickColor
                });

                label.x = x;
                label.y = y;
                label.anchor.x = 0.5;
                label.anchor.y = 1;
                label.resolution = this.getResolution();
                
                this.halfLifeLabels.addChild(label);

                graphics.moveTo(x, y);
                graphics.dashTo(x, this.graphOriginY, DecayRatesGraphView.HALF_LIFE_LINE_DASHES);
            }
        },

        drawCurrentGraphData: function() {
            var time = this.simulation.getAdjustedTime();
            var x = this.graphOriginX + time * this.msToPixelsFactor;

            if (x <= this.graphOriginX + this.graphWidth) {
                var graphics = this.dataGraphics;
                var numAtoms = this.simulation.getTotalNumNuclei();
                var numActive = this.simulation.getNumActiveNuclei();
                var activePercent = numActive / numAtoms;
                var decayedPercent = 1 - activePercent;

                if (this.lineMode) {

                }
                else {
                    var radius = DecayRatesGraphView.POINT_RADIUS;
                    
                    graphics.beginFill(this.isotope1Color, 1);
                    graphics.drawCircle(x, this.graphOriginY - activePercent * this.graphHeight, radius);
                    graphics.endFill();

                    graphics.beginFill(this.isotope2Color, 1);
                    graphics.drawCircle(x, this.graphOriginY - decayedPercent * this.graphHeight, radius);
                    graphics.endFill();
                }
            }
        },

        update: function(time, deltaTime, paused) {
            this.updatePieChart();

            if (this._lastNucleusCount !== this.simulation.getTotalNumNuclei())
                this.dataGraphics.clear();
            
            if (this.simulation.getTotalNumNuclei() > 0 && this.simulation.get('active'))
                this.drawCurrentGraphData();

            this._lastNucleusCount = this.simulation.getTotalNumNuclei();  
        },

        updateTimeSpan: function() {
            // Set the time span of the chart based on the nucleus type.
            var nucleusType = this.simulation.get('nucleusType');
            var halfLife = HalfLifeInfo.getHalfLifeForNucleusType(nucleusType);
            this.setTimeParameters(halfLife * 3.2, halfLife);
        },

        updateIsotopes: function() {
            var nucleusType = this.simulation.get('nucleusType');
            var decayedNucleusType = AtomicNucleus.getPostDecayNuclei(nucleusType)[0];

            var isotope1Text = IsotopeSymbolGenerator.generateWithElementColor(nucleusType,        DecayRatesGraphView.ISOTOPE_FONT_SIZE, 1);
            var isotope2Text = IsotopeSymbolGenerator.generateWithElementColor(decayedNucleusType, DecayRatesGraphView.ISOTOPE_FONT_SIZE, 1);
            
            this.isotope1Container.removeChildren();
            this.isotope2Container.removeChildren();

            this.isotope1Container.addChild(isotope1Text);
            this.isotope2Container.addChild(isotope2Text);

            this.isotope1Color = Colors.parseHex(IsotopeSymbolGenerator.getElementColor(nucleusType));
            this.isotope2Color = Colors.parseHex(IsotopeSymbolGenerator.getElementColor(decayedNucleusType));
        },

        updatePieChart: function() {
            var graphics = this.pieChartGraphics;
            graphics.clear();
            graphics.lineStyle(1, 0x000000, 1);

            var nucleusType = this.simulation.get('nucleusType');

            var isotope1Color = this.isotope1Color;
            var isotope2Color = this.isotope2Color;
            
            var radius = this.pieChartRadius;
            var numActive  = this.simulation.getNumActiveNuclei();
            var numDecayed = this.simulation.getNumDecayedNuclei();
            var decayedAngle = Math.PI * 2 * (numDecayed / (numActive + numDecayed));

            graphics.beginFill(isotope1Color, 1);
            graphics.drawCircle(0, 0, radius);
            graphics.endFill();

            if (numDecayed > 0) {
                if (numActive === 0)
                    graphics.lineStyle(0, 0, 0);

                graphics.beginFill(isotope2Color, 1);
                graphics.moveTo(0, 0);
                graphics.lineTo(radius, 0);
                graphics.arc(0, 0, radius, 0, decayedAngle);
                graphics.lineTo(0, 0);
                graphics.endFill();

                if (numActive > 0) {
                    graphics.moveTo(0, 0);
                    graphics.lineTo(radius, 0);     
                }

                graphics.lineStyle(1, 0x000000, 1);
                graphics.moveTo(0, 0);
                graphics.drawCircle(0, 0, radius);   
            }

            this.isotope1Counter.text = numActive;
            this.isotope2Counter.text = numDecayed;
        },

        /**
         * Redraw the chart based on the current state.  This is basically the
         *   place where the chart gets laid out.
         */
        updateLayout: function() {
            this.drawXAxisTicks();
            this.drawYAxisLabels();
            this.drawHalfLifeLines();
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

        getSampleNucleus: function() {
            return this.simulation.createNucleus();
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
        },

        nucleusTypeChanged: function(simulation, nucleusType) {
            this.updateTimeSpan();
            this.updateIsotopes();
        },

        activeChanged: function(simulation, active) {
            if (active)
                this.dataGraphics.clear();
        }

    }, Constants.DecayRatesGraphView);


    return DecayRatesGraphView;
});
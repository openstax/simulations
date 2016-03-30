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

                xAxisLabelText: 'Years',
                yAxisLabelText: 'Percent of\nElement Remaining',

                timeSpan: DecayRatesGraphView.DEFAULT_TIME_SPAN
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
            this.xAxisLabelText = options.xAxisLabelText;
            this.yAxisLabelText = options.yAxisLabelText;

            this.axisLineColor = Colors.parseHex(DecayRatesGraphView.AXIS_LINE_COLOR);
            this.tickColor     = Colors.parseHex(DecayRatesGraphView.TICK_MARK_COLOR);

            // Initialize the graphics
            this.initGraphics();

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
            axisLine.drawStickArrow(
                this.graphOriginX,                   this.graphOriginY,
                this.graphOriginX + this.graphWidth, this.graphOriginY,
                8, 6
            );

            // Create axis label
            var label = new PIXI.Text(this.xAxisLabelText, {
                font: Constants.DecayRatesGraphView.AXIS_LABEL_FONT,
                fill: Constants.DecayRatesGraphView.AXIS_LABEL_COLOR
            });
            label.resolution = this.getResolution();
            label.x = this.graphOriginX;
            label.y = this.graphOriginY + 14;
            this.xAxisLabel = label;

            // Create ticks
            this.xAxisTicks = new PIXI.Graphics();
            this.xAxisTickLabels = new PIXI.Container();

            // Add everything
            this.displayObject.addChild(axisLine);
            this.displayObject.addChild(this.xAxisTicks);
            this.displayObject.addChild(this.xAxisTickLabels);
            this.displayObject.addChild(label);
        },

        initYAxis: function() {
            var isotopeLabelThickness = 46;

            var label = new PIXI.Text(this.yAxisLabelText, {
                font: Constants.DecayRatesGraphView.AXIS_LABEL_FONT,
                fill: Constants.DecayRatesGraphView.AXIS_LABEL_COLOR
            });
            label.resolution = this.getResolution();
            label.x = this.graphOriginX - isotopeLabelThickness;
            label.y = this.graphOriginY - this.graphHeight / 2;
            label.anchor.x = 0.5;
            label.anchor.y = 1;
            label.rotation = -Math.PI / 2;
            this.isotopeLabel = label;

            var tickLength = DecayRatesGraphView.TICK_MARK_LENGTH;
            var isotope1Y = this.graphOriginY - this.graphHeight * 0.8;
            var isotope2Y = this.graphOriginY - this.graphHeight * 0.2;
            this.yAxisIsotope1 = new PIXI.Container();
            this.yAxisIsotope2 = new PIXI.Container();
            this.yAxisIsotope1.x = this.yAxisIsotope2.x = this.graphOriginX - tickLength * 2;
            this.yAxisIsotope1.y = isotope1Y;
            this.yAxisIsotope2.y = isotope2Y;

            var yAxisTicks = new PIXI.Graphics();
            yAxisTicks.lineStyle(DecayRatesGraphView.TICK_MARK_WIDTH, this.tickColor, 1);
            yAxisTicks.moveTo(this.graphOriginX,              isotope1Y);
            yAxisTicks.lineTo(this.graphOriginX - tickLength, isotope1Y);
            yAxisTicks.moveTo(this.graphOriginX,              isotope2Y);
            yAxisTicks.lineTo(this.graphOriginX - tickLength, isotope2Y);

            this.displayObject.addChild(yAxisTicks);
            this.displayObject.addChild(this.yAxisIsotope1);
            this.displayObject.addChild(this.yAxisIsotope2);
            this.displayObject.addChild(label);
        },


        drawHalfLifeHandles: function(graphics, color) {
            var y = this.graphHeight / 2;
            var length     = DecayRatesGraphView.HALF_LIFE_ARROW_LENGTH;
            var tailWidth  = DecayRatesGraphView.HALF_LIFE_ARROW_TAIL_WIDTH;
            var headWidth  = DecayRatesGraphView.HALF_LIFE_ARROW_HEAD_WIDTH;
            var headLength = DecayRatesGraphView.HALF_LIFE_ARROW_HEAD_LENGTH;

            graphics.beginFill(color, 1);
            graphics.moveTo(0, 0);
            graphics.drawArrow(0, y,  length, y, tailWidth, headWidth, headLength);
            graphics.moveTo(0, 0);
            graphics.drawArrow(0, y, -length, y, tailWidth, headWidth, headLength);
            graphics.endFill();
        },

        initNucleiView: function() {
            this.nucleiView = new DecayRatesGraphViewNucleiView({
                simulation: this.simulation,
                renderer: this.renderer,
                height: this.graphHeight,
                isotope1Y: this.yAxisIsotope1.y - this.paddingTop,
                isotope2Y: this.yAxisIsotope2.y - this.paddingTop,
                hideNucleons: this.hideNucleons
            });

            this.nucleiView.displayObject.y = this.graphOriginY - this.graphHeight;

            this.displayObject.addChild(this.nucleiView.displayObject);
        },

        drawXAxisTicks: function() {
            this.xAxisTicks.clear();
            this.xAxisTicks.lineStyle(DecayRatesGraphView.TICK_MARK_WIDTH, this.tickColor, 1);
            this.xAxisTickLabels.removeChildren();

            var numTickMarks;
            var i;

            if (this.timeSpan < 10000) {
                // Tick marks are 1 second apart.
                numTickMarks = Math.floor(this.timeSpan / 1000);

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
            var timeZeroPosX = this.graphOriginX + this.getTimeZeroXOffset();
            var y = this.graphOriginY;
            var x = timeZeroPosX + (time * this.msToPixelsFactor);
            var length = DecayRatesGraphView.TICK_MARK_LENGTH;
            
            this.xAxisTicks.moveTo(x, y);
            this.xAxisTicks.lineTo(x, y - length);

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

        update: function(time, deltaTime, paused) {
            
        },

        updateTimeSpan: function() {
            var nucleusType = this.simulation.get('nucleusType');

            // Set the time span of the chart based on the nucleus type.
            switch (nucleusType) {
                case NucleusType.HEAVY_CUSTOM:
                    this.setTimeSpan(5000); // Set the chart for five seconds of real time.
                    break;
                case NucleusType.CARBON_14:
                    this.setTimeSpan(HalfLifeInfo.getHalfLifeForNucleusType(nucleusType) * 2.6);
                    break;
                case NucleusType.HYDROGEN_3:
                    this.setTimeSpan(HalfLifeInfo.getHalfLifeForNucleusType(nucleusType) * 3.2);
                    break;
                default:
                    this.setTimeSpan(HalfLifeInfo.getHalfLifeForNucleusType(nucleusType) * 2.5);
                    break;
            }
        },

        updateIsotopes: function() {
            var nucleusType = this.simulation.get('nucleusType');
            var decayedNucleusType = AtomicNucleus.getPostDecayNuclei(nucleusType)[0];

            var isotope1Text = IsotopeSymbolGenerator.generateWithElementColor(nucleusType,        DecayRatesGraphView.ISOTOPE_FONT_SIZE, 1);
            var isotope2Text = IsotopeSymbolGenerator.generateWithElementColor(decayedNucleusType, DecayRatesGraphView.ISOTOPE_FONT_SIZE, 1);
            
            this.yAxisIsotope1.removeChildren();
            this.yAxisIsotope2.removeChildren();

            this.yAxisIsotope1.addChild(isotope1Text);
            this.yAxisIsotope2.addChild(isotope2Text);
        },

        setTimeSpan: function(timeSpan) {
            this.timeSpan = timeSpan;
            this.msToPixelsFactor = ((this.width - this.paddingLeft - this.paddingRight) * 0.98) / this.timeSpan;

            this.drawXAxisTicks();
        },

        getTimeZeroXOffset: function() {
            return DecayRatesGraphView.TIME_ZERO_OFFSET_PROPORTION * this.timeSpan * this.msToPixelsFactor;
        },

        getSampleNucleus: function() {
            return this.simulation.createNucleus();
        },

        nucleusTypeChanged: function(simulation, nucleusType) {
            this.updateTimeSpan();
            this.updateIsotopes();
        }

    }, Constants.DecayRatesGraphView);


    return DecayRatesGraphView;
});
define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

                         require('common/v3/pixi/extensions');
                         require('common/v3/pixi/draw-stick-arrow');
                         require('common/v3/pixi/draw-arrow');
                         require('common/v3/pixi/dash-to');
    var AppView        = require('common/v3/app/app');
    var PixiView       = require('common/v3/pixi/view');
    var Colors         = require('common/colors/colors');
    var PiecewiseCurve = require('common/math/piecewise-curve');
    var Rectangle      = require('common/math/rectangle');

    var HalfLifeInfo  = require('models/half-life-info');
    var NucleusType   = require('models/nucleus-type');
    var AtomicNucleus = require('models/atomic-nucleus');

    var IsotopeSymbolGenerator      = require('views/isotope-symbol-generator');
    var NucleusDecayChartNucleiView = require('views/nucleus-decay-chart/nuclei');

    var Constants = require('constants');
    var HALF_LIFE_LINE_COLOR  = Colors.parseHex(Constants.NucleusDecayChart.HALF_LIFE_LINE_COLOR);
    var HALF_LIFE_LINE_WIDTH  = Constants.NucleusDecayChart.HALF_LIFE_LINE_WIDTH;
    var HALF_LIFE_LINE_ALPHA  = Constants.NucleusDecayChart.HALF_LIFE_LINE_ALPHA;
    var HALF_LIFE_HOVER_COLOR = Colors.parseHex(Constants.NucleusDecayChart.HALF_LIFE_HOVER_COLOR);

    /**
     * A panel that contains a chart showing the timeline for decay of nuclei over time.
     */
    var NucleusDecayChart = PixiView.extend({

        events: {
            'touchstart      .halfLifeHandle': 'dragHalfLifeStart',
            'mousedown       .halfLifeHandle': 'dragHalfLifeStart',
            'touchmove       .halfLifeHandle': 'dragHalfLife',
            'mousemove       .halfLifeHandle': 'dragHalfLife',
            'touchend        .halfLifeHandle': 'dragHalfLifeEnd',
            'mouseup         .halfLifeHandle': 'dragHalfLifeEnd',
            'touchendoutside .halfLifeHandle': 'dragHalfLifeEnd',
            'mouseupoutside  .halfLifeHandle': 'dragHalfLifeEnd',

            'mouseover       .halfLifeHandle': 'halfLifeHover',
            'mouseout        .halfLifeHandle': 'halfLifeUnhover'
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
                paddingTop: 15,
                padding: 15,
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

            this.axisLineColor = Colors.parseHex(NucleusDecayChart.AXIS_LINE_COLOR);
            this.tickColor     = Colors.parseHex(NucleusDecayChart.TICK_MARK_COLOR);

            // Initialize the graphics
            this.initGraphics();

            this.listenTo(this.simulation, 'change:nucleusType', this.nucleusTypeChanged);
            this.listenTo(this.simulation, 'change:halfLife',    this.halfLifeChanged);

            this.nucleusTypeChanged(this.simulation, this.simulation.get('nucleusType'));
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

            this.initPanel();
            this.initXAxis();
            this.initYAxis();
            this.initHalfLifeBar();
            this.initNucleiView();
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
                this.graphOriginX,                   this.graphOriginY,
                this.graphOriginX + this.graphWidth, this.graphOriginY,
                8, 6
            );

            // Create axis label
            var label = new PIXI.Text(this.xAxisLabelText, {
                font: Constants.NucleusDecayChart.AXIS_LABEL_FONT,
                fill: Constants.NucleusDecayChart.AXIS_LABEL_COLOR
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
                font: Constants.NucleusDecayChart.AXIS_LABEL_FONT,
                fill: Constants.NucleusDecayChart.AXIS_LABEL_COLOR
            });
            label.resolution = this.getResolution();
            label.x = this.graphOriginX - isotopeLabelThickness;
            label.y = this.graphOriginY - this.graphHeight / 2;
            label.anchor.x = 0.5;
            label.anchor.y = 1;
            label.rotation = -Math.PI / 2;

            var tickLength = NucleusDecayChart.TICK_MARK_LENGTH;
            var isotope1Y = this.graphOriginY - this.graphHeight * 0.8;
            var isotope2Y = this.graphOriginY - this.graphHeight * 0.2;
            this.yAxisIsotope1 = new PIXI.Container();
            this.yAxisIsotope2 = new PIXI.Container();
            this.yAxisIsotope1.x = this.yAxisIsotope2.x = this.graphOriginX - tickLength * 2;
            this.yAxisIsotope1.y = isotope1Y;
            this.yAxisIsotope2.y = isotope2Y;

            var yAxisTicks = new PIXI.Graphics();
            yAxisTicks.lineStyle(NucleusDecayChart.TICK_MARK_WIDTH, this.tickColor, 1);
            yAxisTicks.moveTo(this.graphOriginX,              isotope1Y);
            yAxisTicks.lineTo(this.graphOriginX - tickLength, isotope1Y);
            yAxisTicks.moveTo(this.graphOriginX,              isotope2Y);
            yAxisTicks.lineTo(this.graphOriginX - tickLength, isotope2Y);

            this.displayObject.addChild(yAxisTicks);
            this.displayObject.addChild(this.yAxisIsotope1);
            this.displayObject.addChild(this.yAxisIsotope2);
            this.displayObject.addChild(label);
        },

        /**
         * Initializes the vertical line that illustrates where the half-life is on the timeline
         */
        initHalfLifeBar: function() {
            var height = this.graphHeight + 16;

            this.halfLifeMarker = new PIXI.Graphics();
            this.halfLifeMarker.y = this.paddingTop;

            this.halfLifeMarkerHover = new PIXI.Graphics();
            this.halfLifeMarkerHover.alpha = 0;

            this.drawHalfLifeMarker(this.halfLifeMarker, height, HALF_LIFE_LINE_COLOR);
            this.drawHalfLifeMarker(this.halfLifeMarkerHover,  height, HALF_LIFE_HOVER_COLOR);
            
            this.halfLifeMarkerText = this.createHalfLifeText(height, NucleusDecayChart.HALF_LIFE_TEXT_COLOR);
            this.halfLifeMarkerHover.addChild(this.createHalfLifeText(height, NucleusDecayChart.HALF_LIFE_HOVER_COLOR));

            this.halfLifeHandle = new PIXI.Graphics();
            this.halfLifeHandle.defaultCursor = 'ew-resize';
            this.halfLifeHandle.buttonMode = true;
            this.halfLifeHandle.visible = false;

            var halfLifeHandleHover = new PIXI.Graphics();
            this.halfLifeMarkerHover.addChild(halfLifeHandleHover);

            this.drawHalfLifeHandles(this.halfLifeHandle, HALF_LIFE_LINE_COLOR);
            this.drawHalfLifeHandles(halfLifeHandleHover, HALF_LIFE_HOVER_COLOR);
            
            this.halfLifeMarker.addChild(this.halfLifeHandle);
            this.halfLifeMarker.addChild(this.halfLifeMarkerText);
            this.halfLifeMarker.addChild(this.halfLifeMarkerHover);
            this.displayObject.addChild(this.halfLifeMarker);

            this._axisLabelRect = new Rectangle();
            this._halfLifeTextRect = new Rectangle();
        },

        drawHalfLifeMarker: function(graphics, height, color) {
            graphics.lineStyle(HALF_LIFE_LINE_WIDTH, color, HALF_LIFE_LINE_ALPHA);
            graphics.moveTo(0, 0);
            graphics.dashTo(0, height, NucleusDecayChart.HALF_LIFE_LINE_DASHES);
        },

        createHalfLifeText: function(y, colorString) {
            var text = new PIXI.Text('Half Life', {
                font: Constants.NucleusDecayChart.HALF_LIFE_TEXT_FONT,
                fill: colorString
            });
            text.resolution = this.getResolution();
            text.alpha = NucleusDecayChart.HALF_LIFE_TEXT_ALPHA;
            text.anchor.x = 0.5;
            text.y = y;

            return text;
        },

        drawHalfLifeHandles: function(graphics, color) {
            var y = this.graphHeight / 2;
            var length     = NucleusDecayChart.HALF_LIFE_ARROW_LENGTH;
            var tailWidth  = NucleusDecayChart.HALF_LIFE_ARROW_TAIL_WIDTH;
            var headWidth  = NucleusDecayChart.HALF_LIFE_ARROW_HEAD_WIDTH;
            var headLength = NucleusDecayChart.HALF_LIFE_ARROW_HEAD_LENGTH;

            graphics.beginFill(color, 1);
            graphics.moveTo(0, 0);
            graphics.drawArrow(0, y,  length, y, tailWidth, headWidth, headLength);
            graphics.moveTo(0, 0);
            graphics.drawArrow(0, y, -length, y, tailWidth, headWidth, headLength);
            graphics.endFill();
        },

        initNucleiView: function() {
            this.nucleiView = new NucleusDecayChartNucleiView({
                simulation: this.simulation,
                height: this.graphHeight,
                isotope1Y: this.yAxisIsotope1.y - this.paddingTop,
                isotope2Y: this.yAxisIsotope2.y - this.paddingTop
            });

            this.nucleiView.displayObject.y = this.graphOriginY - this.graphHeight;

            this.displayObject.addChild(this.nucleiView.displayObject);
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
            var timeZeroPosX = this.graphOriginX + this.getTimeZeroXOffset();
            var y = this.graphOriginY;
            var x = timeZeroPosX + (time * this.msToPixelsFactor);
            var length = NucleusDecayChart.TICK_MARK_LENGTH;
            
            this.xAxisTicks.moveTo(x, y);
            this.xAxisTicks.lineTo(x, y - length);

            var label = new PIXI.Text(labelText, {
                font: NucleusDecayChart.SMALL_LABEL_FONT,
                fill: this.tickColor
            });

            label.x = x;
            label.y = y;
            label.anchor.x = 0.5;
            label.anchor.y = 0;
            label.resolution = this.getResolution();

            this.xAxisTickLabels.addChild(label);
        },

        dragHalfLifeStart: function(event) {
            this.lastDragX = event.data.global.x;
            this.draggingHalfLifeHandle = true;
            this.halfLifeMarkerHover.alpha = 1;
        },

        dragHalfLife: function(event) {
            if (this.draggingHalfLifeHandle) {
                var dx = event.data.global.x - this.lastDragX;

                var deltaMilliseconds = dx / this.msToPixelsFactor;

                var newHalfLife = this.simulation.get('halfLife') + deltaMilliseconds;
                if (newHalfLife < NucleusDecayChart.MIN_HALF_LIFE)
                    newHalfLife = NucleusDecayChart.MIN_HALF_LIFE;
                if (newHalfLife > (this.timeSpan * 0.95))
                    newHalfLife = (this.timeSpan * 0.95);

                if (newHalfLife !== this.simulation.get('halfLife')) {
                    this.simulation.set('halfLife', newHalfLife);
                    this.lastDragX = event.data.global.x;
                }
            }
        },

        dragHalfLifeEnd: function(event) {
            this.draggingHalfLifeHandle = false;
            if (!this.halfLifeHovering)
                this.halfLifeUnhover();
        },

        halfLifeHover: function() {
            this.halfLifeHovering = true;

            this.halfLifeMarkerHover.alpha = 1;
        },

        halfLifeUnhover: function() {
            this.halfLifeHovering = false;

            if (!this.draggingHalfLifeHandle) {
                this.halfLifeMarkerHover.alpha = 0;
            }
        },

        clearNuclei: function() {
            this.nucleiView.clear();
        },

        addNucleus: function(nucleus) {
            this.nucleiView.addNucleus(nucleus);
        },

        update: function(time, deltaTime, paused) {
            this.nucleiView.update(time, deltaTime, paused);
        },

        updateNucleusScale: function() {
            // Creates an MVT that will scale the nucleus graphics
            var nucleus = this.getSampleNucleus();
            var modelDiameter = nucleus.get('diameter');
            var viewDiameter = this.height * NucleusDecayChart.NUCLEUS_SIZE_PROPORTION;
            var scale = viewDiameter / modelDiameter;

            this.nucleiView.setNucleusScale(scale);
        },

        /**
         * Position the half life marker on the chart based on the values of the
         *   half life for the nucleus in the model.
         */
        updateHalfLifeMarker: function() {
            // Position the marker for the half life.
            var halfLife = this.simulation.get('halfLife');
            var halfLifeMarkerX = 0;

            if (this.getExponentialMode()) {
                if (halfLife == Number.POSITIVE_INFINITY) {
                    halfLifeMarkerX = this.graphOriginX + this.graphWidth;
                }
                else {
                    // halfLifeMarkerX = _exponentialTimeLine.mapTimeToHorizPixels( halfLife ) + _graphOriginX +
                    //                      ( TIME_ZERO_OFFSET * _msToPixelsFactor );
                    // halfLifeMarkerX = Math.min( halfLifeMarkerX, _xAxisOfGraph.getFullBoundsReference().getMaxX() );
                }
            }
            else {
                halfLifeMarkerX = this.graphOriginX + (NucleusDecayChart.TIME_ZERO_OFFSET_PROPORTION * this.timeSpan + halfLife) * this.msToPixelsFactor;
            }

            this.halfLifeMarker.x = halfLifeMarkerX;

            // Hide the x axis label if there is overlap with the half life label.
            var al = this.xAxisLabel;
            var hl = this.halfLifeMarkerText;
            var hlX = this.halfLifeMarker.x;
            var hlY = this.halfLifeMarker.y;
            this._axisLabelRect.set(
                al.x - al.width * al.anchor.x, al.y - al.height * al.anchor.y, 
                al.width, al.height
            );
            this._halfLifeTextRect.set(
                hl.x - hl.width * hl.anchor.x + hlX, hl.y - hl.height * hl.anchor.y + hlY, 
                hl.width, hl.height
            );
            this.xAxisLabel.visible = !(this._axisLabelRect.overlaps(this._halfLifeTextRect));

            // Position the infinity marker, set its scale, and set its visibility.
            // _halfLifeInfinityText.setScale( 1 );
            // if ( _halfLifeMarkerLine.getFullBoundsReference().height > 0 &&
            //      _halfLifeInfinityText.getFullBoundsReference().height > 0 ) {

            //     // Tweak the multiplier on the following line as needed.
            //     double desiredHeight = _halfLifeMarkerLine.getFullBoundsReference().height * 0.7;

            //     _halfLifeInfinityText.setScale( desiredHeight / _halfLifeInfinityText.getFullBoundsReference().height );
            // }

            // _halfLifeInfinityText.setOffset(
            //         _halfLifeMarkerLine.getX() - _halfLifeInfinityText.getFullBoundsReference().width,
            //         _halfLifeMarkerLine.getFullBoundsReference().getMinY() -
            //         _halfLifeInfinityText.getFullBoundsReference().height * 0.4 );

            // _halfLifeInfinityText.setVisible( _model.getHalfLife() == Double.POSITIVE_INFINITY );
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

            var isotope1Text = IsotopeSymbolGenerator.generate(nucleusType,        NucleusDecayChart.ISOTOPE_FONT_SIZE, 1);
            var isotope2Text = IsotopeSymbolGenerator.generate(decayedNucleusType, NucleusDecayChart.ISOTOPE_FONT_SIZE, 1);

            this.yAxisIsotope1.removeChildren();
            this.yAxisIsotope2.removeChildren();

            this.yAxisIsotope1.addChild(isotope1Text);
            this.yAxisIsotope2.addChild(isotope2Text);
        },

        setTimeSpan: function(timeSpan) {
            this.timeSpan = timeSpan;
            this.msToPixelsFactor = ((this.width - this.paddingLeft - this.paddingRight) * 0.98) / this.timeSpan;

            this.nucleiView.setMillisecondsToPixels(this.msToPixelsFactor);
            this.nucleiView.setWidth(this.graphWidth - this.getTimeZeroXOffset());
            this.nucleiView.displayObject.x = this.graphOriginX + this.getTimeZeroXOffset();

            this.drawXAxisTicks();
            this.updateHalfLifeMarker();
        },

        getExponentialMode: function() {
            return (this.simulation.get('nucleusType') === NucleusType.HEAVY_CUSTOM);
        },

        getTimeZeroXOffset: function() {
            return NucleusDecayChart.TIME_ZERO_OFFSET_PROPORTION * this.timeSpan * this.msToPixelsFactor;
        },

        getSampleNucleus: function() {
            return this.simulation.createNucleus();
        },

        nucleusTypeChanged: function(simulation, nucleusType) {
            this.halfLifeHandle.visible = NucleusType.isCustomizable(nucleusType);

            this.updateTimeSpan();
            this.updateIsotopes();
            this.updateNucleusScale();
        },

        halfLifeChanged: function(simulation, halfLife) {
            this.updateHalfLifeMarker();
        }

    }, Constants.NucleusDecayChart);


    return NucleusDecayChart;
});
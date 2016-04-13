define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var Colors = require('common/colors/colors');

    var HalfLifeInfo  = require('models/half-life-info');
    var NucleusType   = require('models/nucleus-type');
    var AtomicNucleus = require('models/atomic-nucleus');

    var IsotopeSymbolGenerator = require('views/isotope-symbol-generator');

    var DecayProportionChartView = require('radioactive-dating-game/views/decay-proportion-chart');

    var Constants = require('constants');

    /**
     * A panel that contains a chart showing the timeline for decay of nuclei over time.
     */
    var DatableItemDecayProportionChartView = DecayProportionChartView.extend({

        events: {
            'click .carbonPercentTab' : 'setCarbonPercentMode',
            'click .carbonRatioTab'   : 'setCarbonRatioMode'
        },

        /**
         * Initializes the new DatableItemDecayProportionChartView.
         */
        initialize: function(options) {
            options = _.extend({
                lineMode: false
            }, options);

            this.carbonButtonHeight = 40;
            this.carbonModePaddingRight = 55;
            this.ratioModePaddingLeft = 114;
            this.ratioModeTickLabelsWidth = 86;
            this.ratioModeYAxisLabelText = '\u00B9\u2074C / \u00B9\u00B2C Ratio';

            this.defaultPaddingTop = 45;
            this.defaultPaddingLeft = 90;
            this.defaultTickLabelsWidth = 46;
            this.defaultYAxisLabelText = 'Percent of\nElement Remaining';

            DecayProportionChartView.prototype.initialize.apply(this, [options]);            

            this.listenTo(this.simulation, 'reset', this.simulationReset);
            this.listenTo(this.simulation, 'change:mode', this.clearData);
            this.listenTo(this.simulation.meter, 'change:nucleusType',             this.nucleusTypeChanged);
            this.listenTo(this.simulation.meter, 'change:halfLifeOfCustomNucleus', this.halfLifeChanged);  

            this.nucleusTypeChanged(this.simulation.meter, this.simulation.meter.get('nucleusType'));
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.paddingRight = this.carbonModePaddingRight;
            this.calculateGraphDimensions();

            DecayProportionChartView.prototype.initGraphics.apply(this, arguments);

            this.initCarbonControls();
        },

        initCarbonControls: function() {
            this.carbonPercentTab = this.createTab('Percent of \u00B9\u2074C');
            this.carbonRatioTab   = this.createTab('\u00B9\u2074C / \u00B9\u00B2C Ratio');

            this.carbonPercentTab.y = this.height / 2;
            this.carbonRatioTab.y = this.height;
            this.carbonRatioTab.deselect();
            this.carbonPercentTab.select();

            this.carbonControls = new PIXI.Container();
            this.carbonControls.addChild(this.carbonPercentTab);
            this.carbonControls.addChild(this.carbonRatioTab);

            this.displayObject.addChild(this.carbonControls);
        },

        createTab: function(labelText) {
            var darkTabColor = 0x000000;
            var darkTabAlpha = 0.2;

            var graphics = new PIXI.Graphics();
            graphics.beginFill(darkTabColor, darkTabAlpha);
            graphics.drawRect(0, 0, this.height / 2, this.carbonButtonHeight);
            graphics.endFill();

            var text = new PIXI.Text(labelText, {
                font: DecayProportionChartView.SMALL_LABEL_FONT,
                fill: DecayProportionChartView.AXIS_LINE_COLOR
            });
            text.resolution = this.getResolution();
            text.anchor.x = 0.5;
            text.anchor.y = 0.5;
            text.y = this.carbonButtonHeight / 2;
            text.x = this.height * 0.25;

            var container = new PIXI.Container();
            container.addChild(graphics);
            container.addChild(text);

            container.hitArea = new PIXI.Rectangle(0, 0, this.height / 2, this.carbonButtonHeight);
            container.buttonMode = true;
            container.rotation = -Math.PI / 2;
            container.x = this.width - this.carbonButtonHeight;

            container.deselect = function() {
                graphics.visible = true;
                text.alpha = 0.8;
            };

            container.select = function() {
                graphics.visible = false;
                text.alpha = 1;
            };

            container.on('mouseover', function() {
                graphics.alpha = 0.8;
            });
            container.on('mouseout', function() {
                graphics.alpha = 1;
            });

            return container;
        },

        drawYAxisLabels: function() {
            if (this.carbonMode && this.ratioMode) {
                this.yAxisLabels.removeChildren();

                for (var i = 1; i <= 4; i++) {
                    var y = this.graphOriginY - (i / 4) * this.graphHeight;
                    var mantissa = i * 0.325;
                    if (mantissa % 0.325 !== 0)
                        mantissa = mantissa.toFixed(3);
                    var text = mantissa + ' x 10\u207B\u00B9\u00B2';
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
            }
            else {
                DecayProportionChartView.prototype.drawYAxisLabels.apply(this, arguments);
            }
        },

        drawGraphData: function() {
            for (var i = 0; i < this.dataTimes.length; i++)
                this.drawDataPoint(this.dataTimes[i], this.dataPercents[i], this.isotopeColor);
        },

        addCurrentGraphData: function() {
            var percentage = this.simulation.meter.getPercentageOfDatingElementRemaining();
            if (!isNaN(percentage)) {
                var time = this.simulation.getAdjustedTime();
                this.drawDataPoint(time, percentage / 100, this.isotopeColor);
                this.recordDataPoint(time, percentage / 100);
            }
        },

        updateGraph: function() {
            this.drawXAxis();
            this.drawYAxis();
            this.setTimeParameters(this.timeSpan, this.halfLife);
        },

        update: function(time, deltaTime, paused) {
            if (!paused && this.simulation.time > 0) {
                this.addCurrentGraphData();
            }
        },

        updateTimeSpan: function() {
            // Set the time span of the chart based on the nucleus type.
            var nucleusType = this.simulation.meter.get('nucleusType');

            var halfLife = (nucleusType === NucleusType.HEAVY_CUSTOM) ?
                this.simulation.meter.get('halfLifeOfCustomNucleus') :
                HalfLifeInfo.getHalfLifeForNucleusType(nucleusType);

            this.setTimeParameters(halfLife * 3.2, halfLife);
        },

        updateIsotope: function() {
            var nucleusType = this.simulation.meter.get('nucleusType');

            this.isotopeColor = Colors.parseHex(IsotopeSymbolGenerator.getElementColor(nucleusType));
        },

        setCarbonMode: function() {
            this.carbonMode = true;

            this.carbonControls.visible = true;
            this.paddingRight = this.carbonModePaddingRight;
            this.calculateGraphDimensions();

            this.clearData();
            this.updateGraph();
        },

        setUraniumMode: function() {
            this.carbonMode = false;

            this.carbonControls.visible = false;
            this.paddingRight = this.defaultPaddingTop;
            this.calculateGraphDimensions();

            this.clearData();
            this.updateGraph();
        },

        setCarbonPercentMode: function() {
            this.carbonPercentTab.select();
            this.carbonRatioTab.deselect();

            this.paddingLeft = this.defaultPaddingLeft;
            this.tickLabelsWidth = this.defaultTickLabelsWidth;
            this.yAxisLabelText = this.defaultYAxisLabelText;
            this.calculateGraphDimensions();

            this.ratioMode = false;

            this.dataGraphics.clear();
            this.updateGraph();
            this.drawGraphData();
        },

        setCarbonRatioMode: function() {
            this.carbonRatioTab.select();
            this.carbonPercentTab.deselect();

            this.paddingLeft = this.ratioModePaddingLeft;
            this.tickLabelsWidth = this.ratioModeTickLabelsWidth;
            this.yAxisLabelText = this.ratioModeYAxisLabelText;
            this.calculateGraphDimensions();

            this.ratioMode = true;

            this.dataGraphics.clear();
            this.updateGraph();
            this.drawGraphData();
        },

        nucleusTypeChanged: function(meter, nucleusType) {
            if (nucleusType === NucleusType.CARBON_14)
                this.setCarbonMode();
            else
                this.setUraniumMode();

            this.updateTimeSpan();
            this.updateIsotope();

            this.clearData();
        },

        halfLifeChanged: function(meter, halfLife) {
            this.updateTimeSpan();
            this.clearData();
        },

        simulationReset: function() {
            this.clearData();
        }

    });


    return DatableItemDecayProportionChartView;
});
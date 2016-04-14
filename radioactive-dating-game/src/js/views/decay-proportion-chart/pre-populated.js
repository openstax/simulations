define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var Colors = require('common/colors/colors');

    var NucleusType  = require('models/nucleus-type');
    var HalfLifeInfo = require('models/half-life-info');

    var DatableItemDecayProportionChartView = require('radioactive-dating-game/views/decay-proportion-chart/datable-item');

    var Constants = require('constants');

    var NUM_SAMPLES_ON_DECAY_CHART = Constants.PrePopulatedDatableItemDecayProportionChartView.NUM_SAMPLES_ON_DECAY_CHART;
    var HANDLE_COLOR          = Colors.parseHex(Constants.PrePopulatedDatableItemDecayProportionChartView.HANDLE_COLOR);
    var HANDLE_DRAGGING_COLOR = Colors.parseHex(Constants.PrePopulatedDatableItemDecayProportionChartView.HANDLE_DRAGGING_COLOR);
    var INFO_BOX_BG_COLOR     = Colors.parseHex(Constants.PrePopulatedDatableItemDecayProportionChartView.INFO_BOX_BG_COLOR);

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
            // Starting place for the handle
            this._lastRelativeHandlePosition = 0.5;

            var padding = 4;
            var row1Y = padding;
            var row2Y = padding + 13;

            var labelOptions = {
                font: PrePopulatedDatableItemDecayProportionChartView.INFO_BOX_LABEL_FONT,
                fill: PrePopulatedDatableItemDecayProportionChartView.INFO_BOX_LABEL_COLOR
            };

            var valueOptions = {
                font: PrePopulatedDatableItemDecayProportionChartView.INFO_BOX_VALUE_FONT,
                fill: PrePopulatedDatableItemDecayProportionChartView.INFO_BOX_VALUE_COLOR
            };

            this.infoIsotopeLabel = new PIXI.Text('', labelOptions);
            this.infoIsotopeLabel.resolution = this.getResolution();
            this.infoIsotopeLabel.x = padding;
            this.infoIsotopeLabel.y = row1Y;
            this.infoIsotopeNumberLabel = new PIXI.Text('', {
                font: 'bold 7px Helvetica Neue',
                fill: PrePopulatedDatableItemDecayProportionChartView.INFO_BOX_LABEL_COLOR
            });
            this.infoIsotopeNumberLabel.resolution = this.getResolution();
            this.infoIsotopeNumberLabel.x = padding;
            this.infoIsotopeNumberLabel.y = row1Y - 1;

            this.infoPercentValue = new PIXI.Text('56.7%', valueOptions);
            this.infoPercentValue.resolution = this.getResolution();
            this.infoPercentValue.x = PrePopulatedDatableItemDecayProportionChartView.INFO_BOX_WIDTH - padding;
            this.infoPercentValue.y = row1Y;
            this.infoPercentValue.anchor.x = 1;

            this.infoTimeLabel = new PIXI.Text('Time:', labelOptions);
            this.infoTimeLabel.resolution = this.getResolution();
            this.infoTimeLabel.x = padding;
            this.infoTimeLabel.y = row2Y;
            this.infoTimeValue = new PIXI.Text('4689 yrs', valueOptions);
            this.infoTimeValue.resolution = this.getResolution();
            this.infoTimeValue.x = PrePopulatedDatableItemDecayProportionChartView.INFO_BOX_WIDTH - padding;
            this.infoTimeValue.y = row2Y;
            this.infoTimeValue.anchor.x = 1;

            this.handleLabel = new PIXI.Container();
            this.handleLabel.x = -PrePopulatedDatableItemDecayProportionChartView.INFO_BOX_WIDTH / 2;
            this.handleLabel.y = -this.graphHeight - PrePopulatedDatableItemDecayProportionChartView.INFO_BOX_MARGIN - PrePopulatedDatableItemDecayProportionChartView.INFO_BOX_HEIGHT;
            this.handleLabel.addChild(this.infoIsotopeLabel);
            this.handleLabel.addChild(this.infoIsotopeNumberLabel);
            this.handleLabel.addChild(this.infoPercentValue);
            this.handleLabel.addChild(this.infoTimeLabel);
            this.handleLabel.addChild(this.infoTimeValue);

            this.handleGraphics = new PIXI.Graphics();
            this.handleDraggingGraphics = new PIXI.Graphics();
            this.handleDraggingGraphics.visible = false;
            this.handleHandle = new PIXI.Container();

            this.handle = new PIXI.Container();
            this.handle.buttonMode = true;
            this.handle.defaultCursor = 'ew-resize';
            this.handle.addChild(this.handleGraphics);
            this.handle.addChild(this.handleDraggingGraphics);
            this.handle.addChild(this.handleHandle);
            this.handle.addChild(this.handleLabel);

            this.displayObject.addChild(this.handle);
        },

        drawHandle: function() {
            this._drawHandle(this.handleGraphics, HANDLE_COLOR, 6);
            this._drawHandle(this.handleDraggingGraphics, HANDLE_DRAGGING_COLOR, 8);

            var thickness = 12;
            this.handleHandle.hitArea = new PIXI.Rectangle(-thickness / 2, -this.handleGraphics.height, thickness, this.handleGraphics.height);
        },

        _drawHandle: function(graphics, color, ballRadius) {
            var boxMargin = PrePopulatedDatableItemDecayProportionChartView.INFO_BOX_MARGIN;
            var boxWidth = PrePopulatedDatableItemDecayProportionChartView.INFO_BOX_WIDTH;
            var boxHeight = PrePopulatedDatableItemDecayProportionChartView.INFO_BOX_HEIGHT;
            var boxBottomY = -this.graphHeight - boxMargin;
            var circleY = boxMargin * 2;

            graphics.clear();

            graphics.lineStyle(2, color, 1);
            graphics.moveTo(0, boxMargin);
            graphics.lineTo(0, boxBottomY);
            graphics.beginFill(INFO_BOX_BG_COLOR, PrePopulatedDatableItemDecayProportionChartView.INFO_BOX_BG_ALPHA);
            graphics.drawRoundedRect(-boxWidth / 2, boxBottomY - boxHeight, boxWidth, boxHeight, PrePopulatedDatableItemDecayProportionChartView.INFO_BOX_RADIUS);
            graphics.endFill();
            
            graphics.lineStyle(0, 0, 0);
            graphics.beginFill(color, 1);
            graphics.drawCircle(0, circleY, ballRadius);
            graphics.endFill();
            graphics.beginFill(color, 1);
            graphics.moveTo(0, 0);
            graphics.lineTo( boxMargin, circleY);
            graphics.lineTo(-boxMargin, circleY);
            graphics.endFill();
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

                this.updateHandleInfo();
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
            this.handle.x = this.graphOriginX + this._lastRelativeHandlePosition * this.graphWidth;
        },

        updateHandleInfo: function() {
            var x = this.handle.x;
            var time = (x - this.graphOriginX) / this.msToPixelsFactor;
            var percent = this.getClosestDataValue(time);
            this.infoPercentValue.text = (percent * 100).toFixed(1) + '%';
            this.infoTimeValue.text = this.getTimeText(time);

            // Save it in case we switch graphs
            this._lastRelativeHandlePosition = (x - this.graphOriginX) / this.graphWidth;
        },

        getClosestDataValue: function(time) {
            if (this.dataTimes.length === 0) {
                // There are no data points, so return 0.
                return 0;
            }
            else if (time < this.dataTimes[0]) {
                // The request is for the space prior to the first data point,
                //   so return the value for the first point.
                return this.dataPercents[0];
            }
            else {
                // Find the enclosing data points.
                var times = this.dataTimes;
                var leftIndex = null;
                var rightIndex = null;

                for (var i = 0; i < times.length; i++) {
                    leftIndex = i;
                    if (i === times.length - 1) {
                        // We are at the end of the chart, and there are no
                        // more points to be used, so use the last point for
                        // both the left and right points.
                        rightIndex = leftIndex;
                    }
                    else {
                        rightIndex = i + 1;
                        if (time >= times[leftIndex] && time < times[rightIndex]) {
                            // This is the pair of points we are looking for.
                            break;
                        }
                    }
                }

                if (time - times[leftIndex] <= times[rightIndex] - time)
                    return this.dataPercents[leftIndex];
                else
                    return this.dataPercents[rightIndex];
            }

            return returnValue;
        },

        getTimeText: function(time) {
            var timeString;

            if (time < HalfLifeInfo.convertYearsToMs(1E6)) {
                // Use individual years.
                timeString = HalfLifeInfo.convertMsToYears(time).toFixed(0) + ' yrs';
            }
            else if (time < HalfLifeInfo.convertYearsToMs(1E9)) {
                // Use millions of years.
                timeString = (HalfLifeInfo.convertMsToYears(time) / 1E6).toFixed(2) + ' MY';
            }
            else {
                // Use billions of years.
                timeString = (HalfLifeInfo.convertMsToYears( time ) / 1E9).toFixed(2) + ' BY';
            }

            return timeString;
        },

        nucleusTypeChanged: function(meter, nucleusType) {
            DatableItemDecayProportionChartView.prototype.nucleusTypeChanged.apply(this, arguments);

            var element;
            var number;

            if (nucleusType === NucleusType.CARBON_14) {
                element = '   C';
                number = '14';
            }
            else if (nucleusType === NucleusType.URANIUM_238) {
                element = '     U';
                number = '238';
            }
            else {
                element = '?';
                number = '';
            }
            
            this.infoIsotopeNumberLabel.text = number;
            this.infoIsotopeLabel.text = element + ':';

            this.generateData();
            this.drawGraphData();
            this.updateHandleInfo();
        },

        halfLifeChanged: function() {
            DatableItemDecayProportionChartView.prototype.halfLifeChanged.apply(this, arguments);

            this.generateData();
            this.drawGraphData();
            this.updateHandleInfo();
        }

    }, Constants.PrePopulatedDatableItemDecayProportionChartView);


    return PrePopulatedDatableItemDecayProportionChartView;
});
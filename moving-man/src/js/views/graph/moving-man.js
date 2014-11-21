define(function(require) {

    'use strict';

    var $ = require('jquery');

    var GraphView = require('common/graph/graph');

    require('nouislider');

    var xAxisButtonsHtml = require('text!templates/graph-x-axis-buttons.html');
    var yAxisButtonsHtml = require('text!templates/graph-y-axis-buttons.html');

    /**
     * MovingManGraphView shows the value of a given moving-man variable
     *   over time (e.g., position, velocity, or acceleration over time).
     */
    var MovingManGraphView = GraphView.extend({

        className: GraphView.prototype.className + ' moving-man-graph-view',

        events: {
            'slide .playback-time-slider' : 'changePlaybackTime',

            'click .zoom-in-x'  : 'zoomInX',
            'click .zoom-out-x' : 'zoomOutX',
            'click .zoom-in-y'  : 'zoomInY',
            'click .zoom-out-y' : 'zoomOutY'
        },

        /**
         * Internal fields
         */
        pixelRatioX: 1, 
        pixelRatioY: 1,

        /**
         * Object initialization
         */
        initialize: function(options) {

            if (options.graphSeries)
                this.graphSeries = options.graphSeries;
            else
                throw 'MovingManGraphView requires a graph series object to render.';

            if (options.simulation)
                this.simulation = options.simulation;
            else
                throw 'MovingManGraphView requires a simulation model to render.';

            this.maxTimeSpan  = this.simulation.get('maxTime') || 20;
            this.maxValueSpan = Math.abs(options.y.end - options.y.start);

            this.timeSpan  = this.maxTimeSpan;
            this.valueSpan = this.maxValueSpan;

            GraphView.prototype.initialize.apply(this, [options]);

            this.listenTo(this.simulation.movingMan, 'history-cleared', function() {
                this.initPoints();
            });
            this.listenTo(this.simulation, 'change:recording', this.recordingChanged);
            this.listenTo(this.simulation, 'change:time',      this.timeChanged);

            this.on('zoom-y', this.zoomY);
        },

        /**
         * Renders html container
         */
        renderContainer: function() {
            this.$el.html(this.template(this.graphInfo));

            this.$showButton = this.$('.graph-show-button');
            this.$hideButton = this.$('.graph-hide-button');

            this.$slider = $('<div class="playback-time-slider">');
            this.$slider.noUiSlider({
                start: 0,
                range: {
                    min: 0,
                    max: 0
                }
            });
            this.$slider.find('.noUi-handle')
                .append('<div class="handle-top">')
                .append('<div class="handle-bottom">');

            if (!this.simulation.get('recording'))
                this.$slider.show();

            this.$('.graph-view-graph-wrapper').append(this.$slider);

            if (this.graphInfo.x)
                this.$('.graph-view-graph-wrapper').append(xAxisButtonsHtml);
            if (this.graphInfo.y)
                this.$('.graph-view-graph-wrapper').append(yAxisButtonsHtml);
        },

        /**
         * Does the actual resizing of the canvas. We need to also update
         *  our cached pixel ratio.
         */
        resize: function() {
            GraphView.prototype.resize.apply(this);
            this.pixelRatioX = this.width / this.timeSpan;
            this.pixelRatioY = this.height / this.valueSpan;
            this.updateSliderOptions();
        },

        /**
         * Whenver the furthest recorded time has changed, we need to
         *   change the slider's range.  However, if this is updated
         *   while the simulation is recording, this will be called
         *   many times a second, so that needs to be avoided.
         */
        updateSliderOptions: function() {
            var max = Math.min(this.simulation.get('furthestRecordedTime'), this.timeSpan);

            this.$slider.noUiSlider({
                start: this.simulation.time,
                range: {
                    min: 0,
                    max: max
                }
            }, true); // true to rebuild

            this.$slider.width(this.pixelRatioX * max);
        },

        /**
         * Initializes points array and sets default points.  The number
         *   of points is based on the lattice width.
         */
        initPoints: function() {
            this.points = [];
        },

        /**
         * Calculates point data before drawing.
         */
        calculatePoints: function() {
            var points      = this.points;
            var height      = this.height;
            var pixelRatioX = this.pixelRatioX;
            var pixelRatioY = this.pixelRatioY;
            var graphSeries = this.graphSeries;
            var length      = graphSeries.size();
            
            for (var i = 0; i < length; i++) {
                if (i >= points.length)
                    this._addPoint();

                points[i].x = graphSeries.getPoint(i).time  * pixelRatioX;
                points[i].y = height / 2 - graphSeries.getPoint(i).value * pixelRatioY;
            }

            // Hide the beginning
            if (length)
                points[0].x = -1;
        },

        /**
         * Adds a blank point object to the end of the points array.
         */
        _addPoint: function() {
            this.points.push({ 
                x: 0, 
                y: 0 
            });
        },

        /**
         * Gets the time from the playback time slider and tells the
         *   simulation to seek to that time.
         */
        changePlaybackTime: function(event) {
            var time = parseFloat($(event.target).val());
            if (!isNaN(time)) {
                this.changingTime = true;
                // this.simulation.time = time;
                // this.simulation.set('time', time);
                this.simulation.setPlaybackTime(time);
                this.changingTime = false;
            }
        },

        /**
         * Updates the playback time slider according to the current
         *   time on the simulation.
         */
        timeChanged: function(model, time) {
            if (!this.simulation.get('recording') && !this.changingTime)
                this.$slider.val(time);
        },

        /**
         * Called when the sim's recording state changes and stuff
         */
        recordingChanged: function() {
            if (this.simulation.get('recording'))
                this.$slider.hide();
            else {
                this.updateSliderOptions();
                this.$slider.val(this.simulation.time);
                this.$slider.show();
            }
        },

        /**
         * Recalculates the x-axis graph info from the changed timeSpan
         *   so we can rerender.
         */
        recalculateXInfo: function() {
            if (this.graphInfo.x) {
                this.graphInfo.x.end = this.timeSpan;
                this.graphInfo.x.step = this.timeSpan / (this.longitudinalGridLines + 1);
            }
        },

        /**
         * Recalculates the y-axis graph info from the changed timeSpan
         *   so we can rerender.
         */
        recalculateYInfo: function() {
            if (this.graphInfo.y) {
                this.graphInfo.y.start = -this.valueSpan / 2;
                this.graphInfo.y.end   =  this.valueSpan / 2;
                this.graphInfo.y.step = this.valueSpan / (this.latitudinalGridLines + 1);
            }
        },

        /**
         * Sets the timeSpan, updates the graph info, and rerenders
         *   the view.
         */
        zoomX: function(timeSpan) {
            this.timeSpan = timeSpan;
            this.recalculateXInfo();
            this.render();
            this.postRender();
        },

        /**
         * Sets the valueSpan, updates the graph info, and rerenders
         *   the view.
         */
        zoomY: function(valueSpan) {
            this.valueSpan = valueSpan;
            this.recalculateYInfo();
            this.render();
            this.postRender();
        },

        /**
         * Decreases the timeSpan and triggers a zoom-x event.
         */
        zoomInX: function(event) {
            this.timeSpan -= 2;
            if (this.timeSpan < 2)
                this.timeSpan = 2;
            
            this.trigger('zoom-x', this.timeSpan);
        },

        /**
         * Increases the timeSpan and triggers a zoom-x event.
         */
        zoomOutX: function(event) {
            this.timeSpan += 2;
            if (this.timeSpan > this.maxTimeSpan)
                this.timeSpan = this.maxTimeSpan;
            
            this.trigger('zoom-x', this.timeSpan);
        },

        /**
         * Decreases the valueSpan and triggers a zoom-y event.
         */
        zoomInY: function(event) {
            var tempValueSpan = this.valueSpan - this.maxValueSpan / 8;
            if (tempValueSpan > 1) {
                this.valueSpan = tempValueSpan;
                this.trigger('zoom-y', this.valueSpan);
            }
        },

        /**
         * Increases the valueSpan and triggers a zoom-y event.
         */
        zoomOutY: function(event) {
            this.valueSpan += this.maxValueSpan / 8;
            if (this.valueSpan > this.maxValueSpan)
                this.valueSpan = this.maxValueSpan;
            
            this.trigger('zoom-y', this.valueSpan);
        }

    });

    return MovingManGraphView;
});

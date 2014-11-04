define(function(require) {

	'use strict';

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
			'slide .playback-time-slider' : 'changePlaybackTime'
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

			this.timeSpan  = this.simulation.get('maxTime') || 20;
			this.valueSpan = Math.abs(options.y.end - options.y.start);

			GraphView.prototype.initialize.apply(this, [options]);

			this.listenTo(this.simulation.movingMan, 'history-cleared', function() {
				this.initPoints();
			});
			this.listenTo(this.simulation, 'change:recording', function() {
				if (this.simulation.get('recording'))
					this.$slider.hide();
				else {
					this.updateSliderOptions();
					this.$slider.val(this.simulation.time);
					this.$slider.show();
				}
			});
			this.listenTo(this.simulation, 'change:time', this.timeChanged);
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
			
			for (i = 0; i < length; i++) {
				if (i >= points.length)
					this._addPoint();

				points[i].x = graphSeries.getPoint(i).time  * pixelRatioX;
				points[i].y = this.height / 2 - graphSeries.getPoint(i).value * pixelRatioY;
			}

			// Hide the beginning
			if (length)
				points[0].x = -1;
		},

		/**
		 *
		 */
		_addPoint: function() {
			this.points.push({ 
				x: 0, 
				y: 0 
			});
		},

		/**
		 *
		 */
		changePlaybackTime: function(event) {
			var time = parseFloat($(event.target).val());
			if (!isNaN(time)) {
				this.changingTime = true;
				this.simulation.time = time;
				this.simulation.set('time', time);
				this.changingTime = false;
			}
		},

		/**
		 *
		 */
		timeChanged: function(model, time) {
			if (!this.simulation.get('recording') && !this.changingTime)
				this.$slider.val(time);
		}

	});

	return MovingManGraphView;
});

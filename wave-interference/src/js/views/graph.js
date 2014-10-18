define(function(require) {

	'use strict';

	var $        = require('jquery');
	var _        = require('underscore');
	var Backbone = require('backbone'); Backbone.$ = $;

	/*
	 * "Local" variables for functions to share and recycle
	 */
	var context,
		gridCellWidth,
		gridCellHeight,
		points,
	    i,
	    j;

	/**
	 * GraphView is not intended to be directly instantiated but extended
	 *   for specific purposes.  Functions that must be filled by child
	 *   prototypes before the GraphView is useful:
	 *
	 *     + renderContainer
	 *     + initPoints
	 *     + calculatePoints
	 */
	var GraphView = Backbone.View.extend({

		initialize: function(options) {

			// Default values
			options = _.extend({
				title: 'Value',
				showButtonText: 'Show Graph',
				x: {
					start: 0,
					end: 100,
					step: 10,
					label: 'x (cm)',
					showNumbers: true
				},
				y: {
					start: 0,
					end: 100,
					step: 10,
					label: 'y (cm)',
					showNumbers: false
				},
				lineThickness: 5,
				lineColor: '#000',
				gridColor: '#ddd',
				portrait: false,
				latitudinalGridLines: 3,
				longitudinalGridLines: 9
			}, options);

			// Save options
			if (options.waveSimulation)
				this.waveSimulation = options.waveSimulation;
			else
				throw 'GraphView requires a WaveSimulation model to render.';

			// Save graph information for rendering
			this.graphInfo = {
				title: options.title,
				showButtonText: options.showButtonText,
				x: options.x,
				y: options.y
			};

			this.latitudinalGridLines  = options.latitudinalGridLines;
			this.longitudinalGridLines = options.longitudinalGridLines;

			this.portrait = options.portrait;

			this.lineThickness = options.lineThickness;
			this.lineColor = options.lineColor;
			this.gridColor = options.gridColor;

			this.graphVisible = true;

			// Bind events
			$(window).bind('resize', $.proxy(this.windowResized, this));

			this.initPoints();
		},

		/**
		 * Renders content and canvas for heatmap
		 */
		render: function() {
			this.$el.empty();

			if (this.portrait)
				this.$el.addClass('portrait');
			else
				this.$el.addClass('landscape');

			this.renderContainer();
			this.initCanvas();
			this.initPoints();

			return this;
		},

		/**
		 * Renders html container
		 */
		renderContainer: function() {},

		/**
		 * Called after every component on the page has rendered to make sure
		 *   things like widths and heights and offsets are correct.
		 */
		postRender: function() {
			this.resize();
		},

		/**
		 * Saves references to the canvas element and its context
		 */
		initCanvas: function() {
			this.$canvas = this.$('canvas');
			this.$canvasWrapper = this.$canvas.parent();

			this.context = this.$canvas[0].getContext('2d');
		},

		/**
		 * Called on a window resize to resize the canvas
		 */
		windowResized: function(event) {
			this.resizeOnNextUpdate = true;
		},

		/**
		 * Does the actual resizing of the canvas
		 */
		resize: function(event) {
			var width  = this.$canvas.parent().innerWidth();
			var height = this.$canvas.parent().innerHeight() || 200;
			this.width  = width;
			this.height = height;
			this.$canvas.width(width);
			this.$canvas.height(height);
			this.$canvas[0].width = width;
			this.$canvas[0].height = height;
			this.resizeOnNextUpdate = false;
		},

		/**
		 * Initializes points array and sets default points.
		 */
		initPoints: function() {
			this.points = [];
		},

		/**
		 * Calculates point data before drawing.
		 */
		calculatePoints: function(time, delta) {},

		/**
		 * Draws a blank graph with lines.
		 */
		drawGraph: function() {
			context = this.context;

			// Draw background
			context.fillStyle = '#fff';
			context.fillRect(0, 0, this.width, this.height);

			// Draw Grid
			context.beginPath();

			gridCellHeight = Math.round((this.height + 2) / (this.latitudinalGridLines + 1));
			gridCellWidth  = Math.round((this.width  + 2) / (this.longitudinalGridLines + 1));

			// Draw latitudinal grid lines
			for (j = 1; j <= this.latitudinalGridLines; j++) {
				context.moveTo(0, gridCellHeight * j - 0.5);
				context.lineTo(this.width, gridCellHeight * j - 0.5);
			}

			// Draw longitudinal grid lines
			for (i = 1; i <= this.longitudinalGridLines; i++) {
				context.moveTo(gridCellWidth * i - 0.5, 0);
				context.lineTo(gridCellWidth * i - 0.5, this.height);
			}

			context.lineWidth   = 1;
			context.strokeStyle = this.gridColor;
			context.stroke();
		},

		/**
		 * Draws the points as a curve on the graph.
		 */
		drawCurve: function() {
			context = this.context;
			points  = this.points;

			context.beginPath();
			context.moveTo(points[0].x, points[0].y);

			for (i = 1; i < this.points.length; i++) {
				context.lineTo(points[i].x, points[i].y);
			}

			context.lineWidth = 3;
			context.lineJoin = 'round';
			context.strokeStyle = this.lineColor;
			context.stroke();
		},

		/**
		 * Responds to resize events and draws everything.
		 */
		update: function(time, delta) {
			if (this.resizeOnNextUpdate)
				this.resize();

			if (this.graphVisible) {
				this.calculatePoints(time, delta);
				this.drawGraph(time, delta);
				this.drawCurve(time, delta);
			}
		}
	});

	return GraphView;
});

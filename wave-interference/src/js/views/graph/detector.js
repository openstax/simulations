define(function(require) {

	'use strict';

	var GraphView = require('views/graph');

	var html = require('text!templates/detector-graph.html');

	/*
	 * "Local" variables for functions to share and recycle
	 */
	var context,
		height,
		xSpacing,
		xOffset,
		points,
	    i,
	    j;


	/**
	 * DetectorGraphView shows the value of a certain point in the lattice
	 *   over time.  Because the x axis changes as time marches on, the
	 *   x-axis number labels are rendered with an html canvas for more
	 *   efficient painting (no manipulation of dom required).
	 */
	var DetectorGraphView = GraphView.extend({

		template: _.template(html),

		className: 'detector-graph-view',
		tagName: 'figure',

		initialize: function(options) {
			// Default values
			options = _.extend({
				title: 'Point Value Over Time',
				x: {
					label: 'Time (s)'
				},
				y: {
					start: 0,
					end: 4,
					step: 1,
					label: 'Water Level',
					showNumbers: false
				},
				latitudinalGridLines: 3,
				longitudinalGridLines: 3,
				latticePoint: {
					x: 0,
					y: 0
				},
				historyLength: 300,
				tickColor: '#bbb',
				numberColor: '#888',
				numberFont: 'normal 10px Helvetica Neue, Helvetica, Arial, sans-serif',
				numberY: 16
			}, options);

			GraphView.prototype.initialize.apply(this, [options]);
			
			// Save options
			this.latticePoint  = options.latticePoint;
			this.historyLength = options.historyLength;
			this.tickColor     = options.tickColor;
			this.numberColor   = options.numberColor;
			this.numberFont    = options.numberFont;
			this.numberY       = options.numberY;
		},

		/**
		 * Renders html container
		 */
		renderContainer: function() {
			this.$el.html(this.template(this.graphInfo));

			
		},

		/**
		 * Does the actual resizing of the canvas. We need to also update
		 *  our cached xSpacing whenever the canvas size changes.
		 */
		resize: function() {
			GraphView.prototype.resize.apply(this);
			var width  = this.$xCanvas.parent().innerWidth();
			var height = this.$xCanvas.parent().innerHeight();
			this.xWidth  = width;
			this.xHeight = height;
			this.$xCanvas.width(width);
			this.$xCanvas.height(height);
			this.$xCanvas[0].width = width;
			this.$xCanvas[0].height = height;

			this.xSpacing = this.width / this.historyLength;
			this.gridXSpacing = this.xWidth / (this.longitudinalGridLines + 1);

			// Calculate speed in pixels per millisecond, targeting 1 gridline per second
			this.gridCellHeight = Math.round((this.height + 2) / (this.latitudinalGridLines + 1));
			this.gridCellWidth  = Math.round((this.width  + 2) / (this.longitudinalGridLines + 1));
			this.graphingSpeed = this.gridCellWidth / 1000;
		},

		/**
		 * Saves references to the canvas elements and their contexts
		 */
		initCanvas: function() {
			this.$canvas = this.$('.detector-graph-canvas');
			this.$canvasWrapper = this.$canvas.parent();

			this.context = this.$canvas[0].getContext('2d');

			this.$xCanvas = this.$('.detector-x-canvas');
			this.xContext = this.$xCanvas[0].getContext('2d');
		},

		/**
		 * This needs to be called within the loop because the starting 
		 *   offset is based off of time.
		 */
		initOffsets: function(time) {
			this.gridInitialized = true;
			this.xOffset = 0;
			this.gridXOffset = (Math.ceil(time) - time) * this.graphingSpeed;
		},

		/**
		 * Initializes the array for storing x-axis label numbers
		 */
		initXAxisNumbers: function(time) {
			this.xAxisNumbers = [];

			var start = Math.ceil(time / 1000);
			for (i = 0; i < this.longitudinalGridLines + 2; i++)
				this.xAxisNumbers[i] = start + i;
		},

		/**
		 * Initializes points array and sets default points.  The number
		 *   of points is based on either the lattice width or height,
		 *   depending on whether the graph is in portrait or landscape.
		 *   This function should be overriden by child classes that
		 *   use the graph to show different data.
		 */
		initPoints: function() {
			this.points = [];
			this.points.push({ 
				x: 0, 
				y: 0 
			});
		},

		/**
		 * Overrides the GraphView's update method to make sure we 
		 *   initialize the offsets with the right starting time.
		 */
		update: function(time, delta) {
			if (!this.gridInitialized) {
				this.initOffsets(time);
				this.initXAxisNumbers(time);
			}

			this.calculateGraphLayout(time, delta);

			GraphView.prototype.update.apply(this, [time, delta]);
		},

		/**
		 * Calculates point data before drawing.
		 */
		calculatePoints: function(time, delta) {
			points   = this.points;
			height   = this.height;
			
			this.xOffset += delta * this.graphingSpeed; // pixels per millisecond
			while (this.xOffset > this.xSpacing) {
				this.xOffset -= this.xSpacing;
				this.shiftYValues();
			}
			this.recalculateXPositions();

			// Apply the latest value from the lattice to the rightmost point
			this.points[this.points.length - 1].y = this.getCurrentY();

			// Hide the beginning
			points[0].x = -1;
		},

		/**
		 * Shifts all the y values one position towards the
		 *   front of the array and discards the first value.
		 *   If it doesn't have enough history yet to need to
		 *   shift values, it simply appends a point to the
		 *   end of the points array.
		 */
		shiftYValues: function() {
			points = this.points;

			if (points.length === this.historyLength) {
				length = points.length - 1;
				for (i = 0; i < length; i++)
					points[i].y = points[i + 1].y;
				points[points.length - 1].y = this.getCurrentY();
			}
			else {
				points.push({ 
					x: 0, 
					y: this.getCurrentY()
				});
			}
		},

		/**
		 * Sets each point's x to the corresponding x with
		 *   an offset that changes with time.
		 */
		recalculateXPositions: function() {
			xSpacing = this.xSpacing;
			xOffset  = this.xOffset;

			points = this.points;
			length = this.points.length;
			if (length === this.historyLength) {
				for (i = 0; i < length; i++)
					points[i].x = (i * xSpacing) - xOffset;	
			}
			else {
				for (i = 0; i < length; i++)
					points[i].x = i * xSpacing;
			}
		},

		/**
		 * Converts the current lattice point value into a usable y-location to paint.
		 */
		getCurrentY: function() {
			return ((this.getCurrentValue() - 2) / -4) * this.height;
		},

		/**
		 * Gets the current value of the lattice point
		 */
		getCurrentValue: function() {
			return this.waveSimulation.lattice.data[this.latticePoint.x][this.latticePoint.y];
		},


		/**
		 * Draws a blank graph with lines.
		 */
		drawGraph: function(time, delta) {
			context = this.context;

			// Draw background
			context.fillStyle = '#fff';
			context.fillRect(0, 0, this.width, this.height);

			// Draw Grid
			context.beginPath();

			// Draw latitudinal grid lines
			for (j = 1; j <= this.latitudinalGridLines; j++) {
				context.moveTo(0,          this.gridCellHeight * j - 0.5);
				context.lineTo(this.width, this.gridCellHeight * j - 0.5);
			}

			// Draw longitudinal grid lines
			for (i = 1; i < this.longitudinalGridLines + 2; i++) {
				context.moveTo(this.gridCellWidth * i - 0.5 - this.gridXOffset, 0);
				context.lineTo(this.gridCellWidth * i - 0.5 - this.gridXOffset, this.height);
			}

			context.lineWidth   = 1;
			context.strokeStyle = this.gridColor;
			context.stroke();


			// Draw x-axis numbers and ticks
			this.drawXAxisLabel();
			
		},

		drawXAxisLabel: function(time, delta) {
			context = this.xContext;

			// Clear the drawing board
			context.clearRect(0, 0, this.xWidth, this.xHeight);

			context.beginPath();

			// All the offsets on the x axis combined
			xOffset = -this.gridXOffset + 0.5;

			// Draw ticks
			for (i = 0; i <= this.longitudinalGridLines + 2; i++) {
				context.moveTo(this.gridCellWidth * i + xOffset, 0);
				context.lineTo(this.gridCellWidth * i + xOffset, 4);
			}

			context.lineWidth   = 1;
			context.strokeStyle = this.tickColor;
			context.stroke();

			// Draw x-axis numbers

			context.font = this.numberFont;
			context.textAlign = 'center';
			context.fillStyle = this.numberColor;

			length = this.xAxisNumbers.length;
			for (i = 0; i < length; i++)
				context.fillText(this.xAxisNumbers[i], this.gridCellWidth * i + xOffset, this.numberY);
			
		},

		calculateGraphLayout: function(time, delta) {
			if (this.points.length === this.historyLength) {
				this.gridXOffset += delta * this.graphingSpeed; // pixels per ms
				while (this.gridXOffset > this.gridXSpacing) {
					//console.log('shifting ' + (time / 1000));
					this.gridXOffset -= this.gridXSpacing;
					this.shiftXLabels(time);
				}
			}
		},

		shiftXLabels: function(time) {
			length = this.xAxisNumbers.length - 1;
			for (i = 0; i < length; i++)
				this.xAxisNumbers[i] = this.xAxisNumbers[i + 1];
			this.xAxisNumbers[this.xAxisNumbers.length - 1] = Math.ceil(time / 1000);
		}

	});

	return DetectorGraphView;
});

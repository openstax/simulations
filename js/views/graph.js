define(function(require) {

	'use strict';

	var $        = require('jquery');
	var _        = require('underscore');
	var Backbone = require('backbone');
	//var PIXI     = require('pixi');
	var html     = require('text!templates/graph.html');

	/*
	 * "Local" variables for functions to share and recycle
	 */
	var context,
	    lat,
		latWidth,
		latHeight,
		height,
		xSpacing,
		gridCellWidth,
		gridCellHeight,
		points,
	    i,
	    j;
	    // cx,
	    // cy;

	var GraphView = Backbone.View.extend({

		template: _.template(html),

		className: 'graph-container',
		tagName: 'figure',

		events: {
			'click .graph-show-button' : 'show',
			'click .graph-hide-button' : 'hide'
		},

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
				portrait: false
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

			this.portrait = options.portrait;

			this.lineThickness = options.lineThickness;
			this.lineColor = options.lineColor;
			this.gridColor = options.gridColor;

			// Bind events
			$(window).bind('resize', $.proxy(this.windowResized, this));
			//this.listenTo(this.waveSimulation, 'change:crossSectionY', ) don't need to listen because it renders every frame anyway

			// Ratio between pixels and cell width
			this.xSpacing = 1;

			this.points = [];

			// Don't start drawing the curve until the graph is showing
			this.graphVisible = false;
		},

		/**
		 * Renders content and canvas for heatmap
		 */
		render: function() {
			this.$el.empty();
			this.$el.removeClass('open');

			if (this.portrait)
				this.$el.addClass('portrait');
			else
				this.$el.addClass('landscape');

			this.renderContainer();
			this.initCanvas();

			return this;
		},

		/**
		 * Renders html container
		 */
		renderContainer: function() {
			this.$el.html(this.template(this.graphInfo));

			this.$showButton = this.$('.graph-show-button');
			this.$hideButton = this.$('.graph-hide-button');
		},

		/**
		 * Called after every component on the page has rendered to make sure
		 *   things like widths and heights and offsets are correct.
		 */
		postRender: function() {
			this.padding = parseInt(this.$canvas.css('top'));
			this.resize();
		},

		/**
		 * Initializes a renderer using the .heatmap-canvas canvas element
		 */
		initCanvas: function() {
			this.$canvas = this.$('.graph-canvas');

			this.context = this.$canvas[0].getContext('2d');
		},

		/**
		 * Called on a window resize to resize the canvas
		 */
		windowResized: function(event) {
			this.resizeOnNextUpdate = true;
		},

		resize: function(event) {
			var width  = this.$canvas.parent().innerWidth();
			var height = this.$canvas.parent().innerHeight() || 200;
			this.width  = width;
			this.height = height;
			this.$canvas.width(width);
			this.$canvas.height(height);
			this.$canvas[0].width = width;
			this.$canvas[0].height = height;
			this.xSpacing = width  / (this.waveSimulation.lattice.width - 1);
			this.resizeOnNextUpdate = false;
		},

		update: function(time, delta) {
			if (this.resizeOnNextUpdate)
				this.resize();

			if (!this.graphVisible)
				return;

			this.drawCurve();
		},

		drawCurve: function() {
			lat       = this.waveSimulation.lattice.data;
			latWidth  = this.waveSimulation.lattice.width;
			latHeight = this.waveSimulation.lattice.height;
	
			height   = this.height;
			xSpacing = this.xSpacing;

			context = this.context;

			// Draw background
			context.fillStyle = '#fff';
			context.fillRect(0, 0, this.width, this.height);

			// Draw Grid
			context.beginPath();

			gridCellHeight = Math.round((this.height + 2) / 4);
			gridCellWidth  = Math.round((this.width  + 2) / 10);

			// Draw latitudinal grid lines
			for (j = 1; j <= 3; j++) {
				context.moveTo(0, gridCellHeight * j - 0.5);
				context.lineTo(this.width, gridCellHeight * j - 0.5);
			}

			// Draw longitudinal grid lines
			for (i = 1; i <= 9; i++) {
				context.moveTo(gridCellWidth * i - 0.5, 0);
				context.lineTo(gridCellWidth * i - 0.5, this.height);
			}

			context.lineWidth   = 1;
			context.strokeStyle = this.gridColor;
			context.stroke();

			// Set row to where the cross section line is closest to
			j = parseInt(this.waveSimulation.get('crossSectionY') * this.waveSimulation.heightRatio);
			if (j > latHeight - 1)
				j = latHeight - 1;
			
			/* TODO: when I feel like it, use bezier curves to smooth it out
			 *
			 * Maybe port this Catmull-Rom curve to bezier conversion:
			 *   http://schepers.cc/svg/path/catmullrom2bezier.js
			 * Article:
			 *   http://schepers.cc/getting-to-the-point
			 */
			points = this.points;

			for (i = 0; i < latWidth; i++) {
				points[i] = ((lat[i][j] - 2) / -4) * height;
			}

			context.beginPath();
			context.moveTo(-1, points[0]);

			for (i = 1; i < latWidth; i++) {
				//this.curve.lineTo(i * xSpacing, ((lat[i][j] - 2) / -4) * height);
				context.lineTo(i * xSpacing, points[i]);
				// cx = ((i + i + 1) * xSpacing) >> 1;
				// cy = (points[i] + points[i + 1]) >> 1;
				// context.quadraticCurveTo(cx, cy, i * xSpacing, points[i]);
			}

			//context.quadraticCurveTo((latWidth - 1) * xSpacing, points[latWidth - 1], latWidth - 1 * xSpacing, points[latWidth - 1]);

			context.lineWidth = 3;
			context.lineJoin = 'round';
			context.strokeStyle = this.lineColor;
			context.stroke();
		},

		startChanging: function() {
			if (this.$canvas) {
				this.changing = true;
				this.$canvas.addClass('changing');
			}
		},

		stopChanging: function() {
			if (this.$canvas) {
				this.changing = false;
				this.$canvas.removeClass('changing');
			}
		},

		show: function(event) {
			if (this.toggling)
				return;

			this.toggling = true;

			this.graphVisible = true;

			this.$el.addClass('open');

			this.$hideButton.show();
			this.$showButton.addClass('clicked');

			this.duration = this.$showButton.css('animation-duration');
			if (this.duration.indexOf('ms') !== -1)
				this.duration = parseInt(this.duration);
			else
				this.duration = parseFloat(this.duration) * 1000;
			
			var self = this;
			setTimeout(function(){
				self.$showButton.hide();
				self.$showButton.removeClass('clicked');
				self.resize();
				self.toggling = false;
			}, this.duration);
		},

		hide: function(event) {
			if (this.toggling)
				return;
			
			this.toggling = true;

			this.$el.removeClass('open');
			this.$showButton.show();
			this.$showButton.addClass('reenabled');
			this.$hideButton.hide();

			var self = this;
			setTimeout(function(){
				self.graphVisible = false;
				self.$showButton.removeClass('reenabled');
				self.toggling = false;
			}, this.duration);
		}
	});

	return GraphView;
});

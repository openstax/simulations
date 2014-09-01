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
	var lat,
		latWidth,
		height,
		xSpacing,
		points,
	    i,
	    j;
	    // cx,
	    // cy;

	var GraphView = Backbone.View.extend({

		template: _.template(html),

		initialize: function(options) {

			// Default values
			options = _.extend({
				title: 'Value',
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
				lineColor: '#000'
			}, options);

			// Save options
			if (options.waveSimulation)
				this.waveSimulation = options.waveSimulation;
			else
				throw 'GraphView requires a WaveSimulation model to render.';

			// Save graph information for rendering
			this.graphInfo = {
				title: options.title,
				x: options.x,
				y: options.y
			};

			this.lineThickness = options.lineThickness;
			this.lineColor = options.lineColor;

			// Bind events
			$(window).bind('resize', $.proxy(this.windowResized, this));
			//this.listenTo(this.waveSimulation, 'change:crossSectionY', ) don't need to listen because it renders every frame anyway

			// Ratio between pixels and cell width
			this.xSpacing = 1;

			this.points = [];
		},

		/**
		 * Renders content and canvas for heatmap
		 */
		render: function() {
			this.$el.empty();

			this.renderContainer();
			this.initRenderer();
			this.initGraphics();

			return this;
		},

		/**
		 * Renders html container
		 */
		renderContainer: function() {
			this.$el.html(this.template(this.graphInfo));
		},

		/**
		 * Initializes a renderer using the .heatmap-canvas canvas element
		 */
		initRenderer: function() {
			this.$canvas = this.$('.graph-canvas');

			this.context = this.$canvas[0].getContext('2d');

			// this.renderer = PIXI.autoDetectRenderer(
			// 	this.$canvas.width(),  // Width
			// 	this.$canvas.height(), // Height
			// 	this.$canvas[0],       // Canvas element
			// 	true,                  // Transparent background
			// 	true                   // Antialiasing
			// );
		},

		initGraphics: function() {
			// Create a stage to hold everything
			// this.stage = new PIXI.Stage(0xFFFFFF);

			// this.curve = new PIXI.Graphics();
			// this.curve.position.x = 0;

			// this.stage.addChild(this.curve);
		},

		/**
		 * Called on a window resize to resize the canvas
		 */
		windowResized: function(event) {
			this.resizeOnNextUpdate = true;
		},

		resize: function(event) {
			var width  = this.$canvas.width();
			var height = this.$canvas.height();
			//if (width != this.renderer.width || height != this.renderer.height) {
				this.width  = width;
				this.height = height;
				this.$canvas[0].width = this.$canvas.width();
				this.$canvas[0].height = this.$canvas.height();
				//this.curve.position.y = height / 2;
				this.xSpacing = width  / (this.waveSimulation.lattice.width - 1);
				this.resizeOnNextUpdate = false;
			//}
		},

		update: function(time, delta) {
			if (this.resizeOnNextUpdate)
				this.resize();

			this.drawCurve();

			// Render everything
			//this.renderer.render(this.stage);
		},

		drawCurve: function() {
			//this.curve.clear();

			lat        = this.waveSimulation.lattice.data;
			latWidth   = this.waveSimulation.lattice.width;
			j = parseInt(this.waveSimulation.get('crossSectionY') * this.waveSimulation.heightRatio);

			height     = this.height;
			xSpacing   = this.xSpacing;

			this.context.fillStyle = '#fff';
			this.context.fillRect(0, 0, this.width, this.height);

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

			//this.curve.lineStyle(2, 0x0D6A7C, 1);
			//this.curve.moveTo(0, ((lat[0][j] - 2) / -4) * height);
			this.context.beginPath();
			this.context.moveTo(-1, points[0]);

			for (i = 1; i < latWidth; i++) {
				//this.curve.lineTo(i * xSpacing, ((lat[i][j] - 2) / -4) * height);
				this.context.lineTo(i * xSpacing, points[i]);
				// cx = ((i + i + 1) * xSpacing) >> 1;
				// cy = (points[i] + points[i + 1]) >> 1;
				// this.context.quadraticCurveTo(cx, cy, i * xSpacing, points[i]);
			}

			//this.context.quadraticCurveTo((latWidth - 1) * xSpacing, points[latWidth - 1], latWidth - 1 * xSpacing, points[latWidth - 1]);

			this.context.lineWidth = 3;
			this.context.lineJoin = 'round';
			this.context.strokeStyle = this.lineColor;
			this.context.stroke();
			
		}
	});

	return GraphView;
});

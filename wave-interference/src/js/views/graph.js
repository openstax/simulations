define(function(require) {

	'use strict';

	var $        = require('jquery');
	var _        = require('underscore');
	var Backbone = require('backbone');
	var PIXI     = require('pixi');
	var html     = require('text!templates/graph.html');

	/*
	 * "Local" variables for functions to share and recycle
	 */
	var lat,
		latWidth,
		height,
		xSpacing,
	    i,
	    j;

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
				}
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

			// Bind events
			$(window).bind('resize', $.proxy(this.windowResized, this));
			//this.listenTo(this.waveSimulation, 'change:crossSectionY', ) don't need to listen because it renders every frame anyway

			// Ratio between pixels and cell width
			this.xSpacing = 1;
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

			this.renderer = PIXI.autoDetectRenderer(
				this.$canvas.width(),  // Width
				this.$canvas.height(), // Height
				this.$canvas[0],       // Canvas element
				true,                  // Transparent background
				true                   // Antialiasing
			);
		},

		initGraphics: function() {
			// Create a stage to hold everything
			this.stage = new PIXI.Stage(0xFFFFFF);

			this.curve = new PIXI.Graphics();
			this.curve.position.x = 0;

			this.stage.addChild(this.curve);
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
			if (width != this.renderer.width || height != this.renderer.height) {
				this.width  = width;
				this.height = height;
				this.renderer.resize(width, height);
				//this.curve.position.y = height / 2;
				this.xSpacing = width  / (this.waveSimulation.lattice.width - 1);
				this.resizeOnNextUpdate = false;
			}
		},

		update: function(time, delta) {
			if (this.resizeOnNextUpdate)
				this.resize();

			this.drawCurve();

			// Render everything
			this.renderer.render(this.stage);
		},

		drawCurve: function() {
			this.curve.clear();

			lat        = this.waveSimulation.lattice.data;
			latWidth   = this.waveSimulation.lattice.width;
			j = parseInt(this.waveSimulation.get('crossSectionY') * this.waveSimulation.heightRatio);

			height     = this.height;
			xSpacing   = this.xSpacing;

			this.curve.lineStyle(2, 0x0D6A7C, 1);
			this.curve.moveTo(0, ((lat[0][j] - 2) / -4) * height);

			for (i = 1; i < latWidth; i++) {
				this.curve.lineTo(i * xSpacing, ((lat[i][j] - 2) / -4) * height);
			}
			
		}
	});

	return GraphView;
});

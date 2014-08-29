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
		width,
		height,
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
				this.resizeOnNextUpdate = false;
			}
		},

		update: function(time, delta) {
			if (this.resizeOnNextUpdate)
				this.resize();

			

			// Render everything
			this.renderer.render(this.stage);
		},

		drawCurve: function() {
			
		}
	});

	return GraphView;
});

define([
	'jquery', 
	'underscore', 
	'backbone',
	'pixi',
	'text!templates/heatmap.html'
], function ($, _, Backbone, PIXI, html) {

	'use strict';

	/*
	 * "Local" variables for functions to share and recycle
	 */
	var lat,
		width,
		height,
	    i,
	    j,
	    particles;

	var HeatmapView = Backbone.View.extend({

		template: _.template(html),

		initialize: function(options) {

			// Default values
			options = _.extend({
				title: 'Top View',
				x: {
					start: 0,
					end: 100,
					step: 10,
					label: 'x (cm)'
				},
				y: {
					start: 0,
					end: 100,
					step: 10,
					label: 'y (cm)'
				}
			}, options);

			// Save options
			if (options.waveSimulation)
				this.waveSimulation   = options.waveSimulation;
			else
				throw 'HeatmapView requires a WaveSimulation model to render.';

			// Save graph information for rendering
			this.graphInfo = {
				title: options.title,
				x: options.x,
				y: options.y
			};

			// Bind events
			$(window).bind('resize', $.proxy(this.resize, this));
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
			this.$canvas = this.$('.heatmap-canvas');

			this.renderer = PIXI.autoDetectRenderer(
				this.$canvas.width(),  // Width
				this.$canvas.height(), // Height
				this.$canvas[0],       // Canvas element
				true,                  // Antialiasing
				false                  // Transparent background
			);
		},

		initGraphics: function() {
			// Create a stage to hold everything
			this.stage = new PIXI.Stage(0x000000);

			// Create a specialized container for rendering lots of particles
			this.spriteBatch = new PIXI.SpriteBatch();
			this.stage.addChild(this.spriteBatch);
		},

		initParticles: function() {
			this.particles = [];

			width  = this.waveSimulation.lattice.width;
			height = this.waveSimulation.lattice.height;

			var xSpacing = this.$canvas.width()  / (width - 1);
			var ySpacing = this.$canvas.height() / (height - 1);

			var texture = this.generateParticleTexture(Math.max(xSpacing, ySpacing) * 2);
			var particle;
			var row;

			for (i = 0; i < width; i++) {
				row = [];
				for (j = 0; j < height; j++) {
					// Create a particle representing this cell
					particle = new PIXI.Sprite(texture);

					particle.anchor.x = particle.anchor.y = 0.5;
					particle.tint = 0x21366B;

					particle.position.x = xSpacing * i;
					particle.position.y = ySpacing * (height - j - 1); // Reverse bottom to top with offset

					row.push(particle);
					this.spriteBatch.addChild(particle);
				}
				this.particles.push(row);
			}
		},

		generateParticleTexture: function(radius) {
			// Draw on a canvas and then use it as a texture for our particles
			var canvas = document.createElement('canvas');
			canvas.width  = radius * 2;
			canvas.height = radius * 2;

			var ctx = canvas.getContext('2d');

			var gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
			gradient.addColorStop(0, 'rgba(255,255,255,1)');
			gradient.addColorStop(1, 'rgba(255,255,255,0)');

			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, radius * 2, radius * 2);

			return new PIXI.Texture.fromCanvas(canvas);
		},

		updateParticles: function() {
			lat    = this.waveSimulation.lattice.data;
			width  = this.waveSimulation.lattice.width;
			height = this.waveSimulation.lattice.height;

			particles = this.particles;

			for (i = 0; i < width; i++) {
				for (j = 0; j < height; j++) {
					particles[i][j].alpha = this.alphaFromCellValue(lat[i][j]);
				}
			}
		},

		alphaFromCellValue: function(value) {
			value = (value + 1.0) / 2.0;
			if (value > 1)
				return 1;
			if (value < 0)
				return 0;
			return value;
		},

		/**
		 * Called on a window resize to resize the canvas
		 */
		resize: function(event) {
			this.renderer.resize(this.$canvas.width(), this.$canvas.height());
			this.initParticles();
		},

		update: function(time, delta) {
			// Update particles to match new lattice
			if (this.particles)
				this.updateParticles();

			// Render everything
			this.renderer.render(this.stage);
		}

	});

	return HeatmapView;
});

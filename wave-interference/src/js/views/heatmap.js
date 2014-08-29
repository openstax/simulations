define(function(require) {

	'use strict';

	var $        = require('jquery');
	var _        = require('underscore');
	var Backbone = require('backbone');
	var PIXI     = require('pixi');
	var html     = require('text!templates/heatmap.html');

	var BarrierView          = require('views/barrier');
	var SegmentPotentialView = require('views/segment-potential');

	/*
	 * "Local" variables for functions to share and recycle
	 */
	var lat,
		width,
		height,
	    i,
	    j,
	    particles,
	    brightness;

	var HeatmapView = Backbone.View.extend({

		template: _.template(html),

		tagName: 'figure',
		className: 'heatmap-container',

		events: {
			'slide .cross-section-slider' : 'moveCrossSection',
		},

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
				},
				brightness: 0.5
			}, options);

			// Save options
			if (options.waveSimulation)
				this.waveSimulation = options.waveSimulation;
			else
				throw 'HeatmapView requires a WaveSimulation model to render.';

			// Save graph information for rendering
			this.graphInfo = {
				title: options.title,
				x: options.x,
				y: options.y
			};

			// The alpha modifer for particles
			this.brightness = options.brightness;

			// To keep track of history so we can interpolate values
			this.previousLattice = this.waveSimulation.lattice.clone();

			// Bind events
			$(window).bind('resize', $.proxy(this.windowResized, this));

			this.xSpacing = 1;
			this.ySpacing = 1;
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

			this.$('.cross-section-slider').noUiSlider({
				start: (this.graphInfo.y.end - this.graphInfo.y.start) / 2,
				direction: 'rtl',
				orientation: 'vertical',
				behaviour: 'none',
				range: {
					min: this.graphInfo.y.start,
					max: this.graphInfo.y.end
				}
			}).find('.noUi-handle')
				.append('<div class="handle-left">')
				.append('<div class="handle-right">');
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
				true,                  // Transparent background
				true                   // Antialiasing
			);
		},

		initGraphics: function() {
			// Create a stage to hold everything
			this.stage = new PIXI.Stage(0x000000);

			// Create a specialized container for rendering lots of particles
			this.spriteBatch = new PIXI.SpriteBatch();
			this.stage.addChild(this.spriteBatch);

			this.initParticles();
			this.initComponents();
		},

		initComponents: function() {
			this.barrierView = new BarrierView({
				heatmapView: this,
				barrier: this.waveSimulation.barrier
			});
			this.barrierView.render();

			this.segmentPotentialView = new SegmentPotentialView({
				heatmapView: this,
				segment: this.waveSimulation.segment
			});
			this.segmentPotentialView.render();
			this.$('.potential-views').append(this.segmentPotentialView.el);
		},

		initParticles: function() {
			this.particles = [];

			width  = this.waveSimulation.lattice.width;
			height = this.waveSimulation.lattice.height;

			var texture = this.generateParticleTexture(0);
			var particle;
			var row;

			for (i = 0; i < width; i++) {
				row = [];
				for (j = 0; j < height; j++) {
					// Create a particle representing this cell
					particle = new PIXI.Sprite(texture);
					particle.anchor.x = particle.anchor.y = 0.5;

					row.push(particle);
					this.spriteBatch.addChild(particle);
				}
				this.particles.push(row);
			}
		},

		positionParticles: function() {
			width  = this.waveSimulation.lattice.width;
			height = this.waveSimulation.lattice.height;

			var xSpacing = this.$canvas.width()  / (width - 1);
			var ySpacing = this.$canvas.height() / (height - 1);

			var texture = this.generateParticleTexture(Math.max(xSpacing, ySpacing) * 2);
			var particle;

			for (i = 0; i < width; i++) {
				for (j = 0; j < height; j++) {
					particle = particles[i][j];
					particle.setTexture(texture);
					particle.position.x = xSpacing * i;
					particle.position.y = ySpacing * (height - j - 1); // Reverse bottom to top with offset
				}
			}

			this.xSpacing = xSpacing;
			this.ySpacing = ySpacing;
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

		updateParticles: function(interpolationFactor) {
			lat    = this.waveSimulation.lattice.data;
			width  = this.waveSimulation.lattice.width;
			height = this.waveSimulation.lattice.height;

			//prevLat = this.previousLattice.data;

			brightness = this.brightness;

			particles = this.particles;

			for (i = 0; i < width; i++) {
				for (j = 0; j < height; j++) {
					//interpolatedValue = prevLat[i][j] * (1 - interpolationFactor) + lat[i][j] * interpolationFactor;
					particles[i][j].alpha = this.alphaFromCellValue(lat[i][j]/*interpolationFactor*/) * brightness;
				}
			}

			//this.previousLattice.copy(this.waveSimulation.lattice);
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
				this.positionParticles();
				this.barrierView.update();
				this.resizeOnNextUpdate = false;
				this.trigger('resize');
			}
		},

		update: function(time, delta) {
			if (this.resizeOnNextUpdate)
				this.resize();

			// Update particles to match new lattice
			if (this.particles)
				this.updateParticles();

			this.barrierView.update(time, delta);
			this.segmentPotentialView.update(time, delta);

			// Render everything
			this.renderer.render(this.stage);
		},

		moveCrossSection: function(event) {
			this.waveSimulation.set('crossSectionY', $(event.target).val());
		}

	});

	return HeatmapView;
});

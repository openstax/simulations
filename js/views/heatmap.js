define(function(require) {

	'use strict';

	var $        = require('jquery');
	var _        = require('underscore');
	var Backbone = require('backbone');
	var PIXI     = require('pixi');
	var html     = require('text!templates/heatmap.html');

	var OscillatorView       = require('views/oscillator');
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

	/**
	 * HeatmapView is the main focus of the app.  It shows the values of the 2D lattice
	 *   on a graph with two axes (default x and y but dependent on the WaveSimulation).
	 *   Includes the containing panel, the (colored) heatmap itself, axis labels and 
	 *   measurements, and interactive components including the barriers, cross-section
	 *   slider, and (for now) oscillator controls.
	 *
	 */
	var HeatmapView = Backbone.View.extend({

		template: _.template(html),

		tagName: 'figure',
		className: 'heatmap-container',

		events: {
			'slide .cross-section-slider' : 'moveCrossSection',
			'set   .cross-section-slider' : 'stopCrossSection'
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
				brightness: 0.5,
				color: '#0D6A7C'
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

			// Background color for canvas
			this.color = options.color;

			// To keep track of history so we can interpolate values
			this.previousLattice = this.waveSimulation.lattice.clone();

			// Lists of views for updating
			this.segmentPotentialViews = [];
			this.oscillatorViews = [];

			// Bind events
			$(window).bind('resize', $.proxy(this.windowResized, this));

			// Cached calculations of lattice-canvas ratios
			this.xSpacing = 1;
			this.ySpacing = 1;

			// Listeners
			this.listenTo(this.waveSimulation, 'segment-potential-added', this.renderSegmentPotentialView);
			this.listenTo(this.waveSimulation, 'change:oscillatorCount', this.changeOscillatorCount);

			this.on('change:color', this.changeColor);
		},

		/**
		 * Renders content and canvas for heatmap
		 */
		render: function() {
			this.$el.empty();

			this.renderContainer();
			this.initRenderer();
			this.initGraphics();
			this.changeColor();

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
		 * Called after every component on the page has rendered to make sure
		 *   things like widths and heights and offsets are correct.
		 */
		postRender: function() {
			this.padding = parseInt(this.$canvas.css('top'));
			this.resize(true);
			this.barrierView.resize();
			for (i = 0; i < this.segmentPotentialViews.length; i++)
				this.segmentPotentialViews[i].resize();
			for (i = 0; i < this.oscillatorViews.length; i++)
				this.oscillatorViews[i].resize();
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

			this.width  = this.$canvas.width();
			this.height = this.$canvas.height();
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
			this.$('.potential-views').append(this.barrierView.el);
			this.barrierView.render();

			for (var i = 0; i < this.waveSimulation.oscillators.length; i++) {
				this.renderOscillatorView(this.waveSimulation.oscillators[i]);
			}
			this.changeOscillatorCount();
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

			// Just try it...it actually works on FireFox
			this.positionParticles();
		},

		positionParticles: function() {
			width  = this.waveSimulation.lattice.width;
			height = this.waveSimulation.lattice.height;

			var xSpacing = this.$canvas.width()  / (width - 1);
			var ySpacing = this.$canvas.height() / (height - 1);

			particles = this.particles;

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
			canvas.width  = radius * 2 || 1;
			canvas.height = radius * 2 || 1;

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

		resize: function(override) {
			var width  = this.$canvas.parent().innerWidth();
			var height = width;
			this.$canvas.width(width);
			this.$canvas.height(width);
			// var width  = this.$canvas.width();
			// var height = this.$canvas.height();
			this.width  = width;
			this.height = height;
			if (override || width != this.renderer.width || height != this.renderer.height) {
				this.renderer.resize(width, height);
				this.positionParticles();
				this.trigger('resized');
			}
			this.resizeOnNextUpdate = false;
		},

		update: function(time, delta) {
			if (this.resizeOnNextUpdate)
				this.resize();

			// Update particles to match new lattice
			if (this.particles)
				this.updateParticles();

			this.barrierView.update(time, delta);

			for (i = 0; i < this.segmentPotentialViews.length; i++)
				this.segmentPotentialViews[i].update(time, delta);

			for (i = 0; i < this.oscillatorViews.length; i++)
				this.oscillatorViews[i].update(time, delta);

			// Render everything
			this.renderer.render(this.stage);
		},

		moveCrossSection: function(event) {
			this.waveSimulation.set('crossSectionY', $(event.target).val());

			if (!this.crossSectionMoving) {
				this.crossSectionMoving = true;
				this.trigger('cross-section-slide-start');
			}
		},

		stopCrossSection: function(event) {
			this.crossSectionMoving = false;
			this.trigger('cross-section-slide-stop');
		},

		changeColor: function() {
			this.$canvas.css('background-color', this.color);
		},

		renderSegmentPotentialView: function(segmentPotential) {
			// Create a new view and render it
			var segmentPotentialView = new SegmentPotentialView({
				heatmapView: this,
				segment: segmentPotential
			});
			segmentPotentialView.render();

			this.addSegmentPotentialView(segmentPotentialView);
		},

		addSegmentPotentialView: function(segmentPotentialView) {
			// Append the rendered element
			this.$('.potential-views').append(segmentPotentialView.el);

			// Add it to our list for updating
			this.segmentPotentialViews.push(segmentPotentialView);

			// Remove it from the list if it gets removed
			this.listenTo(segmentPotentialView, 'remove', function() {
				this.segmentPotentialViews = _.filter(this.segmentPotentialViews, function(view) {
					return view.segment !== segmentPotential;
				});
			});

			// Make sure it renders the first time because it's set to render only when there are changes.
			segmentPotentialView.updateOnNextFrame = true;
		},

		renderOscillatorView: function(oscillator) {
			// Create a new view and render it
			var oscillatorView = new OscillatorView({
				heatmapView: this,
				oscillator: oscillator
			});
			oscillatorView.render();

			this.addOscillatorView(oscillatorView);
		},

		addOscillatorView: function(oscillatorView) {
			// Append the rendered element
			this.$('.oscillator-views').append(oscillatorView.el);

			// Add it to our list for updating
			this.oscillatorViews.push(oscillatorView);

			// Remove it from the list if it gets removed
			this.listenTo(oscillatorView, 'remove', function() {
				this.oscillatorViews = _.filter(this.oscillatorViews, function(view) {
					return view.oscillator !== oscillator;
				});
			});

			// Make sure it renders the first time because it's set to render only when there are changes.
			oscillatorView.updateOnNextFrame = true;
		},

		changeOscillatorCount: function() {
			var count = this.waveSimulation.get('oscillatorCount');

			for (i = 0; i < this.oscillatorViews.length; i++)
				this.oscillatorViews[i].hide();

			for (i = 0; i < count; i++)
				this.oscillatorViews[i].show();
		},

		isVisiblePoint: function(x, y) {
			return (x < this.waveSimulation.lattice.width - 1 && x >= 0 && y < this.waveSimulation.lattice.height - 1 && y >= 0);
		}

	});

	return HeatmapView;
});

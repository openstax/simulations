define(function(require) {

	'use strict';

	var _    = require('underscore');
	var PIXI = require('pixi.js');

	var Particle              = require('../../models/particle.js');
	var HeatmapView           = require('../heatmap.js');
	var SpeakerOscillatorView = require('../oscillator/speaker.js');

	/**
	 * Constants
	 */
	var PARTICLE_CELL_RATIO = 3;

	/*
	 * "Local" variables for functions to share and recycle
	 */
	var sprite,
	    particle,
	    particles,
	    sprites,
	    texture,
	    texture2,
	    xSpacing,
	    width,
	    height,
	    i,
	    j,
	    scale;

	/**
	 * SoundHeatmapView is the sound simulation version of the HeatmapView 
	 *   that uses different sub-views where necessary.
	 */
	var SoundHeatmapView = HeatmapView.extend({

		initialize: function(options) {
			// Default values
			options = _.extend({
				title: 'Pressure (Grayscale) &ndash; XY Plane',
				color: '#fff'
			}, options);

			HeatmapView.prototype.initialize.apply(this, [ options ]);

			this.accumulator = 0;
		},

		/**
		 * Overrides HeatmapView.renderOscillatorView so it can use the
		 *   SpeakerOscillatorView instead of the plain OscillatorView.
		 */
		renderOscillatorView: function(oscillator) {
			// Create a new view and render it
			var oscillatorView = new SpeakerOscillatorView({
				heatmapView: this,
				oscillator: oscillator
			});
			oscillatorView.render();

			this.addOscillatorView(oscillatorView);
		},

		/**
		 * A helper function to iterate through all the pressure particles
		 *   because they aren't a 1:1 ratio with the lattice cells.
		 */
		eachPressureParticle: function(callback) {
			width  = this.waveSimulation.lattice.width;
			height = this.waveSimulation.lattice.height;

			for (i = 0; i < width; i++) {
				for (j = 0; j < height; j++) {
					if (i % PARTICLE_CELL_RATIO === 0 && j % PARTICLE_CELL_RATIO === 0) {
						callback.apply(this, [ i, j ]);
					}
				}
			}
		},

		/**
		 * Need to have xSpacing and ySpacing defined before this will work
		 */
		initPressureParticles: function() {
			this.pressureParticles = [];
			this.pressureParticleSprites = [];

			this.pressureParticleSpriteBatch = new PIXI.SpriteBatch();
			this.stage.addChild(this.pressureParticleSpriteBatch);

			this.disablePressureParticles();

			texture  = PIXI.Texture.fromImage('img/phet/particle-blue.gif');
			texture2 = PIXI.Texture.fromImage('img/phet/particle-blue-marked.png');

			this.eachPressureParticle(function(i, j) {
				if (!this.pressureParticles[i]) {
					this.pressureParticles[i]       = [];
					this.pressureParticleSprites[i] = [];	
				}

				if (Math.random() < 0.05)
					sprite = new PIXI.Sprite(texture2);
				else
					sprite = new PIXI.Sprite(texture);
				sprite.anchor.x = sprite.anchor.y = 0.5;

				particle = new Particle({
					i: i,
					j: j,
					spacingBetweenCells: 1,
					lattice: this.waveSimulation.lattice
				});

				this.pressureParticles[i][j] = particle;
				this.pressureParticleSprites[i][j] = sprite;

				this.pressureParticleSpriteBatch.addChild(sprite);	
			});

			this.resizePressureParticles();
		},

		/**
		 * 
		 */
		resizePressureParticles: function() {
			height = this.waveSimulation.lattice.height;

			xSpacing = this.xSpacing;

			particles = this.pressureParticles;
			sprites   = this.pressureParticleSprites;

			scale = (2.5 * xSpacing) / 36;

			this.eachPressureParticle(function(i, j) {
				particles[i][j].resize(xSpacing);

				sprite = sprites[i][j];
				sprite.scale.x = scale;
				sprite.scale.y = scale;
				// TODO: change the scale?
			});	
		},

		/**
		 * 
		 */
		enablePressureParticles: function() {
			this.pressureParticleSpriteBatch.visible = true;
			this.spriteBatch.visible = false;

			this.$('.heatmap-title').html('Pressure (Particles) &ndash; XY Plane');
		},

		/**
		 * 
		 */
		disablePressureParticles: function() {
			this.spriteBatch.visible = true;
			this.pressureParticleSpriteBatch.visible = false;

			this.$('.heatmap-title').html(this.graphInfo.title);
		},

		/**
		 * Updates all the pressure particles.
		 */
		updatePressureParticles: function() {
			this.eachPressureParticle(this._updatePressureParticlesCallback);
		},

		/**
		 * This needs to be saved and reused instead of just
		 *   being an anonymous function because it gets run
		 *   every frame.
		 */
		_updatePressureParticlesCallback: function(i, j) {
			this.pressureParticles[i][j].update();

			this.pressureParticleSprites[i][j].position.x = this.pressureParticles[i][j].x;
			this.pressureParticleSprites[i][j].position.y = this.height - this.pressureParticles[i][j].y;
		},

		resizeGraphics: function() {
			if (this.pressureParticles)
				this.resizePressureParticles();

			HeatmapView.prototype.resizeGraphics.apply(this);
		},

		update: function(time, delta) {
			if (!this.waveSimulation.paused) {
				if (!this.pressureParticles) {
					this.initPressureParticles();
				}

				this.accumulator += delta;

				while (this.accumulator >= this.waveSimulation.timestep) {
					this.updatePressureParticles();
					
					this.accumulator -= this.waveSimulation.timestep;
				}
			}

			HeatmapView.prototype.update.apply(this, [time, delta]);
		}

	});

	return SoundHeatmapView;
});

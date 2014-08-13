define([
	'jquery', 
	'underscore', 
	'backbone',
	'pixi',

	'models/wave-simulation'
], function ($, _, Backbone, PIXI, WaveSimulation) {

	'use strict';

	var SimView = Backbone.View.extend({
		tagName: 'section',
		className: 'sim-view',

		events: {
			'resize window': 'resize'
		},

		initialize: function(options) {
			options = options || {};

			this.stage = new PIXI.Stage(0xFFFFFF);

			this.waveSimulation = new WaveSimulation({
				stage:      this.stage,
				damping:    options.simulationDamping,
				dimensions: options.simulationDimensions
			});

			this.delta;
			this.lastUpdated;
			this.paused = false;

			this.update = _.bind(this.update, this);
		},

		render: function() {
			this.$el.empty();

			this.renderContent();
			this.renderCanvas();

			return this;
		},

		renderContent: function() {},

		renderCanvas: function() {
			this.renderer = PIXI.autoDetectRenderer(null, null, null, false, true); // Turn on antialiasing

			var $renderer = $(this.renderer.view);
			$renderer.addClass('simulation-canvas');
			this.$el.prepend($renderer);
		},

		resize: function() {
			this.renderer.resize(this.$el.width(), this.$el.height());
		},

		get: function(key) {
			if (this.model)
				return this.model.get(key);
			else
				return null;
		},

		play: function() {
			this.paused = false;
			this.lastUpdated = null;
			//this.waveSimulation.play();
			requestAnimFrame(this.update);
		},

		pause: function() {
			//this.waveSimulation.pause();
			this.paused = true;
			this.lastUpdated = null;
		},

		step: function(milliseconds) {
			//this.waveSimulation.step(milliseconds);
		},

		reset: function() {
			this.waveSimulation.reset();
		},

		update: function(timestamp) {
			if (this.paused)
				return;

			if (this.lastUpdated)
				this.delta = timestamp - this.lastUpdated;
			else
				this.delta = 0;

			this.lastUpdated = timestamp;
			
			this.waveSimulation.update(this.delta);

			this.renderer.render(this.stage);
			requestAnimFrame(this.update);
		}

	});

	return SimView;
});

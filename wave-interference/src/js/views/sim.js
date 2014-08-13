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

			this.stage = new PIXI.Stage();

			this.waveSimulation = new WaveSimulation({
				stage:      this.stage,
				damping:    options.simulationDamping,
				dimensions: options.simulationDimensions
			});
		},

		render: function() {
			this.$el.empty();

			this.renderContent();
			this.renderCanvas();

			return this;
		},

		renderContent: function() {},

		renderCanvas: function() {
			this.renderer = PIXI.autoDetectRenderer();

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
			this.waveSimulation.play();
		},

		pause: function() {
			this.waveSimulation.pause();
		},

		step: function(milliseconds) {
			this.waveSimulation.step(milliseconds);
		},

		reset: function() {
			this.waveSimulation.reset();
		}

	});

	return SimView;
});

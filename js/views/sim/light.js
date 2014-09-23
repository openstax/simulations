define(function (require) {

	'use strict';

	var _ = require('underscore');

	var LightSimulation  = require('models/wave-sim/light');
	var LightHeatmapView = require('views/heatmap/light');
	var ScreenGraphView  = require('views/graph/screen');
	var SimView          = require('views/sim');

	var LightSimView = SimView.extend({

		initialize: function(options) {
			options = _.extend({
				heatmapBrightness: 0.5,
				title: 'Light',
				segmentPotentialName: 'Mirror'
			}, options);
			
			SimView.prototype.initialize.apply(this, [ options ]);

			this.initScreenGraphView();
		},

		/**
		 * Initializes the WaveSimulation.
		 */
		initWaveSimulation: function() {
			this.waveSimulation = new LightSimulation();
		},

		/**
		 * Initializes the HeatmapView.
		 */
		initHeatmapView: function() {
			this.heatmapView = new LightHeatmapView(this.getHeatmapViewOptions());
		},

		/**
		 * Uses the sim view's WaveSimulation instance to determine
		 *   appropriate options for initializing the GraphView and
		 *   returns them as an object.
		 */
		getGraphViewOptions: function() {
			return {
				title: 'Electric Field Across X-Axis',
				x: {
					start: 0,
					end: this.waveSimulation.get('dimensions').width,
					step: this.waveSimulation.get('dimensions').width / 10,
					label: 'x (' + this.waveSimulation.get('units').distance + ')',
					showNumbers: true
				},
				y: {
					start: -1,
					end: 1,
					step: 0.5,
					label: 'Electric Field',
					showNumbers: false
				},
				waveSimulation: this.waveSimulation,
				heatmapView: this.heatmapView
			};
		},

		/**
		 * Initializes the ScreenGraphView.
		 */
		initScreenGraphView: function() {
			this.screenGraphView = new ScreenGraphView({
				waveSimulation: this.waveSimulation,
				heatmapView: this.heatmapView
			});
		},

		/**
		 *
		 */
		render: function() {
			SimView.prototype.render.apply(this);

			this.renderScreenGraphView();
		},

		/**
		 * Renders the graph view
		 */
		renderScreenGraphView: function() {
			this.screenGraphView.render();
			this.heatmapView.$el.before(this.screenGraphView.el);
		},

		/**
		 *
		 */
		resetComponents: function() {
			SimView.prototype.resetComponents.apply(this);

			this.initScreenGraphView();
		},

	});

	return LightSimView;
});

define(function(require) {

	'use strict';

	var CrossSectionGraphView = require('./cross-section.js');

	var ArrowGraphic = require('../../graphics/arrow.js');

	var graphHtml    = require('../../../templates/graph.html');
	var controlsHtml = require('../../../templates/light-cross-section-graph-controls.html');

	/*
	 * "Local" variables for functions to share and recycle
	 */

	/**
	 * LightCrossSectionGraphView shows the values of a certain row of the
	 *   lattice in real time in the form of a curve.
	 */
	var LightCrossSectionGraphView = CrossSectionGraphView.extend({

		template: _.template(graphHtml + controlsHtml),

		className: 'light-cross-section-graph-view open initial',

		events: _.extend({}, CrossSectionGraphView.prototype.events, {
			'click .curve-check'   : 'curveCheckClicked',
			'click .vectors-check' : 'vectorsCheckClicked',
		}),

		initialize: function(options) {
			CrossSectionGraphView.prototype.initialize.apply(this, [options]);

			this.pointsPerVector = 3;

			this.showCurves  = true;
			this.showVectors = false;
		},

		/**
		 *
		 */
		initVectors: function() {
			this.vectors = [];

			var numVectors = Math.floor(this.waveSimulation.lattice.width / this.pointsPerVector);

			for (var i = 0; i < numVectors; i++) {
				this.vectors.push(new ArrowGraphic({
					context: this.context
				}));
			}
		},

		/**
		 * All the graphics initializing happens at the end of the 
		 *   render function, and we need to make sure the vectors
		 *   get initialized.
		 */
		render: function() {
			CrossSectionGraphView.prototype.render.apply(this);

			this.initVectors();
		},

		/**
		 * Renders html container
		 */
		renderContainer: function() {
			this.$el.html(this.template(this.graphInfo));

			this.$showButton = this.$('.graph-show-button');
			this.$hideButton = this.$('.graph-hide-button');
		},

		/**
		 * Draws arrows from the 0 line along the x-axis to the graph's y value
		 *   at a given x.
		 */
		drawVectors: function() {
			var y = this.height / 2;

			var point;
			for (var i = 1; i < this.vectors.length; i ++) {
				point = this.points[i * this.pointsPerVector];
				this.vectors[i].setTail(point.x, y);
				this.vectors[i].setHead(point.x, point.y);
				this.vectors[i].setLineColor(this.lineColor);
				this.vectors[i].draw();
			}
		},

		/**
		 * Responds to resize events and draws everything.
		 */
		update: function(time, delta) {
			if (this.resizeOnNextUpdate)
				this.resize();

			if (this.graphVisible) {
				this.drawGraph(time, delta);

				if (this.showCurves || this.showVectors)
					this.calculatePoints(time, delta);

				if (this.showCurves)
					this.drawCurve(time, delta);	
				if (this.showVectors)
					this.drawVectors(time, delta);
			}
		},

		/**
		 *
		 */
		curveCheckClicked: function(event) {
			this.showCurves = $(event.target).is(':checked');
		},

		/**
		 *
		 */
		vectorsCheckClicked: function(event) {
			this.showVectors = $(event.target).is(':checked');
		},

	});

	return LightCrossSectionGraphView;
});

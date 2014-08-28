define(function (require) {

	'use strict';

	var _    = require('underscore');
	var PIXI = require('pixi');

	var BarrierView = function(options) {

		// Default values
		options = _.extend({
			
		}, options);

		if (options.barrier)
			this.barrier = options.barrier;
		else
			throw 'BarrierView requires a Barrier model.';

		if (options.heatmapView)
			this.heatmapView = options.heatmapView;
		else
			throw 'BarrierView requires a HeatmapView to render.';

		this.listenTo(this.barrier, 'change', this.update);
	};

	var topBox,
	    middleBox,
	    bottomBox,
	    xSpacing,
	    ySpacing,
	    height;

	_.extend(BarrierView.prototype, Backbone.Events, {

		render: function() {
			this.graphics = new PIXI.Graphics();

			this.update();

			this.heatmapView.stage.addChild(this.graphics);
		},

		remove: function() {
			this.heatmapView.stage.removeChild(this.graphics);
		},

		update: function() {
			this.graphics.clear();

			this.graphics.beginFill(0xFFFFFF);
			this.graphics.lineStyle(2, 0x21366B, 1);

			height = this.heatmapView.waveSimulation.lattice.height;

			topBox    = this.barrier.topBox;
			middleBox = this.barrier.middleBox;
			bottomBox = this.barrier.bottomBox;

			xSpacing = this.heatmapView.xSpacing;
			ySpacing = this.heatmapView.ySpacing;

			this.graphics.drawRect(xSpacing * topBox.x,    ySpacing * topBox.y,    xSpacing * topBox.width,    ySpacing * topBox.height);
			this.graphics.drawRect(xSpacing * middleBox.x, ySpacing * middleBox.y, xSpacing * middleBox.width, ySpacing * middleBox.height);
			this.graphics.drawRect(xSpacing * bottomBox.x, ySpacing * bottomBox.y, xSpacing * bottomBox.width, ySpacing * bottomBox.height);
		}

	});

	return BarrierView;
});

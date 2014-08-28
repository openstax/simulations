define(function (require) {

	'use strict';

	var _        = require('underscore');
	var Backbone = require('backbone');
	var PIXI     = require('pixi');

	var SegmentPotentialView = function(options) {

		// Default values
		options = _.extend({
			
		}, options);

		if (options.segment)
			this.segment = options.segment;
		else
			throw 'SegmentPotentialView requires a Barrier model.';

		if (options.heatmapView)
			this.heatmapView = options.heatmapView;
		else
			throw 'SegmentPotentialView requires a HeatmapView to render.';
	};

	var segment,
	    xSpacing,
	    ySpacing,
	    halfYSpacing,
	    halfXSpacing,
	    padding,
	    height,
	    scaledNormal,
	    sX,
	    sY,
	    eX,
	    eY,
	    firstX,
	    firstY,
	    i,
	    j,
	    position;

	_.extend(SegmentPotentialView.prototype, Backbone.Events, {

		render: function() {
			this.renderBox();
			this.renderHandles();
			
			this.update(0, 0);
		},

		renderBox: function() {
			this.box = new PIXI.Graphics();
			this.box.alpha = 0;
			this.box.interactive = true;
			this.box.buttonMode = true;
			this.box.defaultCursor = 'move';
			this.heatmapView.stage.addChild(this.box);

			this.box.mousedown = this.box.touchstart = function(data){
				console.log('moving box');
			};

			
		},

		renderHandles: function() {
			this.startHandle = new PIXI.Graphics();
			this.endHandle   = new PIXI.Graphics();

			this.startHandle.hitArea = new PIXI.Circle(0, 0, (this.segment.thickness / 2) * this.heatmapView.xSpacing);
			this.endHandle.hitArea   = new PIXI.Circle(0, 0, (this.segment.thickness / 2) * this.heatmapView.xSpacing);

			this.startHandle.interactive   = true;
			this.startHandle.buttonMode    = true;
			this.startHandle.defaultCursor = 'move';

			this.endHandle.interactive   = true;
			this.endHandle.buttonMode    = true;
			this.endHandle.defaultCursor = 'move';

			var handleDown = _.bind(this.handleDown, this);

			this.startHandle.mousedown  = handleDown;
			this.startHandle.touchstart = handleDown;
			this.endHandle.mousedown    = handleDown;
			this.endHandle.touchstart   = handleDown;

			var handleMove = _.bind(this.handleMove, this);

			this.startHandle.mousemove = handleMove;
			this.startHandle.touchmove = handleMove;
			this.endHandle.mousemove   = handleMove;
			this.endHandle.touchmove   = handleMove;
				
			var handleUp = _.bind(this.handleUp, this);

			this.startHandle.mouseup         = handleUp;
			this.startHandle.mouseupoutside  = handleUp;
			this.startHandle.touchend        = handleUp;
			this.startHandle.touchendoutside = handleUp;
			this.endHandle.mouseup           = handleUp;
			this.endHandle.mouseupoutside    = handleUp;
			this.endHandle.touchend          = handleUp;
			this.endHandle.touchendoutside   = handleUp;
				

			this.heatmapView.stage.addChild(this.startHandle);
			this.heatmapView.stage.addChild(this.endHandle);
		},

		remove: function() {
			this.heatmapView.stage.removeChild(this.box);
			this.heatmapView.stage.removeChild(this.startHandle);
			this.heatmapView.stage.removeChild(this.endHandle);
		},

		handleDown: function(data) {
			data.originalEvent.preventDefault();

			if (data.target == this.startHandle)
				this.draggingStart = true;
			else
				this.draggingEnd = true;
		},

		handleMove: function(data) {
			if (this.draggingStart || this.draggingEnd) {
				xSpacing = this.heatmapView.xSpacing;
				ySpacing = this.heatmapView.ySpacing;

				position = data.getLocalPosition(this.heatmapView.stage);
				position.x = (position.x - (xSpacing / 2.0)) / xSpacing;
				position.y = this.heatmapView.waveSimulation.lattice.height - (position.y - (ySpacing / 2.0)) / ySpacing;

				if (this.draggingStart)
					this.segment.start = position;
				if (this.draggingEnd)
					this.segment.end = position;
			}
		},

		handleUp: function(data) {
			this.draggingStart = false;
			this.draggingEnd   = false;
		},

		update: function(time, delta) {
			segment = this.segment;

			if (!segment.enabled)
				return;

				this.box.clear();

			if (this.box.alpha < 1)
				this.box.alpha += delta * 0.005;

			height = this.heatmapView.waveSimulation.lattice.height;

			xSpacing = this.heatmapView.xSpacing;
			ySpacing = this.heatmapView.ySpacing;
			halfYSpacing = ySpacing / 2.0;
			halfXSpacing = xSpacing / 2.0;

			padding = (segment.thickness / 2.0);

			/*
			 * I'm using the normal vector and thickness to paint lines
			 *   around the four corners of the rectangle that surrounds
			 *   at the appropriate thickness.
			 * Each offset vector is the sum of two vectors that are
			 *   derrived from the scaled normal vector.
			 */

			scaledNormal = segment.getNormalUnitVector();
			scaledNormal.x *= padding * xSpacing;
			scaledNormal.y *= padding * ySpacing * -1;
			i = scaledNormal.x;
			j = scaledNormal.y;

			sX = segment.start.x * xSpacing - halfXSpacing;
			sY = (height - segment.start.y) * ySpacing - halfYSpacing;
			eX = segment.end.x * xSpacing - halfXSpacing;
			eY = (height - segment.end.y) * ySpacing - halfYSpacing;

			firstX = Math.round(sX + i + j);
			firstY = Math.round(sY - i + j);

			this.box.beginFill(0xFFFFFF, 0.5);
			this.box.lineStyle(2, 0xFFFFFF, 1);

			this.box.moveTo(firstX, firstY);
			this.box.lineTo(sX + j - i, sY - i - j);
			this.box.lineTo(eX - j - i, eY + i - j);
			this.box.lineTo(eX - j + i, eY + i + j);
			this.box.lineTo(firstX, firstY);	

			this.box.endFill();

			this.startHandle.position.x = sX;
			this.startHandle.position.y = sY;
			this.endHandle.position.x   = eX;
			this.endHandle.position.y   = eY;

			this.startHandle.hitArea.radius = padding * xSpacing;
			this.endHandle.hitArea.radius   = padding * xSpacing;

			this.startHandle.clear();
			this.handleStyle(this.startHandle);
			if (this.draggingStart)
				this.startHandle.drawCircle(0, 0, parseInt(padding * xSpacing - 1 + (xSpacing * 0.4)));
			else
				this.startHandle.drawCircle(0, 0, parseInt(padding * xSpacing - 1));
			this.startHandle.endFill();

			this.endHandle.clear();
			this.handleStyle(this.endHandle);
			if (this.draggingEnd)
				this.endHandle.drawCircle(0, 0, parseInt(padding * xSpacing - 1 + (xSpacing * 0.4)));
			else
				this.endHandle.drawCircle(0, 0, parseInt(padding * xSpacing - 1));
			this.endHandle.endFill();
		},

		handleStyle: function(handle) {
			handle.beginFill(0x21366B, 1);
			handle.lineStyle(1, 0x21366B, 0.5);
		},

	});

	return SegmentPotentialView;
});

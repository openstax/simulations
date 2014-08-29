define(function (require) {

	'use strict';

	var _    = require('underscore');
	var PIXI = require('pixi');

	var BarrierView = function(options) {

		if (options.barrier)
			this.barrier = options.barrier;
		else
			throw 'BarrierView requires a Barrier model.';

		if (options.heatmapView)
			this.heatmapView = options.heatmapView;
		else
			throw 'BarrierView requires a HeatmapView to render.';
	};

	var topBox,
	    middleBox,
	    bottomBox,
	    xSpacing,
	    ySpacing,
	    halfXSpacing,
	    halfYSpacing;

	_.extend(BarrierView.prototype, {

		render: function() {
			this.graphics = new PIXI.Graphics();
			this.graphics.alpha = 0;

			this.graphics.mousedown = this.graphics.touchstart = function(data){
				console.log('moving barriers');
			};

			this.update(0, 0);

			this.heatmapView.stage.addChild(this.graphics);
		},

		remove: function() {
			this.heatmapView.stage.removeChild(this.graphics);
		},

		update: function(time, delta) {

			if (this.barrier.style > 0) {
				this.graphics.clear();

				if (this.graphics.alpha < 1)
					this.graphics.alpha += delta * 0.005;

				this.graphics.beginFill(0xFFFFFF, 0.5);
				this.graphics.lineStyle(2, 0xFFFFFF, 0.9);
				// this.graphics.beginFill(0xFFFFFF, 0.5);
				// this.graphics.lineStyle(2, 0x21366B, 1);

				topBox    = this.barrier.topBox;
				middleBox = this.barrier.middleBox;
				bottomBox = this.barrier.bottomBox;

				xSpacing = this.heatmapView.xSpacing;
				ySpacing = this.heatmapView.ySpacing;
				halfXSpacing = xSpacing / 2.0;
				halfYSpacing = ySpacing / 2.0;

				this.graphics.drawRect(xSpacing * topBox.x    - halfXSpacing, ySpacing * topBox.y    - halfYSpacing, xSpacing * topBox.width    - 2, ySpacing * topBox.height + halfYSpacing);
				this.graphics.drawRect(xSpacing * middleBox.x - halfXSpacing, ySpacing * middleBox.y - halfYSpacing, xSpacing * middleBox.width - 2, ySpacing * middleBox.height);
				this.graphics.drawRect(xSpacing * bottomBox.x - halfXSpacing, ySpacing * bottomBox.y - halfYSpacing, xSpacing * bottomBox.width - 2, ySpacing * bottomBox.height);	
			}
			else if (this.graphics.alpha > 0){
				this.graphics.alpha -= delta * 0.005;

				if (this.graphics.alpha < 0)
					this.graphics.alpha = 0;
			}

		}

	});

	return BarrierView;
});

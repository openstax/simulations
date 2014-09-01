
define(function (require) {

	'use strict';

	var $ = require('jquery');
	var _ = require('underscore');

	var HeatmapDraggable = require('views/heatmap-draggable');

	var html = require('text!templates/barrier.html');

	var xSpacing,
	    ySpacing,
	    halfYSpacing,
	    halfXSpacing,
	    //padding,
	    //height,
	    //i,
	    //j,
	    x,
	    dx,
	    dy,
	    topBox,
	    middleBox,
	    bottomBox;

	var SegmentPotentialView = HeatmapDraggable.extend({

		template: _.template(html),

		tagName: 'div',
		className: 'barrier-view',

		events: {
			'mousedown  .width-handle' : 'widthHandleDown',
			'touchstart .width-handle' : 'widthHandleDown',
			'mousedown' : 'barrierDown',
			'touchstart': 'barrierDown'
		},

		initialize: function(options) {
			HeatmapDraggable.prototype.initialize.apply(this, [options]);

			if (options.barrier)
				this.barrier = options.barrier;
			else
				throw 'BarrierView requires a Barrier model.';

			this.listenTo(this.waveSimulation, 'change:barrierStyle change:barrierX change:barrierSlitWidth change:barrierSlitSeparation', function(){
				this.updateOnNextFrame = true;
			});
		},

		render: function() {
			this.renderBoxes();
			this.bindDragEvents();
			this.resize();
			this.update(0, 0);
		},

		renderBoxes: function() {
			this.$el.html(this.template());

			this.$topBox = this.$('.barrier-top');
			this.$middleBox = this.$('.barrier-middle');
			this.$bottomBox = this.$('.barrier-bottom');
		},

		widthHandleDown: function(event) {
			event.preventDefault();

			if ($(event.target).hasClass('width-handle-top'))
				this.draggingTopHandle = true;
			else
				this.draggingBottomHandle = true;

			this.dragX = event.pageX;
			this.dragY = event.pageY;

			this.$el.addClass('dragging-handles');
		},

		barrierDown: function(event) {
			if ($(event.target).hasClass('barrier-box')) {
				event.preventDefault();
				this.$el.addClass('dragging-barrier');
				this.draggingBarrier = true;
				this.dragX = event.pageX;
			}
		},

		drag: function(event) {
			if (this.draggingTopHandle || this.draggingBottomHandle) {

				this.fixTouchEvents(event);

				dx = this.toLatticeXScale(event.pageX - this.dragX);
				dy = this.toLatticeYScale(event.pageY - this.dragY);

				// Change stuff

				this.dragX = event.pageX;
				this.dragY = event.pageY;

				this.updateOnNextFrame = true;
			}
			else if (this.draggingBarrier) {

				this.fixTouchEvents(event);

				dx = this.toLatticeXScale(event.pageX - this.dragX);

				if (!this.wayOutOfBounds(event.pageX, event.pageY)) {
					topBox    = this.barrier.topBox;
					middleBox = this.barrier.middleBox;
					bottomBox = this.barrier.bottomBox;

					if (this.waveSimulation.isValidPoint(topBox.x + dx, middleBox.y)) {

						x = topBox.x + dx;

						// topBox.x    = x;
						// middleBox.x = x;
						// bottomBox.x = x;

						this.waveSimulation.set('barrierX', x / this.waveSimulation.widthRatio);
					}
				}
				else
					this.dragEnd();

				this.dragX = event.pageX;

				this.updateOnNextFrame = true;
			}
		},

		dragEnd: function(event) {
			if (this.draggingTopHandle || this.draggingBottomHandle) {
				this.draggingTopHandle    = false;
				this.draggingBottomHandle = false;
				this.$el.removeClass('dragging-handles');
			}
			else if (this.draggingBarrier) {
				this.draggingBarrier = false;
				this.$el.removeClass('dragging-barrier');
			}
		},

		update: function(time, delta) {
			// If there aren't any changes, don't do anything.
			if (!this.updateOnNextFrame)
				return;

			this.updateOnNextFrame = false;

			if (this.barrier.style > 0) {
				topBox    = this.barrier.topBox;
				middleBox = this.barrier.middleBox;
				bottomBox = this.barrier.bottomBox;

				xSpacing = this.heatmapView.xSpacing;
				ySpacing = this.heatmapView.ySpacing;
				halfXSpacing = xSpacing / 2.0;
				halfYSpacing = ySpacing / 2.0;

				// The width should be the same size on all of them, so which one is arbitrary.
				this.$el.css({
					width: xSpacing * topBox.width,
					left:  xSpacing * topBox.x/* - halfXSpacing*/,
					display: 'block'
				});

				this.$topBox.height(   ySpacing * topBox.height);
				this.$bottomBox.height(ySpacing * bottomBox.height);

				if (this.barrier.style == 2) {
					this.$middleBox.css({
						'height': ySpacing * middleBox.height + 'px',
						'margin-top': -(halfYSpacing * middleBox.height) + 'px',
						'display': 'block'
					});
				}
				else
					this.$middleBox.hide();
			}
			else {
				this.$el.hide();
			}
		}

	});

	return SegmentPotentialView;
});


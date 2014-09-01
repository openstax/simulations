
define(function (require) {

	'use strict';

	var $        = require('jquery');
	var _        = require('underscore');
	var Backbone = require('backbone');
	var html     = require('text!templates/barrier.html');

	var xSpacing,
	    ySpacing,
	    halfYSpacing,
	    halfXSpacing,
	    //padding,
	    //height,
	    //i,
	    //j,
	    dx,
	    dy,
	    topBox,
	    middleBox,
	    bottomBox;

	var SegmentPotentialView = Backbone.View.extend({

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

			if (options.barrier)
				this.barrier = options.barrier;
			else
				throw 'BarrierView requires a Barrier model.';

			if (options.heatmapView)
				this.heatmapView = options.heatmapView;
			else
				throw 'BarrierView requires a HeatmapView to render.';

			this.waveSimulation = this.heatmapView.waveSimulation;

			this.listenTo(this.heatmapView, 'resize', this.resize);
			this.listenTo(this.waveSimulation, 'change:barrierStyle change:barrierX change:barrierSlitWidth change:barrierSlitSeparation', function(){
				this.updateOnNextFrame = true;
			});
		},

		render: function() {
			this.renderBoxes();

			this.resize();
			
			this.update(0, 0);
		},

		renderBoxes: function() {
			this.$el.html(this.template());

			this.$topBox = this.$('.barrier-top');
			this.$middleBox = this.$('.barrier-middle');
			this.$bottomBox = this.$('.barrier-bottom');

			this.$dragFrame = this.heatmapView.$('.potential-views');
			this.$dragFrame
				.bind('mousemove touchmove', _.bind(this.drag, this))
				.bind('mouseup touchend',    _.bind(this.dragEnd, this));

			this.heatmapView.$('.cross-section-slider')
				.bind('mousemove touchmove', _.bind(this.drag, this))
				.bind('mouseup touchend', _.bind(this.dragEnd, this));
		},

		resize: function(){
			this.updateOnNextFrame = true;
			this.dragOffset = this.$dragFrame.offset();
			this.dragBounds = {
				width:  this.$dragFrame.width(),
				height: this.$dragFrame.height()
			};
		},

		handleDown: function(event) {
			event.preventDefault();

			if ($(event.target).index() === 0)
				this.draggingStart = true;
			else
				this.draggingEnd = true;

			this.dragX = event.pageX;
			this.dragY = event.pageY;

			$(event.target).addClass('active');
		},

		boxDown: function(event) {
			if (event.target === this.el) {
				event.preventDefault();
				this.$el.addClass('active');
				this.draggingBox = true;
				this.dragX = event.pageX;
				this.dragY = event.pageY;
			}
		},

		drag: function(event) {
			if (this.draggingStart || this.draggingEnd) {

				dx = event.pageX - this.dragX;
				dy = event.pageY - this.dragY;

				// Convert to lattice space
				dx = dx / this.heatmapView.xSpacing;
				dy = dy / this.heatmapView.ySpacing * -1;

				// Change stuff

				this.dragX = event.pageX;
				this.dragY = event.pageY;

				this.updateOnNextFrame = true;
			}
			else if (this.draggingBox) {

				// if (this.outOfBounds(event.pageX, event.pageY))
				// 	this.dragEnd();

				dx = event.pageX - this.dragX;
				dy = event.pageY - this.dragY;

				// Convert to lattice space
				dx = dx / this.heatmapView.xSpacing;
				dy = dy / this.heatmapView.ySpacing * -1;

				// Change stuff

				this.dragX = event.pageX;
				this.dragY = event.pageY;

				this.updateOnNextFrame = true;
			}
		},

		dragEnd: function(event) {
			// if (this.draggingStart || this.draggingEnd) {
			// 	this.draggingStart = false;
			// 	this.draggingEnd   = false;
			// 	this.$('.segment-handle').removeClass('active');
			// }
			// else if (this.draggingBox) {
			// 	this.draggingBox = false;
			// 	this.$el.removeClass('active');
			// }
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
		},

		outOfBounds: function(x, y) {
			return (x > this.dragOffset.left + this.dragBounds.width  || x < this.dragOffset.left ||
				    y > this.dragOffset.top  + this.dragBounds.height || y < this.dragOffset.top);
		}

	});

	return SegmentPotentialView;
});


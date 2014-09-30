define(function (require) {

	'use strict';

	var $ = require('jquery');
	var _ = require('underscore');

	var SimDraggable      = require('views/sim-draggable');
	var DetectorGraphView = require('views/graph/detector');

	var Utils = require('utils/utils');
	var html  = require('text!templates/detector.html');

	var angle,
	    lineLength,
	    dx,
	    dy,
	    translate,
	    rotate,
	    transform;

	var DetectorView = SimDraggable.extend({

		template: _.template(html),

		tagName: 'div',
		className: 'detector-view',

		events: {
			'mousedown  .detector-sampler' : 'samplerDown',
			'touchstart .detector-sampler' : 'samplerDown',
			'mousedown  .detector-visualizer' : 'visualizerDown',
			'touchstart .detector-visualizer' : 'visualizerDown',

			'click .detector-close' : 'close'
		},

		initialize: function(options) {
			options = _.extend({
				sampler: {
					x: 410,
					y: 370
				},
				visualizer: {
					x: 0,
					y: 300
				},
				yLabel: 'Water Level'
			}, options);

			SimDraggable.prototype.initialize.apply(this, [options]);

			if (options.heatmapView)
				this.heatmapView = options.heatmapView;
			else
				throw 'DetectorView requires a HeatmapView to render.';

			this.sampler    = options.sampler;
			this.visualizer = options.visualizer;
			this.yLabel     = options.yLabel;
		},

		resize: function(){
			SimDraggable.prototype.resize.apply(this);

			var $connectorAnchor = this.$('.detector-connector-anchor');
			var position = $connectorAnchor.position();

			this.relativeConnectorAnchorPosition = {
				x: position.left + ($connectorAnchor.width() / 2),
				y: position.top
			};

			this.samplerRadius = this.$('.detector-sampler').outerWidth() / 2;

			this.offset = this.$el.offset();

			this.calculateLatticePoint();

			this.visualizer.width  = this.$visualizer.width();
			this.visualizer.height = this.$visualizer.height();
			this.sampler.width  = this.$sampler.width();
			this.sampler.height = this.$sampler.height();
		},

		render: function() {
			this.renderContent();
			this.bindDragEvents();
		},

		renderContent: function() {
			this.$el.html(this.template());

			this.$sampler    = this.$('.detector-sampler');
			this.$connector  = this.$('.detector-connector');
			this.$visualizer = this.$('.detector-visualizer');

			this.graphView = new DetectorGraphView({
				waveSimulation: this.waveSimulation,
				yLabel: this.yLabel
			});
			this.graphView.render();
			this.$('#detector-graph-placeholder').replaceWith(this.graphView.el);
		},

		postRender: function() {
			this.resize();
			this.graphView.postRender();
		},

		samplerDown: function(event) {
			event.preventDefault();

			this.draggingSampler = true;

			this.fixTouchEvents(event);

			this.dragX = event.pageX;
			this.dragY = event.pageY;

			$(event.target).addClass('dragging');
		},

		visualizerDown: function(event) {
			event.preventDefault();

			this.$visualizer.addClass('dragging');

			this.draggingVisualizer = true;

			this.fixTouchEvents(event);

			this.dragX = event.pageX;
			this.dragY = event.pageY;
		},

		drag: function(event) {
			if (this.draggingSampler) {

				this.fixTouchEvents(event);

				dx = event.pageX - this.dragX;
				dy = event.pageY - this.dragY;

				if (this.draggingSampler && !this.outOfBounds(this.sampler.x + dx, this.sampler.y + dy, this.sampler)) {
					this.sampler.x += dx;
					this.sampler.y += dy;

					this.calculateLatticePoint();
				}

				this.dragX = event.pageX;
				this.dragY = event.pageY;

				this.updateOnNextFrame = true;
			}
			else if (this.draggingVisualizer) {

				this.fixTouchEvents(event);

				dx = event.pageX - this.dragX;
				dy = event.pageY - this.dragY;

				if (!this.outOfBounds(this.visualizer.x + dx, this.visualizer.y + dy, this.visualizer)) {
					this.visualizer.x += dx;
					this.visualizer.y += dy;
				}

				this.dragX = event.pageX;
				this.dragY = event.pageY;

				this.updateOnNextFrame = true;
			}
		},

		dragEnd: function(event) {
			if (this.draggingSampler) {
				this.draggingSampler = false;
				this.$sampler.removeClass('dragging');
			}
			else if (this.draggingVisualizer) {
				this.draggingVisualizer = false;
				this.$visualizer.removeClass('dragging');
			}
		},

		close: function(event) {
			this.trigger('remove');
			this.remove();
		},

		calculateLatticePoint: function() {
			var point = this.heatmapView.offsetToPoint(
				this.sampler.y + this.offset.top, 
				this.sampler.x + this.offset.left
			);

			this.graphView.latticePoint = point;
		},

		positionComponents: function() {
			angle = -Utils.angleFromLine(
				this.sampler.x, 
				this.sampler.y, 
				this.visualizer.x + this.relativeConnectorAnchorPosition.x, 
				this.visualizer.y + this.relativeConnectorAnchorPosition.y
			);

			lineLength = Utils.lineLength(
				this.sampler.x, 
				this.sampler.y, 
				this.visualizer.x + this.relativeConnectorAnchorPosition.x, 
				this.visualizer.y + this.relativeConnectorAnchorPosition.y
			);

			lineLength -= this.samplerRadius;

			// Move to center of sampler and rotate to point at anchor
			translate = 'translateX(' + this.sampler.x + 'px) translateY(' + this.sampler.y + 'px)';
			rotate    = 'rotateZ(' + (-angle) + 'deg)';
			transform = translate + ' ' + rotate + ' translateX(' + this.samplerRadius + 'px)';

			this.$connector.css({
				width: lineLength,

				'-webkit-transform': transform,
				'-ms-transform':     transform,
				'-o-transform':      transform,
				'transform':         transform
			});

			// Move the sampler so it's centered on the sample point
			translate = 'translateX(' + this.sampler.x + 'px) translateY(' + this.sampler.y + 'px)';
			
			this.$sampler.css({
				'-webkit-transform': translate,
				'-ms-transform':     translate,
				'-o-transform':      translate,
				'transform':         translate
			});

			this.$visualizer.css({
				left: this.visualizer.x + 'px',
				top:  this.visualizer.y + 'px'
			});
		},

		update: function(time, delta) {
			
			if (this.updateOnNextFrame) {
				this.updateOnNextFrame = false;

				this.positionComponents();
			}

			this.graphView.update(time, delta);
		}
	});

	return DetectorView;
});

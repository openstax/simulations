define(function (require) {

	'use strict';

	var $ = require('jquery');
	var _ = require('underscore');

	var SimDraggable      = require('views/sim-draggable');
	var DetectorGraphView = require('views/graph/detector');

	var Utils = require('utils/utils');
	var html  = require('text!templates/detector.html');

	var padding,
	    height,
	    angle,
	    lineLength,
	    startX,
	    startY,
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
			'touchstart .detector-visualizer' : 'visualizerDown'
		},

		initialize: function(options) {
			options = _.extend({
				sampler: {
					x: 30,
					y: 30
				},
				visualizer: {
					x: 120,
					y: 30
				}
			}, options);

			SimDraggable.prototype.initialize.apply(this, [options]);

			if (options.heatmapView)
				this.heatmapView = options.heatmapView;
			else
				throw 'DetectorView requires a HeatmapView to render.';

			this.sampler    = options.sampler;
			this.visualizer = options.visualizer;
		},

		resize: function(){
			SimDraggable.prototype.resize.apply(this);

			var $connectorAnchor = this.$('.detector-connector-anchor');
			var position = $connectorAnchor.position();

			this.relativeConnectorAnchorPosition = {
				x: position.left + ($connectorAnchor.width() / 2),
				y: position.top  + ($connectorAnchor.height() / 2)
			};

			this.samplerRadius = this.$('.detector-sampler').width() / 2;
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
			if (event.target === this.$visualizer[0]) {
				event.preventDefault();

				this.$visualizer.addClass('dragging');

				this.draggingVisualizer = true;

				this.fixTouchEvents(event);

				this.dragX = event.pageX;
				this.dragY = event.pageY;
			}
		},

		drag: function(event) {
			if (this.draggingSampler) {

				this.fixTouchEvents(event);

				dx = event.pageX - this.dragX;
				dy = event.pageY - this.dragY;

				if (this.draggingSampler && !this.outOfBounds(this.sampler.x + dx, this.sampler.y + dy)) {
					this.sampler.x += dx;
					this.sampler.y += dy;
				}

				this.dragX = event.pageX;
				this.dragY = event.pageY;

				this.updateOnNextFrame = true;
			}
			else if (this.draggingVisualizer) {

				this.fixTouchEvents(event);

				dx = event.pageX - this.dragX;
				dy = event.pageY - this.dragY;

				if (!this.outOfBounds(this.visualizer.x + dx, this.visualizer.y + dy)) {
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

		labelClicked: function(event) {
			Utils.selectText(event.target);
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
			transform = translate + ' ' + rotate;

			this.$connector.css({
				width: lineLength,

				'-webkit-transform': transform,
				'-ms-transform':     transform,
				'-o-transform':      transform,
				'transform':         transform,
			});

			// Move the sampler so it's centered on the sample point
			translate = 'translateX(' + (this.sampler.x - this.samplerRadius) + 'px) translateY(' + (this.sampler.y - this.samplerRadius) + 'px)';
			
			this.$sampler.css({
				left: (this.sampler.x - this.samplerRadius) + 'px',
				top: (this.sampler.y - this.samplerRadius) + 'px'
				// '-webkit-transform': translate,
				// '-ms-transform':     translate,
				// '-o-transform':      translate,
				// 'transform':         translate,
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

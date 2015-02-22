define(function (require) {

	'use strict';

	var _ = require('underscore');

	// DEEP EXTEND...you may need to add this line in your sim's config if you are trying to use this:
	// underscoreDeepExtend: '../../bower_components/underscore-deep-extend/index',
	var underscoreDeepExtend = require('underscoreDeepExtend');
	_.mixin({deepExtend: underscoreDeepExtend(_)});

	var selectText = require('../dom/select-text');
	var Draggable = require('./draggable');

	var html  = require('text!./ruler.html');

	require('less!./ruler');

	var dx,
		dy,
		translate;

	var RulerView = Draggable.extend({

		template: _.template(html),

		tagName: 'div',
		className: 'ruler-view',

		events: {
			'mousedown' : 'panelDown',
			'touchstart': 'panelDown'
		},

		initialize: function(options) {
			options = _.deepExtend({
				position: {
					x: 30,
					y: 30
				},
				captureOnBody: false,
				mouseLeaveCancels: true,

				units : 'cm',
				pxPerUnit : 5,
				orientation : 'vertical',
				rulerWidth: 10,
				rulerMeasureUnits : 100,
				ticks : [{
					type: 'full',
					at : 10
				},{
					type: 'mid',
					at : 5
				},{
					type: 'unit',
					at : 1
				}]
			}, options);

			Draggable.prototype.initialize.apply(this, [options]);

			this.position = options.position;
			this.orientation = options.orientation;
			this.pxPerUnit = options.pxPerUnit;
			this.rulerWidth = options.rulerWidth;
			this.units = options.units;
			this.rulerMeasureUnits = options.rulerMeasureUnits;

			// sort ticks from greatest to least
			this.ticks = _.sortBy(options.ticks, function(tick){
				return -1 * tick.at;
			});
		},

		render: function() {
			this.renderViewModel();
			this.renderRuler();
			this.bindDragEvents();
			this.resize();
			this.update();
		},


		renderViewModel: function(){

			this.viewModel = {
				orientation : this.orientation,
				css : [{
					selector : '.tick',
					rule : {
						width: this.pxPerUnit + 'px',
						height: this.rulerWidth * this.pxPerUnit + 'px'
					}
				},{
					selector : '.tick label',
					rule : {
						lineHeight: this.rulerWidth * this.pxPerUnit + 'px'
					}
				},{
					selector : '.tick-full .top, .tick-full .bottom',
					rule : {
						height: this.rulerWidth * this.pxPerUnit * 0.24 + 'px'
					}
				},{
					selector : '.tick-mid .top, .tick-mid .bottom',
					rule : {
						height: this.rulerWidth * this.pxPerUnit * 0.2 + 'px'
					}
				},{
					selector : '.tick-unit .top, .tick-unit .bottom',
					rule : {
						height: this.rulerWidth * this.pxPerUnit * 0.16 + 'px'
					}
				}],
				viewCSS: {}
			};

			if(this.orientation === 'vertical'){
				this.viewModel.viewCSS = {
					width : this.rulerWidth * this.pxPerUnit + 'px',
					height: (this.rulerMeasureUnits * this.pxPerUnit + 2) + 'px'
				};
				this.viewModel.css.push({
					selector : '.ruler',
					rule : {
						marginTop : -1 * this.rulerWidth * this.pxPerUnit + 'px',
						width : (this.rulerMeasureUnits * this.pxPerUnit + 2) + 'px',
						height : this.rulerWidth * this.pxPerUnit + 'px',
					}
				});
			}

			this.renderTicks();
		},

		/**
		 * make an array of label and tick types
		 */
		renderTicks: function(){

			this.viewModel.ticks = [];

			for(var iter = 1; iter < this.rulerMeasureUnits; iter++){
				var tickIter = _.find(this.ticks, function(tick){
					return !(iter % tick.at);
				});

				if(_.isUndefined(tickIter)){
					return;
				}

				this.viewModel.ticks.push({
					at : iter,
					type: tickIter.type
				});
			}

			_.last(_.where(this.viewModel.ticks, {type : this.ticks[0].type})).at += ' ' + this.units;
		},

		renderRuler: function() {

			this.$el.html(this.template(this.viewModel));
			this.$el.css(this.viewModel.viewCSS);

			_(this.viewModel.css).each(function(css){
				this.$el.find(css.selector).css(css.rule);
			}, this);
		},

		panelDown: function(event) {
			if (event.currentTarget === this.el) {
				event.preventDefault();

				this.$el.addClass('dragging');

				this.dragging = true;

				this.fixTouchEvents(event);

				this.dragX = event.pageX;
				this.dragY = event.pageY;
			}
		},

		drag: function(event) {
			if (this.dragging) {

				this.fixTouchEvents(event);

				dx = event.pageX - this.dragX;
				dy = event.pageY - this.dragY;

				if (!this.boxOutOfBounds(this.position.x + dx, this.position.y + dy)) {

					this.position.x += dx;
					this.position.y += dy;
				}

				this.dragX = event.pageX;
				this.dragY = event.pageY;

				this.updateOnNextFrame = true;
			}
		},

		dragEnd: function(event) {
			if (this.dragging) {
				this.dragging = false;
				this.$el.removeClass('dragging');
			}
		},

		update: function(time, delta, paused, timeScale) {

			// If there aren't any changes, don't do anything.
			if (!this.updateOnNextFrame)
				return;

			this.updateOnNextFrame = false;

			translate = 'translateX(' + this.position.x + 'px) translateY(' + this.position.y + 'px)';

			this.$el.css({
				'-webkit-transform': translate,
				'-ms-transform': translate,
				'-o-transform': translate,
				'transform': translate,
			});
		}
	});

	return RulerView;
});

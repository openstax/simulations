define(function (require) {

	'use strict';

	var _ = require('underscore');

	// DEEP EXTEND...you may need to add this line in your sim's config if you are trying to use this:
	// underscoreDeepExtend: '../../bower_components/underscore-deep-extend/index',
	var underscoreDeepExtend = require('underscoreDeepExtend');
	_.mixin({deepExtend: underscoreDeepExtend(_)});

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
				orientation : this.orientation
			};

			this.makeTicks();
			this.makeCSS();	
		},

		renderRuler: function() {

			this.$el.html(this.template(this.viewModel));
			this.$el.css(this.viewModel.viewCSS);

			_(this.viewModel.css).each(function(css){
				this.$el.find(css.selector).css(css.rule);
			}, this);
		},

		/**
		 * make an array of label and tick types
		 */
		makeTicks: function(){

			this.viewModel.ticks = [];

			// counting by one up to the full ruler length...
			for (var iter = 1; iter < this.rulerMeasureUnits; iter++){

				// find out the kind of tick that is at this iteration
				var tickIter = _.find(this.ticks, function(tick){
					return !(iter % tick.at);
				});

				// if a tick type does not make, go on to the next iteration
				// without adding a tick for this iteration
				if (_.isUndefined(tickIter)){
					continue;
				}

				// add the new tick type and value
				this.viewModel.ticks.push({
					at : iter,
					type: tickIter.type
				});
			}

			// modify the last "full" tick to include the unit label
			_.last(_.where(this.viewModel.ticks, {type : this.ticks[0].type})).at += ' ' + this.units;
		},

		/**
		 * Adjust css on view model for property dependent visual details
		 */
		makeCSS: function(){

			this.viewModel.viewCSS = {};

			this.viewModel.css = [{
				// ensures proper width of tick.
				// Font-size is crucial -- set to full "width" of ruler so that child elements
				// such as label and ticks will all be set proportionally by "ems" in css.
				selector : '.tick',
				rule : {
					width: this.pxPerUnit + 'px',
					fontSize : this.rulerWidth * this.pxPerUnit + 'px'
				}
			}];

			// tricky css stuff for when the ruler is vertical
			if (this.orientation === 'vertical') {
				this.viewModel.viewCSS = {
					width : this.rulerWidth * this.pxPerUnit + 'px',
					height: (this.rulerMeasureUnits * this.pxPerUnit + 2) + 'px'
				};
				this.viewModel.css.push({
					selector : '.ruler',
					rule : {
						marginTop : -1 * this.rulerWidth * this.pxPerUnit + 'px',
						width: (this.rulerMeasureUnits * this.pxPerUnit + 2) + 'px',
						height: this.rulerWidth * this.pxPerUnit + 'px',
					}
				});
			}
			else if (this.orientation === 'horizontal') {
				this.viewModel.viewCSS = {
					height: this.rulerWidth * this.pxPerUnit + 'px',
					width: (this.rulerMeasureUnits * this.pxPerUnit + 2) + 'px'
				};
				this.viewModel.css.push({
					selector: '.ruler',
					rule: {
						width: (this.rulerMeasureUnits * this.pxPerUnit + 2) + 'px',
						height: this.rulerWidth * this.pxPerUnit + 'px',
					}
				});
			}
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

		setPosition: function(x, y) {
			this.position.x = x;
			this.position.y = y;
			this.updateOnNextFrame = true;
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

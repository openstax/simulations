define(function(require) {

	'use strict';

	var _ = require('underscore');

	var GraphView = require('views/graph');

	var html = require('text!templates/graph.html');

	/**
	 * StaticGraphView defines a template and certain behaviors of the UI,
	 *   but it doesn't define how the data points are calculated.  Before
	 *   the StaticGraphView is useful, these functions must be filled:
	 *
	 *     + initPoints
	 *     + calculatePoints
	 */
	var StaticGraphView = GraphView.extend({

		template: _.template(html),

		tagName: 'figure',

		events: {
			'click .graph-show-button' : 'show',
			'click .graph-hide-button' : 'hide'
		},

		initialize: function(options) {
			GraphView.prototype.initialize.apply(this, [options]);

			// Don't start drawing the curve until the graph is showing
			this.graphVisible = false;
		},

		/**
		 * Called after every component on the page has rendered to make sure
		 *   things like widths and heights and offsets are correct.
		 */
		postRender: function() {
			GraphView.prototype.postRender.apply(this);
			this.$el.removeClass('open');
		},

		show: function(event) {
			if (this.toggling)
				return;

			this.toggling = true;

			this.graphVisible = true;

			this.$el.removeClass('initial');
			this.$el.removeClass('closed');
			this.$el.addClass('open');

			this.$hideButton.show();
			this.$showButton.addClass('clicked');

			this.duration = this.animationDuration();
			
			var self = this;
			setTimeout(function(){
				self._afterShow();
			}, this.duration);
		},

		_afterShow: function() {
			this.$showButton.hide();
			this.$showButton.removeClass('clicked');
			this.resize();
			this.toggling = false;
		},

		hide: function(event) {
			if (this.toggling)
				return;
			
			this.toggling = true;

			this.$el.removeClass('open');
			this.$el.addClass('closed');
			this.$showButton.show();
			this.$showButton.addClass('reenabled');
			this.$hideButton.hide();

			var self = this;
			setTimeout(function(){
				self._afterHide();
			}, this.duration);
		},

		_afterHide: function() {
			this.graphVisible = false;
			this.$showButton.removeClass('reenabled');
			this.toggling = false;
		},

		animationDuration: function() {
			var duration = this.$showButton.css('animation-duration');
			if (duration.indexOf('ms') !== -1)
				return parseInt(duration);
			else
				return parseFloat(duration) * 1000;
		},
	});

	return StaticGraphView;
});

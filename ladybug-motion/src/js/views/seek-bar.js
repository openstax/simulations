define(function(require) {

	'use strict';

	var $        = require('jquery');
	var _        = require('underscore');
	var Backbone = require('backbone'); Backbone.$ = $;

	require('less!styles/seek-bar');

	var html = require('text!templates/seek-bar.html');

	/**
	 * 
	 */
	var SeekBarView = Backbone.View.extend({

		className: 'seek-bar-view',

		initialize: function(options) {

			// Default values
			options = _.extend({
				
			}, options);
		},

		/**
		 * Renders the contents of the view
		 */
		render: function() {
			this.$el.html(html);

			return this;
		},

		/**
		 * Called after every component on the page has rendered to make sure
		 *   things like widths and heights and offsets are correct.
		 */
		postRender: function() {
			this.resize();
		}

	});

	return SeekBarView;
});

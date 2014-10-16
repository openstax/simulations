define(function(require) {

	'use strict';

	var _ = require('underscore');

	var MovingManSimView = require('views/sim');

	// HTML
	var playbackControlsHtml = require('text!templates/playback-controls.html');

	// CSS
	require('less!styles/playback-controls');

	/**
	 *
	 */
	var ChartsSimView = MovingManSimView.extend({

		events: _.extend(MovingManSimView.prototype.events, {
			
		}),

		initialize: function(options) {
			options = _.extend({
				title: 'Charts',
				name:  'charts'
			}, options);
			
			MovingManSimView.prototype.initialize.apply(this, [ options ]);
		},

		/**
		 * Renders everything
		 */
		render: function() {
			MovingManSimView.prototype.render.apply(this);

			this.renderPlaybackControls();

			return this;
		},

		/**
		 * Renders the playback controls
		 */
		renderPlaybackControls: function() {
			this.$('#playback-controls-placeholder').replaceWith(playbackControlsHtml);

			// Intialize controls
		}

	});

	return ChartsSimView;
});

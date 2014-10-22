define(function(require) {

	'use strict';

	var _ = require('underscore');

	var MovingManSimView = require('views/sim');
	var SceneView        = require('views/scene');

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
		 * Initializes the SceneView.
		 */
		initSceneView: function() {
			this.sceneView = new SceneView({
				simulation: this.simulation,
				compact: true
			});
		},

		/**
		 * Renders everything
		 */
		render: function() {
			MovingManSimView.prototype.render.apply(this);

			this.renderPlaybackControls();

			this.$el.find('.variable-controls').addClass('compact');

			return this;
		},

		/**
		 * Renders the playback controls
		 */
		renderPlaybackControls: function() {
			this.$('#playback-controls-placeholder').replaceWith(playbackControlsHtml);

			// Intialize controls
		},

		/**
		 * Default intro view needs horizontal sliders, while the charts
		 *   view has more compact variable controls with a vertical slider.
		 */
		getSliderOptions: function() {
			return {
				start: 0,
				range: {
					min: -10,
					max:  10
				},
				orientation: 'vertical'
			};
		},

	});

	return ChartsSimView;
});

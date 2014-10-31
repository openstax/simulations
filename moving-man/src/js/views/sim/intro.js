define(function(require) {

	'use strict';

	var _ = require('underscore');

	var MovingManSimulation = require('models/moving-man-simulation');
	var MovingManSimView    = require('views/sim');

	var IntroSimView = MovingManSimView.extend({

		events: _.extend(MovingManSimView.prototype.events, {
			
		}),

		initialize: function(options) {
			options = _.extend({
				title: 'Introduction',
				name:  'intro'
			}, options);
			
			MovingManSimView.prototype.initialize.apply(this, [ options ]);
		},

		/**
		 * Initializes the Simulation.
		 */
		initSimulation: function() {
			this.simulation = new MovingManSimulation(null, {
				noRecording: true
			});
		},

	});

	return IntroSimView;
});

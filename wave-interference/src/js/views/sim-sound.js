define([
	'jquery', 
	'underscore', 
	'backbone',

	'views/sim',
	'models/sim-sound'
], function ($, _, Backbone, SimView, SoundSimulation) {

	'use strict';

	var SoundModuleView = SimView.extend({

		initialize: function(options) {
			options = _.extend({
				waveSimulation: new SoundSimulation()
			}, options);
			
			SimView.prototype.initialize.apply(this, [ options ]);

			this.model = new Backbone.Model({
				title: 'Sound'
			});
		},

	});

	return SoundModuleView;
});

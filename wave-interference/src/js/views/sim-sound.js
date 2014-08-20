define([
	'jquery', 
	'underscore', 
	'backbone',
	'pixi',

	'views/sim',
	'models/wave-sim-sound'
], function ($, _, Backbone, PIXI, SimView, SoundSimulation) {

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

		update: function(time, delta) {
			SimView.prototype.update.apply(this, [time, delta]);
		}
	});

	return SoundModuleView;
});

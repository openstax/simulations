define([
	'jquery', 
	'underscore', 
	'backbone',

	'views/sim',
], function ($, _, Backbone, SimView) {

	'use strict';

	var SoundModuleView = SimView.extend({

		initialize: function(options) {
			SimView.prototype.initialize.apply(this, [ options ]);

			this.model = new Backbone.Model({
				title: 'Sound'
			});
		},

	});

	return SoundModuleView;
});

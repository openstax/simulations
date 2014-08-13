define([
	'jquery', 
	'underscore', 
	'backbone',

	'views/sim',
], function ($, _, Backbone, SimView) {

	'use strict';

	var LightModuleView = SimView.extend({

		initialize: function(options) {
			SimView.prototype.initialize.apply(this, [ options ]);

			this.model = new Backbone.Model({
				title: 'Light'
			});
		},

	});

	return LightModuleView;
});

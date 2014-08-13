define([
	'jquery', 
	'underscore', 
	'backbone',

	'module',
], function ($, _, Backbone, ModuleView) {

	'use strict';

	var SoundModuleView = ModuleView.extend({

		initialize: function(options) {
			Module.prototype.initialize.apply(this, [ options ]);

			this.model = new Backbone.Model({
				title: 'Sound'
			});
		},

	});

	return SoundModuleView;
});
